import { clsx } from "clsx"  //clsx joins class names together.
import { twMerge } from "tailwind-merge"  //twMerge fixes conflicting Tailwind classes.

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
