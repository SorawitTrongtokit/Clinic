
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegistrationForm from '@/components/patients/RegistrationForm';
import { supabase } from '@/lib/supabase';
import React from 'react';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn().mockResolvedValue({ data: null, error: null }), // Mock checking for duplicate ID
                })),
            })),
            insert: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn().mockResolvedValue({
                        data: { id: 'new-id', first_name: 'Test', last_name: 'Patient' },
                        error: null
                    }),
                })),
            })),
            update: jest.fn(() => ({
                eq: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({
                            data: { id: 'updated-id', first_name: 'Updated', last_name: 'Patient' },
                            error: null
                        }),
                    })),
                })),
            })),
        })),
    },
}));

// Mock toast
jest.mock('@/components/ui/Toast', () => ({
    useToast: () => ({
        showToast: jest.fn(),
    }),
}));

describe('RegistrationForm', () => {
    const mockOnSuccess = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<RegistrationForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

        expect(screen.getByPlaceholderText('เลขบัตรประชาชน (13 หลัก)')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('ชื่อจริง (ไม่ต้องมีคำนำหน้า)')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('นามสกุล')).toBeInTheDocument();
    });

    it('enforces numeric input for ID card', () => {
        render(<RegistrationForm onSuccess={mockOnSuccess} />);
        const input = screen.getByPlaceholderText('เลขบัตรประชาชน (13 หลัก)');

        fireEvent.change(input, { target: { value: '123abc456' } });

        expect(input).toHaveValue('123456'); // Should strip 'abc'
    });

    it('limits ID card to 13 digits', () => {
        render(<RegistrationForm onSuccess={mockOnSuccess} />);
        const input = screen.getByPlaceholderText('เลขบัตรประชาชน (13 หลัก)');

        fireEvent.change(input, { target: { value: '123456789012345' } });

        expect(input).toHaveValue('1234567890123');
    });

    it('enforces numeric input for Phone number', () => {
        render(<RegistrationForm onSuccess={mockOnSuccess} />);
        const input = screen.getByPlaceholderText('เบอร์โทรศัพท์ (10 หลัก)');

        fireEvent.change(input, { target: { value: '081abc23' } });

        expect(input).toHaveValue('08123'); // Should strip 'abc'
    });
});
