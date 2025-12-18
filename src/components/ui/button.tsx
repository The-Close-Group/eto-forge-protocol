import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-transparent hover:bg-muted text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted text-muted-foreground hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "bg-primary text-primary-foreground font-semibold hover:bg-primary/85",
        ctaDark: "bg-[hsl(240_4%_14%)] text-foreground border border-[hsl(240_4%_18%)] hover:bg-[hsl(240_4%_17%)] hover:border-[hsl(240_4%_22%)]",
        positive: "bg-[hsl(160_70%_50%)] text-black font-semibold hover:bg-[hsl(160_70%_45%)]",
        // Neobrutalist variants with 3D shadow effect
        neo: "bg-neo text-neo-text border-2 border-neo-border shadow-neo hover:translate-x-neo-x hover:translate-y-neo-y hover:shadow-none font-semibold",
        neoReverse: "bg-neo text-neo-text border-2 border-neo-border hover:-translate-x-neo-x hover:-translate-y-neo-y hover:shadow-neo font-semibold",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-[10px]",
        sm: "h-8 px-3 rounded-lg text-[12px]",
        lg: "h-10 px-5 rounded-[10px]",
        xl: "h-11 px-6 rounded-xl text-[14px]",
        icon: "h-9 w-9 rounded-lg",
        neo: "h-10 px-5 py-2 rounded-[5px]",
        neoSm: "h-9 px-4 py-2 rounded-[5px] text-[12px]",
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
