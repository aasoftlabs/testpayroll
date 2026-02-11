import React from "react";
import Link from "next/link";
import { version } from "../../../package.json";
import PoweredLogo from "../Powered";

export default function Footer({ companyName, brandColor }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="w-full sm:px-8 md:px-12 lg:px-32 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-sm text-slate-500">
            &copy; {currentYear}{" "}
            <span
              className="font-semibold"
              style={{ color: brandColor || "#4338ca" }}
            >
              {companyName || "TechSer Payroll"}
            </span>{" "}
            All rights reserved.
          </div>
          {/* footer Links */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Link
              href="/releases"
              className="hover:text-(--brand-color) transition-colors"
            >
              v{version}
            </Link>
            <Link
              href="/privacy"
              className="hover:text-(--brand-color) transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-(--brand-color) transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/support"
              className="hover:text-(--brand-color) transition-colors"
            >
              Support
            </Link>
          </div>
          {/* Powered By */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <span className="text-slate-400 text-sm">Powered by</span>
            <PoweredLogo />
          </div>
        </div>
      </div>
    </footer>
  );
}
