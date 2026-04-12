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

const profileSchema = yup.object({
  full_name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters")
    .required("Name is required"),
  mobile_number: yup
    .string()
    .transform((val) => val ? val.replace(/\s+/g, "") : val)
    .matches(/^5/, "Georgian mobile numbers must start with 5")
    .matches(/^\d{9}$/, "Mobile number must be exactly 9 digits")
    .required("Mobile number is required"),
  age: yup
    .number()
    .typeError("Age must be a number")
    .min(16, "You must be at least 16 years old to enroll")
    .max(120, "Please enter a valid age")
    .required("Age is required"),
  avatar: yup.mixed<FileList>().nullable().optional(),
});

type ProfileFormValues = yup.InferType<typeof profileSchema>;

export function ProfileModal({ isOpen }: { isOpen: boolean }) {
  const { popModal, switchModal } = useModal();
  const { user, updateUser } = useAuth();
  
  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, touchedFields, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: yupResolver(profileSchema) as any,
    defaultValues: {
      full_name: user?.fullName || "",
      mobile_number: user?.mobileNumber || "",
      age: user?.age || undefined,
    },
    mode: "onBlur",
  });

  // Watch for avatar file changes to update preview
  const avatarFile = watch("avatar");
  React.useEffect(() => {
    if (avatarFile && avatarFile.length > 0) {
      const objectUrl = URL.createObjectURL(avatarFile[0]);
      setAvatarPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [avatarFile]);

  // Sync state if user changes out of band
  React.useEffect(() => {
    if (user?.avatar && (!avatarFile || avatarFile.length === 0)) {
      setAvatarPreview(user.avatar);
    }
  }, [user, avatarFile]);

  const onSubmit = async (data: ProfileFormValues) => {
    setGlobalError("");
    setGlobalSuccess("");
    
    const formData = new FormData();
    formData.append("full_name", data.full_name);
    
    // Strip spaces automatically for mobile as indicated by the spec, though matching already enforced digits
    const cleanedMobile = data.mobile_number.replace(/\s+/g, "");
    formData.append("mobile_number", cleanedMobile);
    formData.append("age", data.age.toString());
    
    // If a new avatar was selected
    if (data.avatar && data.avatar.length > 0) {
      formData.append("avatar", data.avatar[0]);
    }

    try {
      const response = await api.put<{ data: User }>("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      updateUser(response.data.data);
      setGlobalSuccess("Profile updated successfully!");
      
      // Auto close after brief success message
      setTimeout(() => {
        if (isOpen) popModal();
      }, 1500);
      
    } catch (err: any) {
      if (err.response?.status === 422) {
        const msgs = err.response.data?.errors;
        let errStr = "Update failed: ";
        if (msgs) {
          errStr += Object.values(msgs).flat().join(", ");
        }
        setGlobalError(errStr);
      } else {
        setGlobalError("Failed to update profile. Please try again.");
      }
    }
  };

  const handleClose = () => {
    if (user && !user.profileComplete) {
      // Prevent simple closure if they haven't completed their profile yet
      // This maps to the confirmation dialog requirement implicitly
      const confirmDismiss = window.confirm(
        "Your profile is incomplete. You won't be able to enroll in courses until you complete it. Close anyway?"
      );
      if (!confirmDismiss) return;
    }
    popModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Profile">
      <div className="flex items-center gap-4 mb-6 -mt-2">
         {avatarPreview ? (
           <img src={avatarPreview} alt="Avatar" className="h-14 w-14 rounded-full object-cover shadow-sm bg-gray-100" />
         ) : (
           <div className="flex items-center justify-center h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 text-xl font-bold shadow-sm">
             {user?.username?.charAt(0).toUpperCase()}
           </div>
         )}
         <div>
           <p className="font-bold text-gray-900">{user?.username || "Learner"}</p>
           {user?.profileComplete ? (
              <p className="text-[11px] font-bold text-emerald-700 bg-emerald-100 inline-block px-2.5 py-0.5 rounded-full mt-1 border border-emerald-200">
                Profile Complete ✓
              </p>
           ) : (
              <p className="text-[11px] font-bold text-yellow-700 bg-yellow-100 inline-block px-2.5 py-0.5 rounded-full mt-1 border border-yellow-200">
                Profile Incomplete
              </p>
           )}
         </div>
      </div>

      {globalError && (
        <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
          {globalError}
        </div>
      )}
      
      {globalSuccess && (
        <div className="p-3 mb-4 text-sm text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200">
          {globalSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Read-only email field */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="flex h-11 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 shadow-sm cursor-not-allowed"
          />
        </div>

        <Input
          label="Full Name*"
          placeholder="First Last"
          {...register("full_name")}
          error={errors.full_name?.message}
          isSuccess={touchedFields.full_name && !errors.full_name}
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
             <Input
               label="Mobile Number*"
               placeholder="555 123 456"
               {...register("mobile_number")}
               error={errors.mobile_number?.message}
               isSuccess={touchedFields.mobile_number && !errors.mobile_number}
             />
          </div>
          <div className="w-full sm:w-1/3">
             <Input
               label="Age*"
               placeholder="18"
               type="number"
               {...register("age")}
               error={errors.age?.message}
               isSuccess={touchedFields.age && !errors.age}
             />
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5 pt-2">
          <label className="text-sm font-medium text-gray-700">Update Avatar (Optional)</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            {...register("avatar")}
            className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
          />
          {errors.avatar?.message && <p className="text-xs text-red-500">{errors.avatar.message}</p>}
        </div>

        <div className="pt-4">
          <Button type="submit" fullWidth isLoading={isSubmitting} disabled={!isValid}>
            Save Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
}
