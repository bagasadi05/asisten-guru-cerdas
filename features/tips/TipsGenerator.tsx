import React, { useState, useRef, useEffect } from 'react';
import type { Feature } from '../../App';
import { ArrowLeftIcon, SparklesIcon, PaperAirplaneIcon } from '../../components/icons/Icons';
import { generateContent } from '../../services/geminiService';
import { Spinner } from '../../components/Spinner';
import { ScheduleItem, TaskItem, Classroom, Message } from '../../types';

interface TipsGeneratorProps {
    setActiveFeature: (feature: Feature) => void;
    schedule: ScheduleItem[];
    tasks: TaskItem[];
    classrooms: Classroom[];
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const SuggestionChip: React.FC<{ text: string, onClick: (text: string) => void }> = ({ text, onClick }) => (
    <button
        onClick={() => onClick(text)}
        className="px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
    >
        {text}
    </button>
);

export const TipsGenerator: React.FC<TipsGeneratorProps> = ({ setActiveFeature, schedule, tasks, classrooms, messages, setMessages }) => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (text: string) => {
        const content = text.trim();
        if (!content || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), text: content, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        const prompt = `
            Anda adalah "Asisten Guru Cerdas", sebuah AI yang membantu guru sekolah dasar di Indonesia.
            Tugas Anda adalah menjawab pertanyaan guru berdasarkan data yang relevan dari aplikasi mereka.
            Selalu berikan jawaban yang jelas, singkat, dan dalam Bahasa Indonesia.

            Berikut adalah data saat ini dari aplikasi:
            1. Jadwal Hari Ini: ${JSON.stringify(schedule.filter(s => new Date(s.date).toDateString() === new Date().toDateString()))}
            2. Seluruh Jadwal: ${JSON.stringify(schedule)}
            3. Daftar Tugas (yang belum selesai): ${JSON.stringify(tasks.filter(t => t.status !== 'Selesai'))}
            4. Seluruh Tugas: ${JSON.stringify(tasks)}
            5. Daftar Kelas dan Siswa: ${JSON.stringify(classrooms)}

            Pertanyaan Guru: "${content}"

            Berdasarkan data di atas, berikan jawaban yang paling relevan dan membantu. Jika data tidak tersedia atau pertanyaan di luar konteks, beritahu dengan sopan.
        `;

        try {
            const aiResponseText = await generateContent(prompt);
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponseText,
                sender: 'ai'
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (e) {
             const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan tidak dikenal.';
             setError(errorMessage);
             const errorResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: `Maaf, terjadi kesalahan saat menghubungi AI: ${errorMessage}`,
                sender: 'ai'
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputValue);
    };
    
    const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
        const isAI = message.sender === 'ai';
        return (
            <div className={`flex items-end gap-2 ${isAI ? 'justify-start' : 'justify-end'}`}>
                {isAI && (
                    <div className="flex-shrink-0 size-8 bg-gradient-to-br from-blue-500 to-sky-400 text-white flex items-center justify-center rounded-full">
                        <SparklesIcon className="size-5" />
                    </div>
                )}
                <div className={`max-w-sm md:max-w-md rounded-2xl px-4 py-3 shadow-sm ${isAI ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none' : 'bg-[var(--primary-color)] text-white rounded-br-none'}`}>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
                </div>
            </div>
        );
    };
    
    const showSuggestions = messages.length === 1;

    return (
        <div className="flex flex-col h-full bg-[var(--background-light)]">
            <header className="sticky top-0 z-10 bg-[var(--background-white)]/80 backdrop-blur-sm p-4 flex items-center justify-center border-b border-[var(--border-light)]">
                <h1 className="text-[var(--text-primary)] text-xl font-bold">Asisten AI</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}

                {showSuggestions && !isLoading && (
                    <div className="flex flex-wrap justify-center gap-2 pt-2 animate-fade-in">
                        <SuggestionChip text="Jadwal saya hari ini?" onClick={handleSendMessage} />
                        <SuggestionChip text="Tugas apa yang akan datang?" onClick={handleSendMessage} />
                        <SuggestionChip text="Ada berapa siswa di kelas 1A?" onClick={handleSendMessage} />
                    </div>
                )}
                
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="flex items-end gap-2">
                            <div className="flex-shrink-0 size-8 bg-gradient-to-br from-blue-500 to-sky-400 text-white flex items-center justify-center rounded-full">
                                <SparklesIcon className="size-5" />
                            </div>
                            <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-none">
                                <div className="flex items-center gap-2">
                                    <span className="size-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                    <span className="size-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                    <span className="size-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                 {error && <div className="text-center text-red-500 p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>}
                <div ref={chatEndRef} />
            </main>

            <footer className="bg-[var(--background-white)]/80 backdrop-blur-sm border-t border-[var(--border-light)] p-3">
                <form onSubmit={handleFormSubmit} className="flex items-center gap-2 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ketik pertanyaan Anda di sini..."
                        className="flex-1 w-full p-3 bg-gray-100 dark:bg-gray-800 border-transparent rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:bg-white dark:focus:bg-gray-900 transition-all text-[var(--text-primary)]"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        className="flex-shrink-0 size-12 flex items-center justify-center bg-[var(--primary-color)] text-white rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        aria-label="Kirim Pesan"
                    >
                        {isLoading ? <Spinner size="sm" color="border-white"/> : <PaperAirplaneIcon className="size-6"/>}
                    </button>
                </form>
            </footer>
        </div>
    );
};
