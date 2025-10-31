'use client';

import Link from 'next/link';
import { Mail, FileText, Shield, Info, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: '/contact', label: 'Contact', icon: Mail },
    { href: '/privacy-policy', label: 'Privacy Policy', icon: Shield },
    { href: '/terms-of-service', label: 'Terms of Service', icon: FileText },
    { href: '/sms-signup', label: 'SMS Opt-In', icon: MessageSquare },
    { href: '/about', label: 'About', icon: Info },
  ];

  return (
    <footer className="relative w-full mt-auto">
      {/* Separator line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent mb-8 sm:mb-12" />
      
      {/* Footer content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8">
          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8">
            {footerLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm sm:text-base font-medium
                      text-gray-300 hover:text-white
                      transition-all duration-300
                      focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg px-3 py-2
                      relative"
                    style={{
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-orange-400" />
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 
                        group-hover:w-full transition-all duration-300 group-hover:shadow-[0_0_8px_rgba(251,146,60,0.4)]" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-center"
          >
            <p
              className="text-xs sm:text-sm font-normal text-gray-400"
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              © {currentYear} AICBOLT. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

