
import React, { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { CheckBadgeIcon, ExclamationCircleIcon, XMarkIcon, BellAlertIcon } from './icons/Icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastIcons = {
    success: <CheckBadgeIcon className="size-6 text-green-500" />,
    error: <ExclamationCircleIcon className="size-6 text-red-500" />,
    info: <BellAlertIcon className="size-6 text-blue-500" />,
};

const toastStyles = {
    success: 'bg-green-50 dark:bg-green-900/50 border-green-500',
    error: 'bg-red-50 dark:bg-red-900/50 border-red-500',
    info: 'bg-blue-50 dark:bg-blue-900/50 border-blue-500',
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const value = useMemo(() => ({ addToast }), [addToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-5 right-5 z-[100] space-y-3 w-full max-w-sm">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onDismiss={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    const { addToast } = context;

    return useMemo(() => ({
        success: (message: string) => addToast(message, 'success'),
        error: (message: string) => addToast(message, 'error'),
        info: (message: string) => addToast(message, 'info'),
    }), [addToast]);
};

interface ToastProps {
    message: string;
    type: ToastType;
    onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
        }, 3000); // Auto-dismiss after 3 seconds

        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        if(isExiting) {
            const timer = setTimeout(onDismiss, 300); // Duration of the exit animation
            return () => clearTimeout(timer);
        }
    }, [isExiting, onDismiss]);

    const handleDismiss = () => {
        setIsExiting(true);
    };

    return (
        <div
            className={`flex items-center gap-3 w-full p-4 rounded-xl shadow-lg border-l-4 ${toastStyles[type]} bg-[var(--background-white)] animate-toast-in ${isExiting ? 'animate-toast-out' : ''}`}
            role="alert"
        >
            <div className="flex-shrink-0">{toastIcons[type]}</div>
            <div className="flex-1 text-sm font-semibold text-[var(--text-primary)]">{message}</div>
            <button
                onClick={handleDismiss}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Tutup notifikasi"
            >
                <XMarkIcon className="size-5" />
            </button>
        </div>
    );
};
