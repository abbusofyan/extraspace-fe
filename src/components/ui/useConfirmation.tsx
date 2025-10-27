import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'default';
    icon?: React.ReactNode;
}

interface ConfirmationState {
    isOpen: boolean;
    options: ConfirmationOptions;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

interface ConfirmationContextType {
    confirm: (options: ConfirmationOptions) => Promise<boolean>;
    confirmAsync: (options: ConfirmationOptions, asyncAction: () => Promise<void>) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ConfirmationState>({
        isOpen: false,
        options: { message: '' },
        onConfirm: () => {},
        onCancel: () => {},
        isLoading: false
    });

    const confirm = (options: ConfirmationOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                options: {
                    title: 'Confirm Action',
                    confirmText: 'Confirm',
                    cancelText: 'Cancel',
                    variant: 'default',
                    ...options
                },
                onConfirm: () => {
                    setState(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setState(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                },
                isLoading: false
            });
        });
    };

    const confirmAsync = async (options: ConfirmationOptions, asyncAction: () => Promise<void>): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                options: {
                    title: 'Confirm Action',
                    confirmText: 'Confirm',
                    cancelText: 'Cancel',
                    variant: 'default',
                    ...options
                },
                onConfirm: async () => {
                    setState(prev => ({ ...prev, isLoading: true }));
                    try {
                        await asyncAction();
                        setState(prev => ({ ...prev, isOpen: false, isLoading: false }));
                        resolve(true);
                    } catch (error) {
                        setState(prev => ({ ...prev, isLoading: false }));
                        // Don't close dialog on error, let user try again or cancel
                        console.error('Confirmation action failed:', error);
                    }
                },
                onCancel: () => {
                    setState(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                },
                isLoading: false
            });
        });
    };

    const getDefaultIcon = () => {
        if (state.options.variant === 'destructive') {
            return (
                <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
            );
        }
        return (
            <div className="p-2 bg-blue-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
            </div>
        );
    };

    return (
        <ConfirmationContext.Provider value={{ confirm, confirmAsync }}>
            {children}

            {/* Confirmation Dialog */}
            {state.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={state.onCancel}
                    />

                    {/* Dialog */}
                    <Card className="relative w-full max-w-md mx-4 shadow-2xl border-2">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {state.options.icon || getDefaultIcon()}
                                    <CardTitle className="text-lg font-semibold text-gray-900">
                                        {state.options.title}
                                    </CardTitle>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={state.onCancel}
                                    disabled={state.isLoading}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <p className="text-gray-600 leading-relaxed">
                                {state.options.message}
                            </p>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={state.onCancel}
                                    disabled={state.isLoading}
                                    className="min-w-20"
                                >
                                    {state.options.cancelText}
                                </Button>
                                <Button
                                    variant={state.options.variant}
                                    onClick={state.onConfirm}
                                    disabled={state.isLoading}
                                    className="min-w-20"
                                >
                                    {state.isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        state.options.confirmText
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </ConfirmationContext.Provider>
    );
}

export function useConfirmation() {
    const context = useContext(ConfirmationContext);
    if (context === undefined) {
        throw new Error('useConfirmation must be used within a ConfirmationProvider');
    }
    return context;
}
