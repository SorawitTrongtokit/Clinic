import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatAddress(address: any): string {
    if (!address) return '-';
    if (typeof address === 'string') return address;

    const parts = [
        address.houseNo ? `บ้านเลขที่ ${address.houseNo}` : '',
        address.moo ? `หมู่ ${address.moo}` : '',
        address.tambon ? `ต.${address.tambon}` : '',
        address.amphoe ? `อ.${address.amphoe}` : '',
        address.province ? `จ.${address.province}` : '',
        address.zip ? `${address.zip}` : ''
    ];

    return parts.filter(Boolean).join(' ');
}
