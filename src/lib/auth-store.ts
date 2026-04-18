'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DeliveryAddress {
  id: string;
  label: string;
  address: string;
  postcode: string;
}

export interface UserInfo {
  name: string;
  email: string;
  phone: string;
  addresses: DeliveryAddress[];
  selectedAddressId: string | null;
}

interface AuthStore {
  user: UserInfo | null;
  verified: boolean;
  signInOpen: boolean;
  setUser: (user: UserInfo) => void;
  setVerified: (v: boolean) => void;
  logout: () => void;
  openSignIn: () => void;
  closeSignIn: () => void;
  addAddress: (addr: DeliveryAddress) => void;
  removeAddress: (id: string) => void;
  selectAddress: (id: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      verified: false,
      signInOpen: false,
      setUser: (user) => set({ user }),
      setVerified: (verified) => set({ verified }),
      logout: () => set({ user: null, verified: false }),
      openSignIn: () => set({ signInOpen: true }),
      closeSignIn: () => set({ signInOpen: false }),
      addAddress: (addr) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, addresses: [...user.addresses, addr], selectedAddressId: user.selectedAddressId ?? addr.id } });
      },
      removeAddress: (id) => {
        const user = get().user;
        if (!user) return;
        const addresses = user.addresses.filter((a) => a.id !== id);
        const selectedAddressId = user.selectedAddressId === id ? (addresses[0]?.id ?? null) : user.selectedAddressId;
        set({ user: { ...user, addresses, selectedAddressId } });
      },
      selectAddress: (id) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, selectedAddressId: id } });
      },
    }),
    {
      name: 'jj-auth',
      partialize: (s) => ({ user: s.user, verified: s.verified }),
      skipHydration: true,
    }
  )
);
