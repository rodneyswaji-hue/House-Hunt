# apps/houses/upload.py
# Generates S3 presigned URLs for direct browser-to-S3 uploads.
# Returns CloudFront URLs for serving — direct S3 URLs are never exposed.
# AWS credentials live here in Django only — Next.js never sees them.

import uuid
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

ALLOWED_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
}
MAX_SIZE_BYTES = 50 * 1024 * 1024  # 50MB


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_upload_url(request):
    """
    POST /api/houses/upload-url/
    Body: { fileName, fileType, fileSize }
    Returns: { uploadUrl, publicUrl }

    uploadUrl  — presigned S3 PUT URL (browser uploads directly, expires in 5 min)
    publicUrl  — CloudFront URL saved permanently with the house record
    """
    file_name = request.data.get("fileName", "")
    file_type = request.data.get("fileType", "")
    file_size = request.data.get("fileSize", 0)

    # ── Validation ────────────────────────────────────────────────────────
    if file_type not in ALLOWED_TYPES:
        return Response(
            {"error": "File type not allowed. Use JPG, PNG, WEBP, or MP4."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        file_size = int(file_size)
    except (TypeError, ValueError):
        return Response(
            {"error": "Invalid file size."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if file_size > MAX_SIZE_BYTES:
        return Response(
            {"error": "File too large. Maximum size is 50MB."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ── Generate unique S3 key ────────────────────────────────────────────
    ext = ALLOWED_TYPES[file_type]
    key = f"houses/{uuid.uuid4().hex}.{ext}"

    # ── Create presigned S3 upload URL ────────────────────────────────────
    try:
        s3_client = boto3.client(
            "s3",
            region_name=settings.AWS_S3_REGION_NAME,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )

        # Presigned URL points directly at S3 for the upload
        upload_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.AWS_STORAGE_BUCKET_NAME,
                "Key": key,
                "ContentType": file_type,
            },
            ExpiresIn=300,  # 5 minutes
        )

        # Public URL uses CloudFront domain if configured, S3 as fallback
        # (fallback is useful during local development)
        if settings.CLOUDFRONT_DOMAIN:
            public_url = f"https://{settings.CLOUDFRONT_DOMAIN}/{key}"
        else:
            public_url = (
                f"https://{settings.AWS_STORAGE_BUCKET_NAME}"
                f".s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{key}"
            )

        return Response({"uploadUrl": upload_url, "publicUrl": public_url})

    except ClientError as e:
        return Response(
            {"error": f"Could not generate upload URL: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )