import Link from "next/link";
import { Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-blue-600 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-lg font-bold mb-2">HouseHunt</h3>
          <p className="text-blue-100 text-sm leading-relaxed">
            Connecting tenants and landlords across Kenya. No agents. No stress. Just your next home.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-lg font-bold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-sm text-blue-100">
            <li><Link href="/" className="hover:text-white transition">Home</Link></li>
            <li><Link href="/listings" className="hover:text-white transition">Browse Listings</Link></li>
            <li><Link href="/landlord/login" className="hover:text-white transition">Landlord Login</Link></li>
            <li><Link href="/landlord/register" className="hover:text-white transition">List Your Property</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-bold mb-2">Contact Us</h3>
          <div className="space-y-2">
            <a
              href="tel:+254791288900"
              className="flex items-center gap-2 text-sm text-blue-100 hover:text-white transition"
            >
              <Phone size={15} />
              +254 791 288 900
            </a>
            <a
              href="mailto:info@househunt.co.ke"
              className="flex items-center gap-2 text-sm text-blue-100 hover:text-white transition"
            >
              <Mail size={15} />
              info@househunt.co.ke
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-blue-500 px-4 py-4 text-center text-xs text-blue-200">
        <p>
          © {new Date().getFullYear()} HouseHunt Kenya. Powered by{" "}
          <a href="#" className="underline hover:text-white">Rodmas</a>.{" "}
          <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>
        </p>
      </div>
    </footer>
  );
}