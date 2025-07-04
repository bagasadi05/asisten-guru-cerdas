

import React, { useState, useEffect, useCallback } from 'react';
import type { Feature } from '../../App';
import { ArrowLeftIcon } from '../../components/icons/Icons';
import { supabase } from '../../services/supabaseService';
import { Spinner } from '../../components/Spinner';
import { Modal } from '../../components/Modal';

interface TwoFactorAuthViewProps {
    setActiveFeature: (feature: Feature) => void;
}

export const TwoFactorAuthView: React.FC<TwoFactorAuthViewProps> = ({ setActiveFeature }) => {
    
    const renderContent = () => {
        return (
            <div className="text-center space-y-3">
                <h3 className="font-bold text-lg text-[var(--text-primary)]">Fitur Tidak Tersedia</h3>
                <p className="text-[var(--text-secondary)]">
                    Autentikasi dua faktor (2FA) tidak tersedia saat ini. Fitur ini mungkin memerlukan pembaruan pada versi aplikasi Anda.
                </p>
            </div>
        );
    };

    return (
        <div className="bg-[var(--background-light)] min-h-full">
            <header className="bg-white/80 dark:bg-[var(--background-white)]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center p-4 border-b border-[var(--border-light)]">
                <button onClick={() => setActiveFeature('profile-security')} className="p-2 -ml-2">
                    <ArrowLeftIcon className="size-6 text-[var(--text-primary)]" />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)] text-center flex-1">Autentikasi Dua Faktor</h1>
                <div className="w-6 h-6"></div>
            </header>
             <main className="p-4 md:p-6">
                <div className="bg-[var(--background-white)] rounded-lg border border-[var(--border-light)] p-6">
                   {renderContent()}
                </div>
            </main>
        </div>
    );
};
