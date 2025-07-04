import React from 'react';
import { Evaluation } from '../../types';
import { AcademicCapIcon } from '../../components/icons/Icons';

interface ReportPDFProps {
  report: Evaluation;
}

const ReportPDF = React.forwardRef<HTMLDivElement, ReportPDFProps>(({ report }, ref) => {
    
    // Component to structure sections of the report
    const Section: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({title, children, className = ''}) => (
        <div className={`mb-6 ${className}`}>
            <h3 className="text-xl font-bold border-b-2 border-gray-700 pb-1 mb-3 text-gray-800">{title}</h3>
            <div className="text-gray-700 text-base leading-relaxed">{children}</div>
        </div>
    );

    return (
        // A4 paper size in pixels at 96 DPI is roughly 794x1123.
        // The styling is self-contained and uses basic tailwind classes that should be available.
        <div ref={ref} className="bg-white p-12 font-sans relative" style={{ width: '794px', minHeight: '1123px', color: '#111827' }}> 
            <header className="flex justify-between items-start border-b-4 border-gray-800 pb-4 mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Rapor Siswa</h1>
                    <p className="text-lg text-gray-600">Laporan Perkembangan Belajar</p>
                </div>
                <div className="flex flex-col items-end">
                    <AcademicCapIcon className="w-16 h-16 text-blue-600 mb-2" />
                    <p className="text-md font-semibold text-gray-700">Asisten Guru Cerdas</p>
                </div>
            </header>

            <main>
                <div className="grid grid-cols-3 gap-6 mb-10 text-center">
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Nama Siswa</p>
                        <p className="text-xl font-bold text-gray-800 mt-1">{report.studentName}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Kelas</p>
                        <p className="text-xl font-bold text-gray-800 mt-1">{report.className}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Tanggal</p>
                        <p className="text-lg font-semibold text-gray-800 mt-1">{new Date(report.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
                
                <Section title="Evaluasi Umum">
                    <table className="w-full text-base">
                        <tbody>
                            <tr className="border-b border-gray-200"><td className="py-3 pr-4 font-semibold w-1/3">Sikap & Perilaku</td><td className="py-2">{report.sikap}</td></tr>
                            <tr className="border-b border-gray-200"><td className="py-3 pr-4 font-semibold w-1/3">Kemampuan Akademik</td><td className="py-2">{report.akademik}</td></tr>
                            <tr><td className="py-3 pr-4 font-semibold w-1/3">Pengembangan Karakter</td><td className="py-2">{report.karakter}</td></tr>
                        </tbody>
                    </table>
                </Section>

                {report.catatan && (
                    <Section title="Catatan Observasi Guru">
                        <p className="italic">{report.catatan}</p>
                    </Section>
                )}

                {report.deskripsi && (
                    <Section title="Deskripsi Kemampuan Spesifik">
                       <p className="italic">{report.deskripsi}</p>
                    </Section>
                )}
                
                <Section title="Deskripsi Naratif" className="mt-8">
                    <div className="p-4 bg-blue-50/70 border-l-4 border-blue-500 rounded-r-lg">
                         <p className="whitespace-pre-wrap text-blue-900">{report.reportText}</p>
                    </div>
                </Section>
            </main>

            <footer className="absolute bottom-12 left-12 right-12 mt-16 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                <p>Dokumen ini dibuat secara otomatis oleh aplikasi Asisten Guru Cerdas pada tanggal {new Date().toLocaleDateString('id-ID')}.</p>
            </footer>
        </div>
    );
});

export default ReportPDF;