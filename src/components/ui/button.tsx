import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-sm shadow-primary/20 hover:bg-primary-soft hover:shadow-md hover:shadow-primary/30",
        secondary:
          "bg-accent text-white shadow-sm shadow-accent/20 hover:bg-accent-soft hover:shadow-md hover:shadow-accent/30",
        gradient:
          "bg-gradient-to-r from-primary to-accent text-white shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 hover:from-primary-soft hover:to-accent-soft",
        outline:
          "border border-border bg-surface text-foreground hover:bg-surface-muted hover:border-border-strong hover:shadow-sm",
        ghost: "text-foreground-soft hover:bg-surface-muted hover:text-foreground",
        destructive: "bg-expense text-white shadow-sm hover:opacity-90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-[8px] px-3 text-xs",
        lg: "h-11 rounded-[14px] px-6 text-base",
        xl: "h-12 rounded-[16px] px-8 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };