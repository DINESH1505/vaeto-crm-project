import { cn } from '../../utils/helpers';
import vaetoLogo from '../../assets/brand/vaeto-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showTagline?: boolean;
  className?: string;
  markOnly?: boolean;
}

/** Fallback gradient "V" mark if mark-only display is requested. */
export function VMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 52 46" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="vl-logo" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="vr-logo" x1="0.4" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#00d2ff" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path d="M44 7 L26 39" stroke="url(#vr-logo)" strokeWidth="11" strokeLinecap="round" />
      <path d="M8 7 L26 39" stroke="url(#vl-logo)" strokeWidth="11" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Official Vaeto Technology brand asset logo:
 * Dual-stroke gradient V mark + "aeto." in bold navy + "AI • SECURITY • TRUST" tagline.
 * Preserves original asset colors, clarity, aspect ratio, and full tagline.
 */
export function Logo({ size = 'md', className, markOnly }: LogoProps) {
  if (markOnly) return <VMark className={cn('h-8 w-8', className)} />;

  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
    hero: 'h-20 sm:h-24 lg:h-28',
  }[size];

  return (
    <img
      src={vaetoLogo}
      alt="Vaeto - AI • SECURITY • TRUST"
      className={cn(sizeClasses, 'w-auto object-contain select-none', className)}
      loading="eager"
      decoding="async"
    />
  );
}
