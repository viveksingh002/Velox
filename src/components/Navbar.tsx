"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Fleet", href: "#fleet" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Support", href: "#support" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }}
      className="px-4 pt-4"
    >
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`
          mx-auto max-w-6xl flex items-center justify-between
          px-6 py-3 rounded-2xl border transition-all duration-300
          ${
            scrolled
              ? "bg-white/70 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl"
              : "bg-white/40 border-white/30 backdrop-blur-md"
          }
        `}
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-[17px] font-bold tracking-[-0.5px] text-slate-900 select-none italic"
        >
          Vëlox
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[13.5px] text-slate-500 hover:text-slate-900 transition-colors duration-200 font-normal"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            href="/signin"
            className="text-[13.5px] font-medium text-slate-700 px-4 py-2 rounded-lg hover:bg-white/80 transition-all duration-200"
          >
            Sign in
          </Link>
          <Link
            href="/book"
            className="text-[13.5px] font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-200 shadow-[0_1px_3px_rgba(37,99,235,0.35)]"
          >
            Book now
          </Link>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden flex flex-col gap-[5px] p-1.5"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.22 }}
            className="block w-5 h-[1.5px] bg-slate-800 rounded-full origin-center"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.18 }}
            className="block w-5 h-[1.5px] bg-slate-800 rounded-full"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.22 }}
            className="block w-5 h-[1.5px] bg-slate-800 rounded-full origin-center"
          />
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 mx-auto max-w-6xl bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] overflow-hidden"
          >
            <ul className="flex flex-col divide-y divide-slate-100">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-6 py-4 text-[14px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <Link
                href="/signin"
                className="flex-1 text-center text-[13.5px] font-medium text-slate-700 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Sign in
              </Link>
              <Link
                href="/book"
                className="flex-1 text-center text-[13.5px] font-medium text-white bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl transition-all shadow-[0_1px_3px_rgba(37,99,235,0.35)]"
              >
                Book now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}