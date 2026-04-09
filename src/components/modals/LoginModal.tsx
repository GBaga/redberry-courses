"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { api } from "@/services/api";
import { User } from "@/types";

const loginSchema = yup.object({
  email: yup.string().email("Please enter a valid email").min(3).required("Email is required"),
  password: yup.string().min(3, "Password must be at least 3 characters").required("Password is required"),
});

type LoginFormValues = yup.InferType<typeof loginSchema>;

export function LoginModal({ isOpen }: { isOpen: boolean }) {
  const { popModal, switchModal } = useModal();
  const { login } = useAuth();
  const [globalError, setGlobalError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError("");
    try {
      const response = await api.post<{ data: { user: User; token: string } }>("/login", data);
      const { user, token } = response.data.data;
      login(user, token);
      popModal();
    } catch (err: any) {
      if (err.response?.status === 401) {
        setGlobalError("Invalid credentials.");
      } else {
        setGlobalError("Something went wrong. Please try again.");
      }
    }
  };

  const handleGoToSignup = (e: React.MouseEvent) => {
    e.preventDefault();
    switchModal("register");
  };

  return (
    <Modal isOpen={isOpen} onClose={popModal} title="Welcome Back">
      <p className="text-sm text-gray-500 text-center mb-6 -mt-2">
        Log in to continue your learning.
      </p>

      {globalError && (
        <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email*"
          type="email"
          placeholder="your@email.com"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label="Password*"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          error={errors.password?.message}
        />

        <div className="pt-2">
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Log In
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={handleGoToSignup}
            className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </form>
    </Modal>
  );
}
