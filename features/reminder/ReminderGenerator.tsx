
import React, { useState, useCallback } from 'react';
import { generateContent } from '../../services/geminiService';
import { Card, CardHeader } from '../../components/Card';
import { Spinner } from '../../components/Spinner';
import { BellAlertIcon, ClipboardIcon, CheckBadgeIcon, ArrowLeftIcon } from '../../components/icons/Icons';
import type { Feature } from '../../App';

interface ReminderGeneratorProps {
    setActiveFeature: (feature: Feature) => void;
}

export const ReminderGenerator: React.FC<ReminderGeneratorProps> = ({ setActiveFeature }) => {
    const [event, setEvent] = useState('');
    const [reminder, setReminder] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);


    const handleGenerate = useCallback(async () => {
        if (!event.trim()) {
            setError('Mohon masukkan info kegiatan untuk pengingat.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setReminder('');

        const prompt = `
            Buat sebuah pesan pengingat (reminder) yang singkat, jelas, dan profesional untuk seorang guru berdasarkan informasi berikut.
            Pesan ini harus mudah dimengerti dan cocok untuk notifikasi cepat.

            Informasi Kegiatan: "${event}"
        `;

        try {
            const result = await generateContent(prompt);
            setReminder(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Terjadi kesalahan tidak dikenal');
        } finally {
            setIsLoading(false);
        }
    }, [event]);

    const handleCopy = () => {
        if (reminder) {
            navigator.clipboard.writeText(reminder);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };


    return (
        <div className="p-4 bg-[var(--background-light)] min-h-full">
             <header className="sticky top-0 z-10 bg-transparent flex items-center justify-between mb-4">
                 <button onClick={() => setActiveFeature('home')} className="p-2 -ml-2">
                    <ArrowLeftIcon className="size-6 text-[var(--text-primary)]" />
                </button>
                 <h1 className="text-[var(--text-primary)] text-xl font-bold flex-1 text-center">Generator Pengingat</h1>
                <div className="w-6 h-6"></div>
             </header>
             <Card>
                <CardHeader
                    icon={<BellAlertIcon className="w-8 h-8"/>}
                    title="Notifikasi & Pengingat"
                    description="Buat teks pengingat ringkas untuk tugas atau acara penting."
                    iconBgColor="bg-purple-100 dark:bg-purple-900/50"
                    iconColor="text-purple-600 dark:text-purple-400"
                />

                <div className="p-5 pt-0">
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={event}
                            onChange={e => setEvent(e.target.value)}
                            placeholder="Contoh: Deadline input nilai hari Jumat jam 3 sore"
                            className="w-full p-3 bg-[var(--background-white)] border border-[var(--border-light)] rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-shadow text-[var(--text-primary)]"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full px-4 py-3 text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-dark)] transition-colors duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                        >
                            {isLoading ? <Spinner size="sm" /> : 'Buat Teks Pengingat'}
                        </button>
                    </div>

                    {error && <p className="mt-4 text-center text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300 p-3 rounded-lg">{error}</p>}
                    
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 border-b border-[var(--border-light)] pb-2">Hasil Teks Pengingat:</h3>
                        {isLoading && <div className="py-8"><Spinner /></div>}
                        
                        {reminder && (
                             <div className="relative p-4 bg-blue-50 dark:bg-blue-900/40 border-l-4 border-[var(--primary-color)] rounded-r-lg">
                                <button onClick={handleCopy} className="absolute top-2 right-2 p-2 text-slate-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors">
                                   {copied ? <CheckBadgeIcon className="w-5 h-5 text-green-600"/> : <ClipboardIcon className="w-5 h-5"/>}
                                </button>
                                <p className="text-blue-800 dark:text-blue-200 leading-relaxed">{reminder}</p>
                            </div>
                        )}
                        {!isLoading && !reminder && !error && (
                             <div className="text-center text-[var(--text-secondary)] py-8">
                                <p>Teks pengingat akan muncul di sini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};
