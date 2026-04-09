"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ModalProvider } from "@/context/ModalContext";
import { ModalManager } from "@/components/modals/ModalManager";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ModalProvider>
        {children}
        <ModalManager />
      </ModalProvider>
    </AuthProvider>
  );
}
