import * as React from "react"
import { cn } from "@/lib/utils"

const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 sm:px-4 md:px-4 w-full 2xl:px-8", className)}
    {...props}
  />
))
Container.displayName = "Container"

export default Container