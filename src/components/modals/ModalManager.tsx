"use client";

import React from "react";
import { useModal } from "@/context/ModalContext";
import { LoginModal } from "./LoginModal";
import { RegistrationModal } from "./RegistrationModal";
import { ProfileModal } from "./ProfileModal";
import { EnrolledSidebar } from "./EnrolledSidebar";
// We'll add other modals here later

export function ModalManager() {
  const { modalStack } = useModal();

  // Determine which modals are open by checking the stack
  const isLoginOpen = modalStack.includes("login");
  const isRegisterOpen = modalStack.includes("register");
  const isProfileOpen = modalStack.includes("profile");
  const isSidebarOpen = modalStack.includes("sidebar");

  return (
    <>
      <LoginModal isOpen={isLoginOpen} />
      <RegistrationModal isOpen={isRegisterOpen} />
      <ProfileModal isOpen={isProfileOpen} />
      <EnrolledSidebar isOpen={isSidebarOpen} />
      {/* 
        Other modals to mount:
        - ProfileModal
        - ConflictWarningModal 
        - CompletionCelebrationModal
      */}
    </>
  );
}
