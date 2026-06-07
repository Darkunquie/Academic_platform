import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-gray-700 hover:bg-gray-100",
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ className, variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
      variants[variant],
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
