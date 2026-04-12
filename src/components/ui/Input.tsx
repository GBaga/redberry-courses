import React from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isSuccess?: boolean;
  fullWidth?: boolean;
}

import { CheckCircle2 } from "lucide-react";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, isSuccess, fullWidth = true, id, ...props }, ref) => {
    // Generate a unique ID if none is provided, useful for linking label to input safely
    const inputId = id || React.useId();

    return (
      <div className={cn("flex flex-col gap-1.5 text-left", fullWidth && "w-full")}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:border-indigo-600 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
              error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500 pr-10",
              isSuccess && "border-emerald-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500 pr-10",
              className
            )}
            {...props}
          />
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              {/* Optional Error Icon Could Go Here */}
            </div>
          )}
          {isSuccess && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
