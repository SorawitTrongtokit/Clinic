import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// Component that throws an error
const ErrorThrowingComponent = () => {
    throw new Error('Test error message');
};

// Component that works fine
const WorkingComponent = () => {
    return <div>Working correctly</div>;
};

describe('ErrorBoundary Component', () => {
    // Suppress error console during tests
    const originalError = console.error;
    beforeAll(() => {
        console.error = jest.fn();
    });
    afterAll(() => {
        console.error = originalError;
    });

    it('renders children when no error occurs', () => {
        render(
            <ErrorBoundary>
                <WorkingComponent />
            </ErrorBoundary>
        );
        expect(screen.getByText('Working correctly')).toBeInTheDocument();
    });

    it('renders error UI when child throws an error', () => {
        render(
            <ErrorBoundary>
                <ErrorThrowingComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
        expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('renders custom fallback when provided', () => {
        render(
            <ErrorBoundary fallback={<div>Custom fallback</div>}>
                <ErrorThrowingComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    });
});
