"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const TableContext = React.createContext<{ compact?: boolean }>({})

function Table({ className, compact, ...props }: React.ComponentProps<"table"> & { compact?: boolean }) {
  return (
    <TableContext.Provider value={{ compact }}>
      <div
        data-slot="table-container"
        className="relative w-full overflow-x-auto rounded-lg border border-border bg-surface"
      >
        <table
          data-slot="table"
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </div>
    </TableContext.Provider>
  )
}

function TableHeader({ className, sticky, ...props }: React.ComponentProps<"thead"> & { sticky?: boolean }) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b bg-surface-muted",
        sticky && "sticky top-0 z-10 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  const { compact } = React.useContext(TableContext)
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 text-left align-middle font-medium text-muted-foreground whitespace-nowrap",
        compact ? "px-2" : "px-4",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const { compact } = React.useContext(TableContext)
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "align-middle whitespace-nowrap",
        compact ? "p-2" : "p-4",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function TableEmpty({
  colSpan,
  children,
  className,
  ...props
}: React.ComponentProps<"td">) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn("p-8 text-center text-muted-foreground", className)}
        {...props}
      >
        {children || "No data available."}
      </td>
    </tr>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmpty,
}
