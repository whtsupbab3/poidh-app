import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBanSignatureFirstLine({
  id,
  chainId,
  type,
}: {
  id: string;
  chainId: number;
  type: 'claim' | 'bounty';
}) {
  return `Ban ${type}: id: ${id} chainId: ${chainId}\n`;
}
