

import React, { useState } from 'react';
import type { Feature } from '../../App';
import { ArrowLeftIcon, LockClosedIcon } from '../../components/icons/Icons';
import { supabase } from '../../services/supabaseService';
import { Spinner } from '../../components/Spinner';

interface ChangePasswordViewProps {
    setActiveFeature: (feature: Feature) => void;
}

export const ChangePasswordView: React.FC<ChangePasswordViewProps> = ({ setActiveFeature }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password.length < 6) {
            setError('Kata sandi harus memiliki minimal 6 karakter.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Kata sandi baru tidak cocok.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            setSuccess('Kata sandi berhasil diperbarui!');
            setPassword('');
            setConfirmPassword('');
        }
    };

    const inputStyles = "w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors text-[var(--text-primary)]";
    
    return (
        <div className="bg-[var(--background-light)] min-h-full">
            <header className="bg-white/80 dark:bg-[var(--background-white)]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center p-4 border-b border-[var(--border-light)]">
                <button onClick={() => setActiveFeature('profile-security')} className="p-2 -ml-2">
                    <ArrowLeftIcon className="size-6 text-[var(--text-primary)]" />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)] text-center flex-1">Ubah Kata Sandi</h1>
                <div className="w-6 h-6"></div>
            </header>
            <main className="p-4 md:p-6">
                <div className="bg-[var(--background-white)] rounded-lg border border-[var(--border-light)] p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400"/>
                            <input
                                type="password"
                                placeholder="Kata Sandi Baru"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputStyles}
                                required
                            />
                        </div>
                         <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400"/>
                            <input
                                type="password"
                                placeholder="Konfirmasi Kata Sandi Baru"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={inputStyles}
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/40 p-3 rounded-lg">{error}</p>}
                        {success && <p className="text-green-600 text-sm text-center bg-green-100 dark:bg-green-900/40 p-3 rounded-lg">{success}</p>}

                        <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-[var(--primary-color)] text-white font-bold rounded-lg hover:bg-[var(--primary-color-dark)] transition-transform duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center">
                             {loading ? <Spinner size="sm" color="border-white" /> : 'Simpan Perubahan'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};
