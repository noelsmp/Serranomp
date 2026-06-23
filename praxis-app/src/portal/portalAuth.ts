import { useState, useEffect } from 'react';
import type { PortalSession } from '../types';

const SESSION_KEY = 'hp_portal_session';

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`hp-portal-2024:${pin}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getPortalSession(): PortalSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setPortalSession(session: PortalSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearPortalSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function usePortalSession(): PortalSession | null {
  const [session, setSession] = useState<PortalSession | null>(getPortalSession);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        setSession(getPortalSession());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return session;
}
