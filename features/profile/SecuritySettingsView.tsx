import React from 'react';
import type { Feature } from '../../App';
import { ArrowLeftIcon, ChevronRightIcon } from '../../components/icons/Icons';

interface SecuritySettingsViewProps {
    setActiveFeature: (feature: Feature) => void;
}

const SettingsItem: React.FC<{label: string, onClick: () => void}> = ({label, onClick}) => (
     <button onClick={onClick} className="w-full text-left flex items-center justify-between p-4 bg-[var(--background-white)] rounded-lg border border-[var(--border-light)] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <span className="font-semibold text-[var(--text-primary)]">{label}</span>
        <ChevronRightIcon className="size-5 text-gray-400" />
    </button>
);

export const SecuritySettingsView: React.FC<SecuritySettingsViewProps> = ({ setActiveFeature }) => {
    return (
        <div className="bg-[var(--background-light)] min-h-full">
            <header className="bg-white/80 dark:bg-[var(--background-white)]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center p-4 border-b border-[var(--border-light)]">
                <button onClick={() => setActiveFeature('profile')} className="p-2 -ml-2">
                    <ArrowLeftIcon className="size-6 text-[var(--text-primary)]" />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)] text-center flex-1">Keamanan Akun</h1>
                <div className="w-6 h-6"></div>
            </header>
            <main className="p-4 md:p-6 space-y-4">
                <SettingsItem label="Ubah Kata Sandi" onClick={() => setActiveFeature('profile-change-password')} />
                <SettingsItem label="Autentikasi Dua Faktor" onClick={() => setActiveFeature('profile-2fa')} />
                <SettingsItem label="Perangkat Terhubung" onClick={() => setActiveFeature('profile-devices')} />
            </main>
        </div>
    );
};
