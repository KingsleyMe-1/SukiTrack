import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  | "customer";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary:     { backgroundColor: "var(--primary)",        color: "var(--primary-foreground)" },
  secondary:   { backgroundColor: "var(--muted)",          color: "var(--foreground)" },
  ghost:       { backgroundColor: "transparent",           color: "var(--muted-foreground)" },
  destructive: { backgroundColor: "transparent",           color: "var(--destructive)" },
  customer:    { backgroundColor: "var(--customer-color)", color: "var(--customer-color-fg)" },
};

const VARIANT_HOVER: Record<ButtonVariant, string> = {
  primary:     "hover:opacity-90",
  secondary:   "hover:opacity-80",
  ghost:       "hover-btn",
  destructive: "hover-error",
  customer:    "hover:opacity-90",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm:   "px-3 py-1.5 text-xs rounded-lg",
  md:   "px-5 py-2.5 text-sm rounded-xl",
  lg:   "px-6 py-3 text-sm rounded-xl",
  icon: "w-8 h-8 rounded-lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "ghost", size = "md", className = "", style, children, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer
        disabled:opacity-60 disabled:cursor-not-allowed
        ${SIZE_CLASS[size]} ${VARIANT_HOVER[variant]} ${className}`}
      style={{ ...VARIANT_STYLES[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";

export { Button };
