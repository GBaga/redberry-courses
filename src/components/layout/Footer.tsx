import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

// Raw SVG icons for brands since Lucide removed them
const Facebook = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const Twitter = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
);
const Instagram = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const Linkedin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-[1440px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-black text-xl leading-none">
                B
              </div>
              <span className="font-bold text-xl text-gray-900 group-hover:text-indigo-600 transition-colors">
                RedClass
              </span>
            </Link>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Your learning journey in web design, development, business, and more. Find the skills you need.
            </p>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-indigo-600 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-amber-500 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-indigo-600 transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-sky-500 transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Explore Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Explore</h3>
            <ul className="space-y-3">
              <li><Link href="/courses" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Browse Courses</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Enrolled Courses</Link></li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">My Profile</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Certificates</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" /> contact@redclass.com
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="w-4 h-4" /> +995 555 12 34 56
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> 123 Aghmashenebeli Ave,<br/>Tbilisi, Georgia
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>Copyright © {new Date().getFullYear()} Redberry International.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms and Conditions</a>
            <span>|</span>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
