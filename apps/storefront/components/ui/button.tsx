import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-normal transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-focus)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-focus)] active:scale-[0.95]",
        secondary:
          "bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-surface-pearl)] active:scale-[0.95]",
        ghost:
          "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-divider-soft)] active:scale-[0.95]",
        outline:
          "border border-[var(--color-hairline)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-pearl)] active:scale-[0.95]",
        dark: "bg-[var(--color-ink)] text-[var(--color-on-dark)] hover:bg-[var(--color-ink-muted-80)] active:scale-[0.95]",
      },
      size: {
        default: "h-11 px-[22px] py-[11px]",
        sm: "h-9 px-4 text-sm",
        lg: "h-14 px-[28px] text-lg font-light",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }