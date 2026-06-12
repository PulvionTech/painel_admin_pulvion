import React from 'react';

export function DashboardIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 13h8V3H3v10z" />
      <path d="M13 21h8v-8h-8v8z" />
      <path d="M13 8h8V3h-8v5z" />
      <path d="M3 21h8v-5H3v5z" />
    </svg>
  );
}

export function ReportsIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 6h16" />
      <path d="M4 12h10" />
      <path d="M4 18h16" />
      <path d="M15 12v6" />
      <path d="M19 6v12" />
    </svg>
  );
}

export function CadastrosIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4h16v6H4V4z" />
      <path d="M4 14h16v6H4v-6z" />
      <path d="M8 4v6" />
      <path d="M16 14v6" />
    </svg>
  );
}

export function FarmIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1v-9z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

export function ClockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function UsersIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M7 21v-2a4 4 0 0 1 3-3.87" />
      <path d="M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  );
}

export function AlertIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function FazendaTabIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1v-9z" />
      <path d="M9 20V12h6v10" />
      <rect x="7" y="3" width="3" height="3" />
    </svg>
  );
}

export function DroneTabIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="10" width="3" height="3" />
      <rect x="19" y="10" width="3" height="3" />
      <path d="M5 11.5L12 2l7 9.5" />
      <path d="M12 2v10" />
      <path d="M12 22v-8" />
      <rect x="10" y="12" width="4" height="2" />
      <circle cx="12" cy="14" r="3" />
    </svg>
  );
}

export function PilotoTabIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" />
      <path d="M3 13l3 3" />
      <path d="M18 13l3 3" />
    </svg>
  );
}

export function MenuIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12h18" />
      <path d="M3 6h18" />
      <path d="M3 18h18" />
    </svg>
  );
}

export function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
