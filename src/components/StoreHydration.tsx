'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';

export function StoreHydration() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);
  return null;
}
