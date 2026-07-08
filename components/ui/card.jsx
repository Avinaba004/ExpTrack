import * as React from "react"

import { cn } from "@/lib/utils"

/** @typedef {React.HTMLAttributes<HTMLDivElement> & { className?: string }} CardProps */

/** @param {CardProps} props */
function Card({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        "relative flex flex-col gap-5 rounded-2xl border bg-gradient-to-br from-background via-purple-950/5 to-background text-card-foreground pt-0 pb-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-purple-500/30",
        className
      )}
      {...props} />
  );
}

/** @param {CardProps} props */
function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 p-5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-5",
        className
      )}
      {...props} />
  );
}

/** @param {CardProps} props */
function CardTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold text-lg", className)}
      {...props} />
  );
}

/** @param {CardProps} props */
function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />
  );
}

/** @param {CardProps} props */
function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props} />
  );
}

/** @param {CardProps} props */
function CardContent({
  className,
  ...props
}) {
  return (<div data-slot="card-content" className={cn("px-5 pb-5", className)} {...props} />);
}

/** @param {CardProps} props */
function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-5 [.border-t]:pt-5", className)}
      {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
