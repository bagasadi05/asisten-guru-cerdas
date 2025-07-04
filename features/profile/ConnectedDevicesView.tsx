

import React, { useState } from 'react';
import type { Feature } from '../../App';
import { ArrowLeftIcon } from '../../components/icons/Icons';
import { supabase } from '../../services/supabaseService';
import { Modal } from '../../components/Modal';
import { Spinner } from '../../components/Spinner';

interface ConnectedDevicesViewProps {
    setActiveFeature: (feature: Feature) => void;
}

export const ConnectedDevicesView: React.FC<ConnectedDevicesViewProps> = ({ setActiveFeature }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSignOut = async () => {
        setLoading(true);
        setMessage(null);
        // Supabase JS v2 signOut() is async.
        const { error } = await supabase.auth.signOut();
        setLoading(false);
        if (error) {
            setMessage(`Gagal: ${error.message}`);
        } else {
            // Success is handled by the onAuthStateChange listener in App.tsx
            // which will redirect to the login view.
            setMessage('Anda akan segera keluar...');
        }
        setIsModalOpen(false);
    };
    
    return (
        <div className="bg-[var(--background-light)] min-h-full">
            <header className="bg-white/80 dark:bg-[var(--background-white)]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center p-4 border-b border-[var(--border-light)]">
                <button onClick={() => setActiveFeature('profile-security')} className="p-2 -ml-2">
                    <ArrowLeftIcon className="size-6 text-[var(--text-primary)]" />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)] text-center flex-1">Perangkat Terhubung</h1>
                <div className="w-6 h-6"></div>
            </header>
            <main className="p-4 md:p-6">
                <div className="bg-[var(--background-white)] rounded-lg border border-[var(--border-light)] p-6 space-y-4">
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">Keluar dari Sesi Ini</h3>
                    <p className="text-[var(--text-secondary)]">
                        Untuk keamanan, Anda dapat keluar dari sesi Anda saat ini di perangkat ini. Anda harus masuk kembali setelahnya.
                    </p>
                    {message && (
                        <p className={`text-sm text-center p-3 rounded-lg ${message.startsWith('Gagal') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {message}
                        </p>
                    )}
                     <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">
                        Keluar dari Sesi Ini
                    </button>
                </div>
                 <div className="bg-[var(--background-white)] rounded-lg border border-[var(--border-light)] p-6 space-y-2 mt-4">
                     <h3 className="font-bold text-lg text-[var(--text-primary)]">Sesi Saat Ini</h3>
                     <p className="text-[var(--text-secondary)]">Fitur untuk melihat daftar semua sesi aktif akan tersedia di pembaruan mendatang.</p>
                 </div>
            </main>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Konfirmasi Keluar">
                <p className="text-[var(--text-secondary)]">
                    Anda yakin ingin keluar dari sesi saat ini? Anda harus masuk kembali setelahnya.
                </p>
                <div className="flex justify-end gap-3 pt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Batal</button>
                    <button onClick={handleSignOut} disabled={loading} className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">
                        {loading ? <Spinner size="sm" /> : 'Ya, Keluar'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};
