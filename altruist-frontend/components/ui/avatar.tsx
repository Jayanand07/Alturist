"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cn } from "@/lib/utils"

function Avatar({
  className,
  size = "md",
  status,
  children,
  ...props
}: AvatarPrimitive.Root.Props & {
  size?: "sm" | "md" | "lg" | "xl"
  status?: "online" | "offline" | "busy" | "away"
}) {
  const sizeClasses = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-14 text-base",
    xl: "size-20 text-lg",
  }
  const statusColor = {
    online: "bg-success",
    offline: "bg-muted",
    busy: "bg-destructive",
    away: "bg-warning",
  }
  const statusSizes = {
    sm: "size-2.5",
    md: "size-3",
    lg: "size-4 border-2",
    xl: "size-5 border-2",
  }

  return (
    <div className="relative inline-flex">
      <AvatarPrimitive.Root
        data-slot="avatar"
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full border border-border/50",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </AvatarPrimitive.Root>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 z-10 block rounded-full ring-2 ring-background",
            statusColor[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  )
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted font-medium uppercase text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn("flex -space-x-2 *:ring-2 *:ring-background", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup }
