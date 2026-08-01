import Link from 'next/link';
import { Target, Shield, FileText, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 border-t border-slate-800 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-[1480px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Description */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <div className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs">
              <Target size={14} />
            </div>
            <span>UPSC Tracker</span>
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <p className="text-slate-400 text-xs">
            Executive preparation suite for UPSC CSE aspirants.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
          <Link 
            href="/privacy-policy" 
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium"
          >
            <Shield size={14} />
            <span>Privacy Policy</span>
          </Link>

          <Link 
            href="/terms-of-service" 
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium"
          >
            <FileText size={14} />
            <span>Terms of Service</span>
          </Link>

          <a 
            href="mailto:satyam2001anand@gmail.com" 
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium"
          >
            <Mail size={14} />
            <span>Support</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-slate-400 text-xs text-center md:text-right">
          © {new Date().getFullYear()} nxtdev.in. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
