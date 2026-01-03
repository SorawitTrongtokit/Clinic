import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/ui/Toast';

// Test component that uses the toast
const TestComponent = () => {
    const { showToast } = useToast();
    return (
        <div>
            <button onClick={() => showToast('Success message', 'success')}>
                Show Success
            </button>
            <button onClick={() => showToast('Error message', 'error')}>
                Show Error
            </button>
            <button onClick={() => showToast('Info message', 'info')}>
                Show Info
            </button>
        </div>
    );
};

describe('Toast Component', () => {
    it('renders ToastProvider without crashing', () => {
        render(
            <ToastProvider>
                <div>Test content</div>
            </ToastProvider>
        );
        expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('shows success toast when triggered', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Success'));

        await waitFor(() => {
            expect(screen.getByText('Success message')).toBeInTheDocument();
        });
    });

    it('shows error toast when triggered', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Error'));

        await waitFor(() => {
            expect(screen.getByText('Error message')).toBeInTheDocument();
        });
    });

    it('dismisses toast when close button is clicked', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Info'));

        await waitFor(() => {
            expect(screen.getByText('Info message')).toBeInTheDocument();
        });

        const closeButton = screen.getByLabelText('ปิด');
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('Info message')).not.toBeInTheDocument();
        });
    });
});
