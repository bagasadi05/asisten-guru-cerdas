
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseService';
import { SparklesIcon, EnvelopeIcon, LockClosedIcon } from '../../components/icons/Icons'; // Changed AcademicCapIcon to SparklesIcon
import { Spinner } from '../../components/Spinner';

export const AuthView: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let authResponse;
            if (isLoginView) {
                authResponse = await supabase.auth.signInWithPassword({ email, password });
            } else {
                authResponse = await supabase.auth.signUp({ email, password });
                if (!authResponse.error && authResponse.data.user) {
                     alert('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi.');
                }
            }
            
            if (authResponse.error) {
                throw authResponse.error;
            }
            
            // If login/signup is successful, handle "remember me"
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

        } catch (err: any) {
            setError(err.error_description || err.message);
        } finally {
            setLoading(false);
        }
    };

    // Modernized input styles
    const inputStyles = "w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-150 ease-in-out text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-gray-500 shadow-sm";
    const buttonStyles = "w-full py-3 px-4 bg-[var(--primary-color)] text-white font-bold rounded-lg hover:bg-[var(--primary-color-dark)] transition-all duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]";

    return (
        <div className="min-h-dvh bg-[var(--background-light)] flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-4xl mx-auto flex rounded-3xl shadow-2xl overflow-hidden bg-[var(--background-white)]"> {/* Changed to rounded-3xl */}
                {/* Branding Column */}
                <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-[var(--primary-color)] via-blue-500 to-sky-600 p-12 text-white text-center relative overflow-hidden"> {/* Added relative overflow-hidden for pseudo-elements if needed later */}
                    <SparklesIcon className="w-28 h-28 mb-6 text-white/90" />
                    <h2 className="text-3xl font-bold">Asisten Guru Cerdas</h2>
                    <p className="mt-2 opacity-90">Solusi digital untuk guru modern. Efisien, cepat, dan terorganisir.</p>
                </div>

                {/* Form Column */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <div className="text-center md:text-left mb-8">
                         <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                            {isLoginView ? 'Selamat Datang!' : 'Buat Akun Baru'}
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-1">
                            {isLoginView ? 'Masuk untuk melanjutkan' : 'Isi form untuk mendaftar.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        {/* Email Input */}
                        <div className="relative group"> {/* Added group for potential future group-hover effects */}
                            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors duration-150" />
                            <input
                                type="email"
                                placeholder="guru@sekolah.id"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputStyles}
                                required
                            />
                        </div>
                        {/* Password Input */}
                        <div className="relative group"> {/* Added group for potential future group-hover effects */}
                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors duration-150" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputStyles}
                                required
                            />
                        </div>
                        
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--text-secondary)]">
                                Ingat saya
                            </label>
                        </div>
                        
                        {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/40 p-3 rounded-lg">{error}</p>}

                        <button type="submit" className={buttonStyles} disabled={loading}>
                            {loading ? <Spinner size="sm" color="border-white" /> : (isLoginView ? 'Masuk' : 'Daftar')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setIsLoginView(!isLoginView); setError(null); }}
                            className="text-sm font-medium text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] hover:underline transition-colors duration-150 transform hover:scale-105"
                        >
                            {isLoginView ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
