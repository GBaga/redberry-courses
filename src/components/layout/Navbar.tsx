"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User as UserIcon, BookOpen, Rocket, Menu, X, LogOut, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { cn } from "@/utils/cn";

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const { pushModal } = useModal();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleMobileNav = (action: () => void) => {
    closeMobileMenu();
    action();
  };

  return (
    <>
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1920px]">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-2 rounded-[10px] text-white">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">RedClass</span>
          </Link>

          {/* Desktop Navigation — visible lg+ only */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/courses"
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-600",
                pathname === "/courses" ? "text-indigo-600" : "text-gray-600"
              )}
            >
              <BookOpen className="h-4 w-4" />
              Browse Courses
            </Link>

            <div className="h-6 w-px bg-gray-200 mx-2" />

            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => pushModal("sidebar")} className="text-gray-600">
                      Enrolled Courses
                    </Button>
                    <button
                      onClick={() => pushModal("profile")}
                      className="relative rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 cursor-pointer"
                    >
                      <span className="sr-only">Open user menu</span>
                      {user.avatar ? (
                        <img className="h-6 w-6 rounded-full object-cover" src={user.avatar} alt="" />
                      ) : (
                        <UserIcon className="h-5 w-5" />
                      )}
                      {!user.profileComplete && (
                        <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-yellow-400 border-2 border-white" />
                      )}
                    </button>
                    <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500 hover:underline cursor-pointer transition-colors">Log Out</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => pushModal("login")}>
                      Log In
                    </Button>
                    <Button onClick={() => pushModal("register")}>
                      Sign Up
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Controls — visible below lg */}
          <div className="flex lg:hidden items-center gap-2">
            {!isLoading && (
              <>
                {user ? (
                  <button
                    onClick={() => pushModal("profile")}
                    className="relative rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {user.avatar ? (
                      <img className="h-5 w-5 rounded-full object-cover" src={user.avatar} alt="" />
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                    {!user.profileComplete && (
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-yellow-400 border-2 border-white" />
                    )}
                  </button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => pushModal("login")} className="text-xs px-3 h-8">
                      Log In
                    </Button>
                    <Button size="sm" onClick={() => pushModal("register")} className="text-xs px-3 h-8">
                      Sign Up
                    </Button>
                  </>
                )}
              </>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Drawer Overlay — OUTSIDE header to avoid stacking context issues */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Dark overlay */}
        <div
          className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
          onClick={closeMobileMenu}
        />

        {/* Drawer panel — slides from right */}
        <div className="absolute inset-y-0 right-0 w-[280px] max-w-[85vw] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <Rocket className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-gray-900">RedClass</span>
            </Link>
            <button
              onClick={closeMobileMenu}
              className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info (auth'd only) */}
          {user && (
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  {user.avatar ? (
                    <img className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm" src={user.avatar} alt="" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <UserIcon className="h-5 w-5" />
                    </div>
                  )}
                  {!user.profileComplete && (
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-yellow-400 border-2 border-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.username || "Learner"}</p>
                  {user.profileComplete ? (
                    <p className="text-[10px] font-bold text-emerald-700 bg-emerald-100 inline-block px-2 py-0.5 rounded-full mt-0.5">
                      Profile Complete ✓
                    </p>
                  ) : (
                    <p className="text-[10px] font-bold text-yellow-700 bg-yellow-100 inline-block px-2 py-0.5 rounded-full mt-0.5">
                      Profile Incomplete
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
            <Link
              href="/courses"
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                pathname === "/courses"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <BookOpen className="h-5 w-5 shrink-0" />
              Browse Courses
            </Link>

            {user && (
              <>
                <button
                  onClick={() => handleMobileNav(() => pushModal("sidebar"))}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors text-left cursor-pointer"
                >
                  <GraduationCap className="h-5 w-5 shrink-0" />
                  Enrolled Courses
                </button>

                <button
                  onClick={() => handleMobileNav(() => pushModal("profile"))}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors text-left cursor-pointer"
                >
                  <UserIcon className="h-5 w-5 shrink-0" />
                  My Profile
                </button>
              </>
            )}
          </nav>

          {/* Drawer Footer */}
          <div className="border-t border-gray-100 p-4">
            {user ? (
              <button
                onClick={() => handleMobileNav(logout)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => handleMobileNav(() => pushModal("login"))}
                >
                  Log In
                </Button>
                <Button
                  fullWidth
                  onClick={() => handleMobileNav(() => pushModal("register"))}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
