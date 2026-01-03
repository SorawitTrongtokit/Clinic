'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">
                            เกิดข้อผิดพลาด
                        </h2>
                        <p className="text-slate-500 mb-6">
                            ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง
                        </p>
                        {this.state.error && (
                            <div className="bg-slate-50 rounded-lg p-3 mb-6 text-left">
                                <p className="text-xs font-mono text-red-600 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                รีโหลดหน้า
                            </Button>
                            <Button
                                variant="primary"
                                onClick={this.handleRetry}
                            >
                                ลองใหม่
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
