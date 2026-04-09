"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, User as UserIcon, BookOpen, Rocket } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { cn } from "@/utils/cn";

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const { pushModal } = useModal();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1920px]">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-2 rounded-[10px] text-white">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">RedClass</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/courses"
              className={cn(
                "hidden sm:flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-600",
                pathname === "/courses" ? "text-indigo-600" : "text-gray-600"
              )}
            >
              <BookOpen className="h-4 w-4" />
              Browse Courses
            </Link>

            <div className="h-6 w-px bg-gray-200 hidden sm:block mx-2" />

            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => pushModal("sidebar")} className="hidden sm:flex text-gray-600">
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
                    {/* Add a quick logout for dev convenience until profile covers it */}
                    <button onClick={logout} className="text-xs text-red-500 hover:underline cursor-pointer">Exit</button>
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
        </div>
      </div>
    </header>
  );
}
