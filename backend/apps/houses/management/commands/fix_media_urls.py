# apps/houses/management/commands/fix_media_urls.py
#
# Rewrites stored media URLs to point at the CloudFront domain.
#
# The S3 bucket only grants s3:GetObject to the CloudFront service principal,
# so direct https://<bucket>.s3.<region>.amazonaws.com/... URLs return 403 and
# images render broken. Rows written while CLOUDFRONT_DOMAIN was unset kept
# those direct S3 URLs; this repoints them.
#
#   python manage.py fix_media_urls --dry-run
#   python manage.py fix_media_urls

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.houses.models import HouseImage, HouseVideo
from apps.feedback.models import ReviewProofImage


class Command(BaseCommand):
    help = "Repoint stored S3 media URLs at the configured CloudFront domain."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would change without writing.",
        )

    def handle(self, *args, **options):
        domain = settings.CLOUDFRONT_DOMAIN
        if not domain:
            raise CommandError(
                "CLOUDFRONT_DOMAIN is not set. Add it to backend/.env first, e.g.\n"
                "  CLOUDFRONT_DOMAIN=d1234abcd.cloudfront.net"
            )

        bucket = settings.AWS_STORAGE_BUCKET_NAME
        region = settings.AWS_S3_REGION_NAME
        # Both S3 URL styles that may have been stored.
        prefixes = [
            f"https://{bucket}.s3.{region}.amazonaws.com/",
            f"https://{bucket}.s3.amazonaws.com/",
        ]
        dry = options["dry_run"]

        total = 0
        for model, label in (
            (HouseImage, "house image"),
            (HouseVideo, "house video"),
            (ReviewProofImage, "review proof image"),
        ):
            for obj in model.objects.all():
                for prefix in prefixes:
                    if obj.url.startswith(prefix):
                        new_url = f"https://{domain}/{obj.url[len(prefix):]}"
                        self.stdout.write(f"  {label} {obj.pk}: {obj.url}\n    -> {new_url}")
                        if not dry:
                            obj.url = new_url
                            obj.save(update_fields=["url"])
                        total += 1
                        break

        if total == 0:
            self.stdout.write(self.style.SUCCESS("Nothing to change — no direct S3 URLs found."))
        elif dry:
            self.stdout.write(self.style.WARNING(f"\n{total} URL(s) would be rewritten (dry run)."))
        else:
            self.stdout.write(self.style.SUCCESS(f"\nRewrote {total} URL(s)."))
