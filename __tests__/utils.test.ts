
import { formatAddress, cn } from '@/lib/utils';

describe('formatAddress', () => {
    it('returns "-" for null or undefined', () => {
        expect(formatAddress(null)).toBe('-');
        expect(formatAddress(undefined)).toBe('-');
    });

    it('returns the string as is if input is a string', () => {
        expect(formatAddress('123 Test Road')).toBe('123 Test Road');
    });

    it('formats address object correctly', () => {
        const address = {
            houseNo: '123/4',
            moo: '5',
            tambon: 'Matoom',
            amphoe: 'Prompiram',
            province: 'Phitsanulok',
            zip: '65180'
        };
        const expected = 'บ้านเลขที่ 123/4 หมู่ 5 ต.Matoom อ.Prompiram จ.Phitsanulok 65180';
        expect(formatAddress(address)).toBe(expected);
    });

    it('handles missing fields in address object', () => {
        const address = {
            houseNo: '123',
            province: 'Bangkok'
        };
        const expected = 'บ้านเลขที่ 123 จ.Bangkok';
        expect(formatAddress(address)).toBe(expected);
    });
});

describe('cn', () => {
    it('merges class names correctly', () => {
        expect(cn('c-1', 'c-2')).toBe('c-1 c-2');
    });

    it('handles conditional classes', () => {
        expect(cn('c-1', false && 'c-2', 'c-3')).toBe('c-1 c-3');
    });

    it('merges tailwind classes using tailwind-merge', () => {
        // p-4 should overwrite p-2
        expect(cn('p-2', 'p-4')).toBe('p-4');
    });
});
