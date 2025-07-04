
import React, { useState, useCallback } from 'react';
import { Classroom, Student, Evaluation } from '../../types';
import { ArrowLeftIcon, CheckIcon, UserCircleOutlineIcon, SparklesIcon } from '../../components/icons/Icons';
import { generateContent } from '../../services/geminiService';
import { Spinner } from '../../components/Spinner';

interface EvaluationFlowProps {
  classroom: Classroom;
  evaluationOptions: { sikap: string[]; akademik: string[]; karakter: string[] };
  onSave: (newEvaluation: Omit<Evaluation, 'id'>) => Promise<void>;
  onCancel: () => void;
}

type Step = 'selectStudent' | 'fillForm' | 'review';

const RadioGroup = ({ name, options, value, onChange, label }: { name: string, options: string[], value: string, onChange: (val: string) => void, label: string }) => (
    <div>
        <label className="block text-base font-semibold text-[var(--text-primary)] mb-2">{label}</label>
        <div className="space-y-2">
            {options.map(option => (
                <label key={option} className="flex items-center p-3 w-full bg-[var(--background-white)] border border-[var(--border-light)] rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-[var(--primary-color)] transition-colors">
                    <input type="radio" name={name} value={option} checked={value === option} onChange={e => onChange(e.target.value)} className="hidden" />
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center mr-3 ${value === option ? 'border-[var(--primary-color)] bg-[var(--primary-color)]' : 'border-gray-300 dark:border-gray-600'}`}>
                        {value === option && <CheckIcon className="size-3 text-white"/>}
                    </div>
                    <span className={`font-medium ${value === option ? 'text-[var(--primary-color)]' : 'text-[var(--text-primary)]'}`}>{option}</span>
                </label>
            ))}
        </div>
    </div>
);

export const EvaluationFlow: React.FC<EvaluationFlowProps> = ({ classroom, evaluationOptions, onSave, onCancel }) => {
    const [step, setStep] = useState<Step>('selectStudent');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        sikap: evaluationOptions.sikap[0],
        akademik: evaluationOptions.akademik[0],
        karakter: evaluationOptions.karakter[0],
        catatan: '',
        deskripsi: '',
    });
    const [narrative, setNarrative] = useState('');

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setStep('fillForm');
    };
    
    const handleFormChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerate = useCallback(async () => {
        if (!selectedStudent) return;
        setIsLoading(true);
        setError('');

        const prompt = `Anda adalah seorang asisten guru yang ahli dalam membuat laporan perkembangan siswa. Berdasarkan data evaluasi berikut untuk siswa bernama "${selectedStudent.name}" di kelas "${classroom.name}", buatlah sebuah deskripsi naratif rapor yang profesional, membangun, dan positif dalam Bahasa Indonesia.
        
Sajikan dalam 1-2 paragraf yang koheren. Hindari penggunaan poin-poin. Fokus pada kekuatan siswa dan berikan saran perbaikan yang dapat ditindaklanjuti secara halus.

Data Evaluasi:
- Sikap & Perilaku: ${formData.sikap}
- Kemampuan Akademik: ${formData.akademik}
- Pengembangan Karakter: ${formData.karakter}
- Catatan Observasi Guru: ${formData.catatan || '(tidak ada)'}
- Deskripsi Kemampuan Spesifik: ${formData.deskripsi || '(tidak ada)'}
`;

        try {
            const result = await generateContent(prompt);
            setNarrative(result);
            setStep('review');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal menghasilkan narasi.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedStudent, classroom.name, formData]);

    const handleSaveEvaluation = async () => {
        if (!selectedStudent || isSaving) return;
        setIsSaving(true);
        const newEvaluation: Omit<Evaluation, 'id'> = {
            studentId: selectedStudent.id,
            studentName: selectedStudent.name,
            classId: classroom.id,
            className: classroom.name,
            date: new Date().toISOString().split('T')[0],
            ...formData,
            reportText: narrative,
        };
        await onSave(newEvaluation);
        setIsSaving(false);
    };

    const goBack = () => {
        if (step === 'review') setStep('fillForm');
        else if (step === 'fillForm') setStep('selectStudent');
    }
    
    const textAreaStyles = "w-full p-3 border border-[var(--border-light)] rounded-lg bg-[var(--background-white)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)]";
    
    return (
        <div className="bg-[var(--background-light)] min-h-full flex flex-col">
            <header className="sticky top-0 bg-[var(--background-white)]/80 backdrop-blur-sm z-10 p-4 flex items-center justify-between border-b border-[var(--border-light)]">
                 {(step === 'fillForm' || step === 'review') && 
                    <button onClick={goBack} className="p-2 -ml-2 text-[var(--text-primary)] hover:opacity-70">
                        <ArrowLeftIcon className="size-6"/>
                    </button>
                 }
                 <div className="text-center flex-1">
                    <div className="text-sm font-medium text-[var(--text-secondary)]">
                        {step === 'selectStudent' && 'Langkah 1 dari 3'}
                        {step === 'fillForm' && 'Langkah 2 dari 3'}
                        {step === 'review' && 'Langkah 3 dari 3'}
                    </div>
                    <h1 className="text-lg font-bold text-[var(--text-primary)] -mt-1">
                        {step === 'selectStudent' && 'Pilih Siswa'}
                        {step === 'fillForm' && `Evaluasi: ${selectedStudent?.name}`}
                        {step === 'review' && `Tinjau Rapor`}
                    </h1>
                </div>
                <button onClick={onCancel} className="text-sm font-semibold text-[var(--primary-color)]">Batalkan</button>
            </header>

            <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
                {step === 'selectStudent' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {classroom.students.map(student => (
                            <button key={student.id} onClick={() => handleSelectStudent(student)} className="flex flex-col items-center p-4 bg-[var(--background-white)] rounded-xl border border-transparent hover:border-[var(--primary-color)] hover:shadow-lg transition-all text-center">
                                <UserCircleOutlineIcon className="size-16 text-gray-300 dark:text-gray-600 mb-2"/>
                                <span className="font-semibold text-[var(--text-primary)]">{student.name}</span>
                            </button>
                        ))}
                    </div>
                )}
                {step === 'fillForm' && (
                    <div className="space-y-6">
                        <RadioGroup label="Bagaimana sikap dan perilaku siswa secara umum?" name="sikap" options={evaluationOptions.sikap} value={formData.sikap} onChange={(val) => handleFormChange('sikap', val)} />
                        <RadioGroup label="Bagaimana kemampuan akademik siswa?" name="akademik" options={evaluationOptions.akademik} value={formData.akademik} onChange={(val) => handleFormChange('akademik', val)} />
                        <RadioGroup label="Bagaimana perkembangan karakter siswa?" name="karakter" options={evaluationOptions.karakter} value={formData.karakter} onChange={(val) => handleFormChange('karakter', val)} />
                        
                        <div>
                            <label htmlFor="catatan" className="block text-base font-semibold text-[var(--text-primary)] mb-2">Catatan Observasi (Opsional)</label>
                            <textarea id="catatan" rows={3} value={formData.catatan} onChange={e => handleFormChange('catatan', e.target.value)} className={textAreaStyles} placeholder="Contoh: Budi sangat aktif bertanya selama pelajaran IPA..."></textarea>
                        </div>
                         <div>
                            <label htmlFor="deskripsi" className="block text-base font-semibold text-[var(--text-primary)] mb-2">Deskripsi Kemampuan Spesifik (Opsional)</label>
                            <textarea id="deskripsi" rows={3} value={formData.deskripsi} onChange={e => handleFormChange('deskripsi', e.target.value)} className={textAreaStyles} placeholder="Contoh: Sudah mampu menyelesaikan perkalian dua digit dengan mandiri."></textarea>
                        </div>

                        <button onClick={handleGenerate} disabled={isLoading} className="w-full flex items-center justify-center gap-3 mt-4 px-4 py-3 text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 transition-transform duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98]">
                            {isLoading ? <Spinner size="sm" /> : <><SparklesIcon className="size-6" /> Buat Draf Laporan (AI)</>}
                        </button>
                        {error && <p className="text-red-500 text-center">{error}</p>}
                    </div>
                )}
                {step === 'review' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Draf Laporan Naratif</h2>
                        <textarea value={narrative} onChange={e => setNarrative(e.target.value)} rows={10} className="w-full p-4 border border-[var(--primary-color)] rounded-lg bg-blue-50/50 dark:bg-blue-900/30 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)]"></textarea>
                        <button onClick={handleSaveEvaluation} disabled={isSaving} className="w-full mt-4 px-4 py-3 text-white bg-green-600 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 transition-transform duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98]">
                            {isSaving ? 'Menyimpan...' : 'Simpan Rapor Final'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};