import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Logo } from '../components/brand/Logo';
import { PageLoader } from '../components/ui';

export function AuthLayout() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#f6f7ff] via-[#edf1fe] to-[#f4f2fe] dark:bg-[#080a18] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-36 -left-20 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-violet-200/35 via-purple-100/20 to-transparent blur-[120px] dark:from-purple-900/15" />
        <div className="absolute -bottom-40 -right-20 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-blue-200/30 via-indigo-100/20 to-transparent blur-[120px] dark:from-indigo-950/20" />
      </div>

      {/* Main Unified 2-Column Container matching Reference Image */}
      <div className="relative mx-auto w-full max-w-[1100px] rounded-[32px] overflow-hidden bg-white shadow-[0_25px_70px_-15px_rgba(79,70,229,0.14),0_0_0_1px_rgba(226,232,240,0.8)] dark:bg-surface dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] grid grid-cols-1 lg:grid-cols-[1.28fr_1fr] min-h-[640px]">
        {/* Left Branding Panel (55-60% width) - Full bleed without white gaps, sharp text */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#edf2fe] via-[#edf0fe] to-[#f4f0fe] p-8 sm:p-12 lg:p-14 flex flex-col justify-between items-center min-h-[460px] lg:min-h-[640px] dark:from-surface dark:to-surface-subtle">
          
          {/* Top-left organic curved blob shape */}
          <svg
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute top-0 left-0 w-60 h-60"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="topLeftBlob" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.65" />
                <stop offset="50%" stopColor="#dbeafe" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 0 L220 0 C 210 90, 180 170, 95 185 C 35 195, 0 160, 0 130 Z"
              fill="url(#topLeftBlob)"
            />
          </svg>

          {/* Top-right subtle dot matrix (5 cols x 4 rows) */}
          <div className="pointer-events-none absolute top-32 right-8 z-0 grid grid-cols-5 gap-2.5 opacity-30" aria-hidden="true">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className="h-1 w-1 rounded-full bg-[#818cf8]" />
            ))}
          </div>

          {/* Decorative Blue & Purple Gradient Waves along the bottom */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[280px] lg:h-[320px] w-full overflow-hidden" aria-hidden="true">
            <svg
              viewBox="0 0 650 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              <defs>
                {/* Gradient 1: Soft Purple to Lavender overlay */}
                <linearGradient id="wavePurpleLavender" x1="0%" y1="10%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.75" />
                  <stop offset="50%" stopColor="#c084fc" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.4" />
                </linearGradient>

                {/* Gradient 2: Soft Periwinkle accent wave */}
                <linearGradient id="wavePeriwinkle" x1="10%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
                  <stop offset="60%" stopColor="#a78bfa" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.3" />
                </linearGradient>

                {/* Gradient 3: Vibrant Blue Indigo Wave */}
                <linearGradient id="waveBlueIndigo" x1="0%" y1="0%" x2="100%" y2="90%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                  <stop offset="45%" stopColor="#6366f1" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.75" />
                </linearGradient>

                {/* Gradient 4: Electric Blue ribbon at bottom */}
                <linearGradient id="waveCyanBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Wave Layer 1 (Back, sweeping across from middle to right) */}
              <path
                d="M0 160 C 140 120, 260 250, 420 200 C 520 165, 590 190, 650 215 L 650 320 L 0 320 Z"
                fill="url(#wavePurpleLavender)"
              />

              {/* Wave Layer 2 (Soft overlay wave) */}
              <path
                d="M0 210 C 120 170, 240 280, 400 230 C 510 195, 580 230, 650 250 L 650 320 L 0 320 Z"
                fill="url(#wavePeriwinkle)"
              />

              {/* Wave Layer 3 (Middle rich Blue-Indigo wave) */}
              <path
                d="M0 190 C 110 140, 230 260, 380 220 C 470 190, 560 240, 650 260 L 650 320 L 0 320 Z"
                fill="url(#waveBlueIndigo)"
              />

              {/* Wave Layer 4 (Front swooping wave at bottom left) */}
              <path
                d="M0 220 C 70 185, 160 225, 270 265 C 370 295, 510 270, 650 290 L 650 320 L 0 320 Z"
                fill="url(#waveCyanBlue)"
              />

              {/* Curved accent stroke line for subtle depth */}
              <path
                d="M0 190 C 110 140, 230 260, 380 220 C 470 190, 560 240, 650 260"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>

          {/* Bottom-left dot grid matching reference image (5 cols x 3 rows) */}
          <div className="pointer-events-none absolute bottom-8 left-8 z-10 grid grid-cols-5 gap-2.5 opacity-65" aria-hidden="true">
            {Array.from({ length: 15 }).map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#60a5fa]" />
            ))}
          </div>

          {/* Top Logo - Centered & Enlarged matching Reference Screenshot 2 */}
          <div className="relative z-10 pt-6 sm:pt-8 flex justify-center w-full">
            <Logo size="hero" />
          </div>

          {/* Heading and Pill Label - Centered & Razor Sharp HTML */}
          <div className="relative z-10 flex flex-col items-center text-center my-auto py-4 sm:py-6 max-w-[440px]">
            {/* Pill-shaped label with green status indicator */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100/90 bg-white/95 px-4 py-1.5 shadow-[0_2px_8px_rgba(99,102,241,0.06)] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#10b981]" />
              <span className="text-xs sm:text-[13px] font-bold text-[#4f46e5]">Next-Gen Enterprise CRM 2.0</span>
            </div>

            {/* Main Heading */}
            <h1 className="mt-4 sm:mt-5 text-center font-black tracking-tight leading-[1.18]">
              <span className="text-[#0a0f29] dark:text-white block text-2xl sm:text-3xl lg:text-[38px]">
                Lead Management
              </span>
              <span className="block mt-1 sm:mt-1.5 text-2xl sm:text-3xl lg:text-[38px] font-black bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#3b82f6] bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
          </div>

          {/* Bottom spacing placeholder */}
          <div className="relative z-10 h-6 sm:h-10" />
        </section>

        {/* Right Section: Clean White Login Card (40-45% width) */}
        <section className="relative bg-white p-7 sm:p-10 lg:p-12 flex flex-col justify-center dark:bg-surface rounded-t-[32px] lg:rounded-t-none lg:rounded-l-[32px] shadow-[-12px_0_35px_-8px_rgba(79,70,229,0.05)]">
          {/* Centered Vaeto logo at the top */}
          <div className="mb-6 flex justify-center">
            <Logo size="md" />
          </div>

          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
