import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-pill border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-5 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted-48)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-focus)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }