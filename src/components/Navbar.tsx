"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const navLinks = [
  { label: "Fleet", href: "#fleet" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Support", href: "#support" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    window.location.href = "/";
  };

  // Get initials from name or email
  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || "";
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return name[0]?.toUpperCase() || "U";
  };

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  };

  return (
    <>
      <style>{`
        .nav-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0071e3, #5ac8fa);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px solid rgba(0,113,227,0.4);
          transition: all 0.2s;
          flex-shrink: 0;
          font-family: 'Inter', sans-serif;
          user-select: none;
        }
        .nav-avatar:hover {
          border-color: rgba(0,113,227,0.8);
          box-shadow: 0 0 16px rgba(0,113,227,0.4);
          transform: scale(1.05);
        }

        .nav-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 220px;
          background: rgba(14,14,26,0.98);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 0.5rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03);
          z-index: 9999;
          backdrop-filter: blur(20px);
          font-family: 'Inter', sans-serif;
        }

        .nav-dropdown-user {
          padding: 0.75rem 0.85rem 0.6rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 0.4rem;
        }

        .nav-dropdown-name {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nav-dropdown-role {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1.5px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          font-size: 13.5px;
          color: rgba(255,255,255,0.65);
          cursor: pointer;
          transition: all 0.18s;
          text-decoration: none;
          font-weight: 500;
          width: 100%;
          background: none;
          border: none;
          font-family: 'Inter', sans-serif;
          text-align: left;
        }
        .nav-dropdown-item:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }
        .nav-dropdown-item svg {
          opacity: 0.5;
          flex-shrink: 0;
          transition: opacity 0.18s;
        }
        .nav-dropdown-item:hover svg { opacity: 0.9; }

        .nav-dropdown-item.logout {
          color: rgba(255,100,100,0.7);
          margin-top: 0.3rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 0.85rem;
        }
        .nav-dropdown-item.logout:hover {
          background: rgba(239,68,68,0.08);
          color: #fca5a5;
        }
        .nav-dropdown-item.logout svg { opacity: 0.6; }
        .nav-dropdown-item.logout:hover svg { opacity: 1; }
      `}</style>

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
            ${scrolled
              ? "bg-white/70 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl"
              : "bg-white/40 border-white/30 backdrop-blur-md"
            }
          `}
        >
          {/* Logo */}
          <Link href="/" className="text-[17px] font-bold tracking-[-0.5px] text-slate-900 select-none italic">
            Vëlox
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[13.5px] text-slate-500 hover:text-slate-900 transition-colors duration-200 font-normal">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              // ── Logged in — Avatar + Dropdown ──
              <div className="relative" ref={dropdownRef}>
                <div
                  className="nav-avatar"
                  onClick={() => setDropdownOpen((p) => !p)}
                  title={getDisplayName()}
                >
                  {getInitials()}
                </div>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      className="nav-dropdown"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {/* User info */}
                      <div className="nav-dropdown-user">
                        <div className="nav-dropdown-name">{getDisplayName()}</div>
                        <div className="nav-dropdown-role">User</div>
                      </div>

                      {/* My Bookings */}
                      <Link href="/dashboard" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2"/>
                          <path d="M16 2v4M8 2v4M3 10h18"/>
                        </svg>
                        My Bookings
                      </Link>

                      {/* Profile */}
                      <Link href="/profile" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="4"/>
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                        Profile
                      </Link>

                      {/* Logout */}
                      <button className="nav-dropdown-item logout" onClick={handleLogout}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // ── Not logged in ──
              <>
                <Link href="/signin" className="text-[13.5px] font-medium text-slate-700 px-4 py-2 rounded-lg hover:bg-white/80 transition-all duration-200">
                  Sign in
                </Link>
                <Link href="/signin" className="text-[13.5px] font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-200 shadow-[0_1px_3px_rgba(37,99,235,0.35)]">
                  Book now
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden flex flex-col gap-[5px] p-1.5"
            aria-label="Toggle menu"
          >
            <motion.span animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.22 }} className="block w-5 h-[1.5px] bg-slate-800 rounded-full origin-center"/>
            <motion.span animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.18 }} className="block w-5 h-[1.5px] bg-slate-800 rounded-full"/>
            <motion.span animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.22 }} className="block w-5 h-[1.5px] bg-slate-800 rounded-full origin-center"/>
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
                    <Link href={link.href} onClick={() => setMenuOpen(false)} className="block px-6 py-4 text-[14px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
                {user ? (
                  <button onClick={handleLogout} className="flex-1 text-center text-[13.5px] font-medium text-red-500 py-2.5 rounded-xl border border-red-100 hover:bg-red-50 transition-all">
                    Logout
                  </button>
                ) : (
                  <>
                    <Link href="/signin" className="flex-1 text-center text-[13.5px] font-medium text-slate-700 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                      Sign in
                    </Link>
                    <Link href="/signin" className="flex-1 text-center text-[13.5px] font-medium text-white bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl transition-all shadow-[0_1px_3px_rgba(37,99,235,0.35)]">
                      Book now
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}