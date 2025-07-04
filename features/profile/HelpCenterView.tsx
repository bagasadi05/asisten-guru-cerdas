import React, { useState, useMemo } from 'react';
import type { Feature } from '../../App';
import { 
    ArrowLeftIcon, 
    ChevronDownIcon, 
    MagnifyingGlassIcon,
    EnvelopeIcon
} from '../../components/icons/Icons';

// FAQ Item data
const faqData = [
    {
        question: "Bagaimana cara menambah kelas baru?",
        answer: "Anda dapat menambah kelas baru dari halaman 'Evaluasi'. Cukup klik tombol plus (+) di bagian bawah layar untuk membuka formulir penambahan kelas. Masukkan nama kelas dan simpan."
    },
    {
        question: "Di mana saya bisa melihat laporan evaluasi?",
        answer: "Semua laporan evaluasi yang telah Anda simpan dapat diakses melalui menu 'Rapor' di halaman Beranda. Di sana, Anda akan melihat daftar kelas, dan Anda bisa memilih kelas untuk melihat laporan setiap siswa."
    },
    {
        question: "Bisakah saya mengekspor data jadwal saya?",
        answer: "Tentu saja! Buka menu samping (ikon tiga garis di Beranda), lalu pilih 'Ekspor Jadwal'. Ini akan mengunduh file CSV berisi semua data jadwal Anda yang bisa dibuka di Excel atau Google Sheets. Hal yang sama berlaku untuk tugas dan rapor."
    },
    {
        question: "Bagaimana cara mengubah tema aplikasi?",
        answer: "Buka halaman 'Profil Saya' dengan mengklik foto profil Anda di Beranda. Di bagian 'Pengaturan Aplikasi', Anda akan menemukan sakelar untuk mengubah tema antara terang (light) dan gelap (dark)."
    },
    {
        question: "Bagaimana cara Asisten AI membantu saya?",
        answer: "Asisten AI dapat menjawab pertanyaan seputar data Anda. Misalnya, Anda bisa bertanya 'Apa jadwal saya besok?' atau 'Tugas apa yang akan tenggat minggu ini?'. AI akan memeriksa data Anda dan memberikan jawaban langsung di dalam chat."
    },
    {
        question: "Bagaimana cara mengubah nama atau foto profil?",
        answer: "Di halaman 'Profil Saya', Anda bisa mengklik ikon kamera pada foto profil untuk mengunggah gambar baru, atau klik tombol 'Edit Profil' untuk mengubah nama Anda."
    }
];

// Reusable FAQ Item component with accordion logic
const FaqItem: React.FC<{
    item: { question: string, answer: string };
    isOpen: boolean;
    onClick: () => void;
}> = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b border-[var(--border-light)] last:border-b-0">
            <button
                onClick={onClick}
                className="w-full text-left flex items-center justify-between p-4"
            >
                <span className="font-semibold text-base text-[var(--text-primary)]">{item.question}</span>
                <ChevronDownIcon className={`size-5 text-[var(--text-secondary)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            >
                <div className="px-4 pb-4 text-[var(--text-secondary)]">
                    <p>{item.answer}</p>
                </div>
            </div>
        </div>
    );
};

export const HelpCenterView: React.FC<{ setActiveFeature: (feature: Feature) => void; }> = ({ setActiveFeature }) => {
    const [openFaq, setOpenFaq] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleFaq = (question: string) => {
        setOpenFaq(prev => (prev === question ? null : question));
    };

    const filteredFaqs = useMemo(() => {
        if (!searchTerm.trim()) {
            return faqData;
        }
        return faqData.filter(faq =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="bg-[var(--background-light)] min-h-full">
            <header className="bg-[var(--background-white)]/80 dark:bg-[var(--background-white)]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center p-4 border-b border-[var(--border-light)]">
                <button onClick={() => setActiveFeature('profile')} className="p-2 -ml-2">
                    <ArrowLeftIcon className="size-6 text-[var(--text-primary)]" />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)] text-center flex-1">Pusat Bantuan</h1>
                <div className="w-6 h-6"></div>
            </header>
            <main className="p-4 md:p-6 space-y-6">
                {/* Search Bar */}
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[var(--text-secondary)]"/>
                    <input
                        type="text"
                        placeholder="Cari pertanyaan..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--background-white)] border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] text-[var(--text-primary)]"
                    />
                </div>
                
                {/* FAQ List */}
                <div className="bg-[var(--background-white)] rounded-xl shadow-sm border border-[var(--border-light)] overflow-hidden">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map(faq => (
                            <FaqItem
                                key={faq.question}
                                item={faq}
                                isOpen={openFaq === faq.question}
                                onClick={() => toggleFaq(faq.question)}
                            />
                        ))
                    ) : (
                         <p className="text-center text-[var(--text-secondary)] p-8">Tidak ada hasil yang cocok dengan pencarian Anda.</p>
                    )}
                </div>

                {/* Contact Section */}
                <div className="bg-[var(--background-white)] rounded-xl shadow-sm border border-[var(--border-light)] p-5 text-center">
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">Tidak Menemukan Jawaban?</h3>
                    <p className="text-[var(--text-secondary)] mt-1 mb-4">Tim kami siap membantu Anda.</p>
                    <button 
                        onClick={() => setActiveFeature('profile-contact')}
                        className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto px-4 py-2.5 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--primary-color-dark)] transition-colors"
                    >
                       <EnvelopeIcon className="size-5"/> Hubungi Kami
                    </button>
                </div>
            </main>
        </div>
    );
};