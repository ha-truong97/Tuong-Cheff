import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function calculateShipFee(portions: number, distanceKm: number) {
  if (portions >= 5 && distanceKm <= 10) return 0;
  // Default logic or manual input by admin
  return null; 
}
