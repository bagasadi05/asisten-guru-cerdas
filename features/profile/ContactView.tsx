
import React from 'react';
import type { Feature } from '../../App';
import { ArrowLeftIcon } from '../../components/icons/Icons';

interface ContactViewProps {
    setActiveFeature: (feature: Feature) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ setActiveFeature }) => {
    return (
        <div className="bg-[var(--background-light)] min-h-full">
            <header className="bg-white/80 dark:bg-[var(--background-white)]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center p-4 border-b border-[var(--border-light)]">
                <button onClick={() => setActiveFeature('profile')} className="p-2 -ml-2">
                    <ArrowLeftIcon className="size-6 text-[var(--text-primary)]" />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)] text-center flex-1">Hubungi Kami</h1>
                <div className="w-6 h-6"></div>
            </header>
            <main className="p-4 md:p-6">
                <div className="bg-[var(--background-white)] rounded-lg border border-[var(--border-light)] p-6 space-y-4">
                    <p className="text-[var(--text-secondary)]">Jika Anda memerlukan bantuan atau memiliki pertanyaan, jangan ragu untuk menghubungi tim dukungan kami.</p>
                    <div>
                        <label className="font-semibold text-[var(--text-primary)]">Email Dukungan</label>
                        <p className="text-[var(--primary-color)]">support@asistenguru.id</p>
                    </div>
                     <div>
                        <label className="font-semibold text-[var(--text-primary)]">Jam Operasional</label>
                        <p className="text-[var(--text-secondary)]">Senin - Jumat, 09:00 - 17:00 WIB</p>
                    </div>
                     <button className="w-full mt-4 p-3 bg-[var(--primary-color)] text-white font-bold rounded-lg hover:bg-[var(--primary-color-dark)] transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Kirim Pesan</button>
                </div>
            </main>
        </div>
    );
};