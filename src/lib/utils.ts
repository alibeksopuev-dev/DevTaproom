import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(priceInThousands: number): string {
  const priceInVND = priceInThousands * 1000;
  return `${priceInVND.toLocaleString('en-US')} VND`;
}
