import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
    const styles =
      variant === "primary"
        ? "bg-brand-700 text-white hover:bg-brand-800 focus:ring-brand-500"
        : "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400";
    return <button ref={ref} className={`${base} ${styles} ${className}`} {...props} />;
  }
);
Button.displayName = "Button";