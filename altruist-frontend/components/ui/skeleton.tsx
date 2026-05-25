import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "avatar" | "card" | "table-row"
}

function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  const variantStyles = {
    default: "rounded-md",
    text: "h-4 w-full rounded-md",
    avatar: "h-10 w-10 rounded-full",
    card: "h-48 w-full rounded-xl",
    "table-row": "h-12 w-full rounded-md",
  }
  return (
    <div
      className={cn("animate-pulse bg-muted/50", variantStyles[variant], className)}
      {...props}
    />
  )
}

export { Skeleton }
