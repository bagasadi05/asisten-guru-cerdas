
import React, { useState, useEffect } from 'react';
import type { Feature } from '../../App';
import { ArrowLeftIcon } from '../../components/icons/Icons';
import { NotificationPermission } from '../../types';

interface NotificationSettingsViewProps {
    setActiveFeature: (feature: Feature) => void;
}

export const NotificationSettingsView: React.FC<NotificationSettingsViewProps> = ({ setActiveFeature }) => {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    // Effect to get the initial notification permission status
    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const handlePermissionRequest = async () => {
        // Only request permission if it's in the 'default' state.
        // If it's 'denied' or 'granted', we cannot programmatically change it.
        if (Notification.permission === 'default') {
            const result = await Notification.requestPermission();
            setPermission(result);
        }
    };

    const isChecked = permission === 'granted';

    const description = {
        'default': 'Izinkan notifikasi untuk pengingat penting.',
        'granted': 'Notifikasi diaktifkan untuk perangkat ini.',
        'denied': 'Notifikasi diblokir. Silakan ubah di pengaturan browser Anda.'
    }[permission];

    return (
        <div className="bg-[var(--background-light)] min-h-full">
            <header className="bg-[var(--background-white)]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center p-4 border-b border-[var(--border-light)]">
                <button onClick={() => setActiveFeature('profile')} className="p-2 -ml-2">
                    <ArrowLeftIcon className="size-6 text-[var(--text-primary)]" />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)] text-center flex-1">Notifikasi</h1>
                <div className="w-6 h-6"></div> {/* Spacer */}
            </header>
            <main className="p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--background-white)] rounded-lg border border-[var(--border-light)]">
                    <div>
                        <label htmlFor="device-notification-toggle" className="font-semibold text-[var(--text-primary)] cursor-pointer">
                            Notifikasi di Perangkat
                        </label>
                        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
                    </div>
                    <label htmlFor="device-notification-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            id="device-notification-toggle" 
                            className="sr-only peer" 
                            checked={isChecked} 
                            onChange={handlePermissionRequest} 
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                </div>
                <p className="text-xs text-center text-[var(--text-secondary)] px-4">
                    Pengaturan notifikasi yang lebih spesifik (seperti untuk jadwal atau tugas) akan tersedia di pembaruan mendatang.
                </p>
            </main>
        </div>
    );
};
