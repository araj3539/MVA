"use client";

import Link from "next/link";
import { Activity, Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand Section */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-sky-900/20">
              <Activity size={20} />
            </div>
            <span className="text-2xl font-serif font-bold text-white tracking-tight">
              MVA<span className="text-sky-500">Health</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400">
            Pioneering AI-driven healthcare. We bridge the gap between patients and specialists through secure, intelligent voice technology.
          </p>
          <div className="flex gap-4 pt-2">
            <SocialIcon icon={Twitter} />
            <SocialIcon icon={Facebook} />
            <SocialIcon icon={Instagram} />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Patient Services</h4>
          <ul className="space-y-3 text-sm">
            <li><FooterLink href="/patient/doctors">Find a Doctor</FooterLink></li>
            <li><FooterLink href="/patient/dashboard">My Appointments</FooterLink></li>
            <li><FooterLink href="/symptom-checker">AI Symptom Checker</FooterLink></li>
            <li><FooterLink href="/urgent-care">Urgent Care</FooterLink></li>
          </ul>
        </div>

        {/* Legal / Support */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Support</h4>
          <ul className="space-y-3 text-sm">
            <li><FooterLink href="/help">Help Center</FooterLink></li>
            <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
            <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
            <li><FooterLink href="/contact">Contact Administration</FooterLink></li>
          </ul>
        </div>

        {/* Contact Widget */}
        <div className="space-y-6">
          <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Contact Us</h4>
          <div className="flex items-start gap-3 text-sm text-slate-400">
            <Phone size={18} className="text-sky-500 mt-0.5" />
            <span>+1 (888) 123-4567<br/>Mon-Fri, 9am - 6pm EST</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-slate-400">
            <Mail size={18} className="text-sky-500 mt-0.5" />
            <span>support@mvahealth.com</span>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-800 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} MVA Health Platform. HIPAA Compliant.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon: Icon }: { icon: any }) {
  return (
    <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-600 hover:text-white transition-all duration-300">
      <Icon size={16} />
    </button>
  );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="block hover:text-sky-400 hover:translate-x-1 transition-all duration-200">
      {children}
    </Link>
  );
}