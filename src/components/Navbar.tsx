'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'dim' | 'nord'>('dim');

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as 'dim' | 'nord') || 'dim';
    setTheme(stored);
    document.documentElement.setAttribute('data-theme', stored);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dim' ? 'nord' : 'dim';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-base-100/80 backdrop-blur-xl shadow-lg border-b border-base-300/50'
          : 'bg-transparent'
        }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 transition-transform duration-200 group-hover:scale-105">
              <svg
                className="h-5 w-5 text-primary-content"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gradient">Awas</span>
            </span>
          </Link>

          {/* Center Nav */}
          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className="btn btn-ghost btn-sm rounded-lg text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
            >
              Home
            </Link>
            <Link
              href="/search"
              className="btn btn-ghost btn-sm rounded-lg text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
            >
              Search
            </Link>
            <button className="btn btn-ghost btn-sm rounded-lg text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
              Saved
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">

            <button
              id="theme-toggle"
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle btn-sm swap swap-rotate"
              aria-label="Toggle theme"
            >
              {theme === 'dim' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            <Link href="/search" className="btn btn-primary btn-sm rounded-lg shadow-md shadow-primary/20 hidden sm:inline-flex">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Find Properties
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
