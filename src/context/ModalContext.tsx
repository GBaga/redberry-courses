"use client";

import React, { createContext, useContext, useState } from "react";

export type ModalType =
  | "login"
  | "register"
  | "profile"
  | "sidebar"
  | "conflict_warning"
  | "completion_celebration";

interface ModalContextType {
  modalStack: ModalType[];
  pushModal: (modal: ModalType) => void;
  popModal: () => void;
  clearModals: () => void;
  switchModal: (modal: ModalType) => void; // Replaces current top modal
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalStack, setModalStack] = useState<ModalType[]>([]);

  const pushModal = (modal: ModalType) => {
    setModalStack((prev) => [...prev, modal]);
  };

  const popModal = () => {
    setModalStack((prev) => prev.slice(0, -1));
  };

  const clearModals = () => {
    setModalStack([]);
  };

  const switchModal = (modal: ModalType) => {
    setModalStack((prev) => {
      if (prev.length === 0) return [modal];
      const newStack = [...prev];
      newStack[newStack.length - 1] = modal;
      return newStack;
    });
  };

  return (
    <ModalContext.Provider value={{ modalStack, pushModal, popModal, clearModals, switchModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
