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

const registrationSchema = yup.object({
  email: yup.string().email("Please enter a valid email").min(3).required("Email is required"),
  password: yup.string().min(3, "Password must be at least 3 characters").required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  username: yup.string().min(3, "Username must be at least 3 characters").required("Username is required"),
  avatar: yup.mixed<FileList>().nullable().optional(),
});

type RegistrationFormValues = yup.InferType<typeof registrationSchema>;

export function RegistrationModal({ isOpen }: { isOpen: boolean }) {
  const { popModal, switchModal } = useModal();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [globalError, setGlobalError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: yupResolver(registrationSchema) as any,
    mode: "onTouched",
  });

  const nextStep = async (fieldsToValidate: (keyof RegistrationFormValues)[]) => {
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    setGlobalError("");
    
    // Convert to FormData
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("password_confirmation", data.password_confirmation);
    formData.append("username", data.username);
    
    if (data.avatar && data.avatar.length > 0) {
      formData.append("avatar", data.avatar[0]);
    }

    try {
      const response = await api.post<{ data: { user: User; token: string } }>("/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { user, token } = response.data.data;
      login(user, token);
      popModal();
    } catch (err: any) {
      if (err.response?.status === 422) {
        // Validation format error from API
        const msgs = err.response.data?.errors;
        let errStr = "Validation failed: ";
        if (msgs) {
          errStr += Object.values(msgs).flat().join(", ");
        }
        setGlobalError(errStr);
      } else {
        setGlobalError("Registration failed. Please try again later.");
      }
    }
  };

  const avatarFile = watch("avatar");
  React.useEffect(() => {
    if (avatarFile && avatarFile.length > 0) {
      const objectUrl = URL.createObjectURL(avatarFile[0]);
      setAvatarPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [avatarFile]);

  return (
    <Modal isOpen={isOpen} onClose={popModal} title="Create Account">
      <p className="text-sm text-gray-500 text-center mb-6 -mt-2">
        Join and start learning today.
      </p>

      {globalError && (
        <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <Input
              label="Email*"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
              error={errors.email?.message}
            />
            <div className="pt-2">
              <Button 
                type="button" 
                fullWidth 
                onClick={() => nextStep(["email"])}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <Input
              label="Password*"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
            />
            <Input
              label="Confirm Password*"
              type="password"
              placeholder="••••••••"
              {...register("password_confirmation")}
              error={errors.password_confirmation?.message}
            />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="w-1/3" onClick={prevStep}>
                Back
              </Button>
              <Button 
                type="button" 
                className="w-2/3" 
                onClick={() => nextStep(["password", "password_confirmation"])}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <Input
              label="Username*"
              placeholder="johndoe"
              {...register("username")}
              error={errors.username?.message}
            />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Avatar (Optional)</label>
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-300 border-dashed">
                    IMG
                  </div>
                )}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  {...register("avatar")}
                  className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
              {errors.avatar?.message && <p className="text-xs text-red-500">{errors.avatar.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="w-1/3" onClick={prevStep}>
                Back
              </Button>
              <Button type="submit" className="w-2/3" isLoading={isSubmitting}>
                Sign Up
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              switchModal("login");
            }}
            className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline cursor-pointer"
          >
            Log In
          </button>
        </p>
      </form>
    </Modal>
  );
}
