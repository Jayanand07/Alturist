import * as React from "react"
import { cn } from "@/lib/utils"

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  content: React.ReactNode
  position?: "top" | "bottom" | "left" | "right"
}

export function Tooltip({ children, content, position = "top", className, ...props }: TooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 -translate-y-1.5 mb-1",
    bottom: "top-full left-1/2 -translate-x-1/2 translate-y-1.5 mt-1",
    left: "right-full top-1/2 -translate-y-1/2 -translate-x-1.5 mr-1",
    right: "left-full top-1/2 -translate-y-1/2 translate-x-1.5 ml-1",
  }

  return (
    <div className="group relative inline-block w-max" {...props}>
      {children}
      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-xs scale-95 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100",
          "rounded-md bg-secondary px-2.5 py-1.5 text-xs text-secondary-foreground shadow-sm",
          positionClasses[position],
          className
        )}
      >
        {content}
      </div>
    </div>
  )
}
