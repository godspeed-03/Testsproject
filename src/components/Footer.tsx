"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, FileText, Mail } from "lucide-react";
import BrandLogoIcon from "./BrandLogoIcon";

export default function Footer() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user token cookie exists
    const hasToken = document.cookie.split(";").some((item) => item.trim().startsWith("token="));
    setIsLoggedIn(hasToken);
  }, [pathname]);

  // Hide footer when user is logged in or navigating app workspace pages
  const isAppRoute =
    pathname.startsWith("/tracker") ||
    pathname.startsWith("/syllabus") ||
    pathname.startsWith("/tests") ||
    pathname.startsWith("/routine") ||
    pathname.startsWith("/timetable");

  if (isLoggedIn || isAppRoute) {
    return null;
  }

  return (
    <footer className="w-full bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-auto transition-colors">
      <div className="max-w-[1480px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Description */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200">
            <BrandLogoIcon size="sm" />
            <span>UPSC tracker</span>
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Executive study management suite for UPSC Civil Services Examination (CSE) aspirants.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
          <Link
            href="/privacy-policy"
            className="hover:text-[#7C3AED] dark:hover:text-violet-400 transition-colors flex items-center gap-1.5 font-medium"
          >
            <Shield size={14} />
            <span>Privacy Policy</span>
          </Link>

          <Link
            href="/terms-of-service"
            className="hover:text-[#7C3AED] dark:hover:text-violet-400 transition-colors flex items-center gap-1.5 font-medium"
          >
            <FileText size={14} />
            <span>Terms of Service</span>
          </Link>

          <a
            href="mailto:satyam2001anand@gmail.com"
            className="hover:text-[#7C3AED] dark:hover:text-violet-400 transition-colors flex items-center gap-1.5 font-medium"
          >
            <Mail size={14} />
            <span>Support</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-slate-500 dark:text-slate-400 text-xs text-center md:text-right">
          © {new Date().getFullYear()} nxtdev.in. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
