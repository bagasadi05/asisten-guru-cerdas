
import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import type { Feature } from '../../App';
import { Evaluation } from '../../types';
import { 
    DocumentArrowDownIcon,
    ChevronRightIcon,
    PlusIcon,
    ArrowLeftIcon,
    PencilSquareIcon
} from '../../components/icons/Icons';
import { EmptyState } from '../../components/EmptyState';
import { Spinner } from '../../components/Spinner';
import ReportPDF from './ReportPDF';
import { useToast } from '../../components/Toast';

interface ReportListViewProps {
    setActiveFeature: (feature: Feature) => void;
    reports: Evaluation[];
}

const gradientClasses = [
  'bg-gradient-brand',
  'bg-gradient-accent-2',
  'bg-gradient-accent-1',
  'bg-gradient-accent-3',
  'bg-gradient-accent-4',
  'bg-gradient-accent-5',
];

// Reusable Detail Modal for viewing a single report
const DetailModal: React.FC<{
    report: Evaluation | null;
    isOpen: boolean;
    onClose: () => void;
}> = ({ report, isOpen, onClose }) => {
    if (!isOpen || !report) return null;

    const fullDate = new Date(report.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const renderField = (label: string, value: string) => (
        value ? <div><p className="font-semibold text-[var(--text-secondary)]">{label}</p><p className="text-[var(--text-primary)]">{value}</p></div> : null
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[var(--background-white)] rounded-xl shadow-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Rapor {report.studentName}</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">{report.className} - {fullDate}</p>
                
                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                    <div className="p-4 bg-[var(--background-light)] rounded-lg border border-[var(--border-light)] space-y-3">
                        {renderField('Sikap', report.sikap)}
                        {renderField('Akademik', report.akademik)}
                        {renderField('Karakter', report.karakter)}
                        {renderField('Catatan Observasi', report.catatan)}
                        {renderField('Deskripsi Kemampuan', report.deskripsi)}
                    </div>
                    <div>
                         <p className="font-semibold text-[var(--text-secondary)] mb-1">Deskripsi Naratif (AI)</p>
                         <div className="p-4 bg-blue-50 dark:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-800">
                             <p className="text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{report.reportText}</p>
                         </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg">Tutup</button>
                </div>
            </div>
        </div>
    );
};

const ClassReportCard: React.FC<{
    classNameText: string;
    reportCount: number;
    gradientClass: string;
    onClick: () => void;
}> = ({ classNameText, reportCount, gradientClass, onClick }) => (
    <button
        onClick={onClick}
        className={`relative rounded-2xl shadow-lg p-5 flex flex-col h-40 text-white cursor-pointer transform hover:scale-105 transition-transform duration-300 ${gradientClass}`}
    >
        <div className="flex-1 flex flex-col justify-end text-left mt-auto z-10">
            <h3 className="text-2xl font-bold drop-shadow-md">{classNameText}</h3>
            <p className="font-semibold opacity-90 drop-shadow-sm">{reportCount} Laporan Tersedia</p>
        </div>
        <div className="absolute bottom-4 right-4 text-white/50">
            <ChevronRightIcon className="size-8" />
        </div>
    </button>
);

const SingleClassReportView: React.FC<{
    className: string;
    reports: Evaluation[];
    onBack: () => void;
    onSelectReport: (report: Evaluation) => void;
}> = ({ className, reports, onBack, onSelectReport }) => {

    const [loadingPdfId, setLoadingPdfId] = useState<string | null>(null);
    const toast = useToast();

    const handleDownloadStudentPDF = async (report: Evaluation) => {
        if (loadingPdfId) return; // Prevent multiple concurrent downloads
        setLoadingPdfId(report.id);
        toast.info(`Membuat PDF untuk ${report.studentName}...`);

        // 1. Create a temporary off-screen container for rendering
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        document.body.appendChild(container);

        // 2. Render the PDF component into the container
        const root = ReactDOM.createRoot(container);
        root.render(<ReportPDF report={report} />);
        
        // Use a brief timeout to ensure React renders the component before capturing
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const pdfComponent = container.querySelector('div');
            if (!pdfComponent) throw new Error('PDF component failed to render');

            const canvas = await html2canvas(pdfComponent, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/jpeg', 0.92);
            
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgRatio = imgProps.width / imgProps.height;
            let imgWidth = pdfWidth;
            let imgHeight = imgWidth / imgRatio;

            // Fit image to A4 page, scaling if necessary
            if (imgHeight > pdfHeight) {
                imgHeight = pdfHeight;
                imgWidth = imgHeight * imgRatio;
            }

            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            const filename = `Rapor_${report.studentName.replace(/\s+/g, '_')}.pdf`;
            pdf.save(filename);
            toast.success(`${filename} berhasil diunduh!`);

        } catch (error) {
            console.error('Failed to generate PDF:', error);
            toast.error('Gagal membuat PDF. Silakan coba lagi.');
        } finally {
            // 4. Cleanup
            root.unmount();
            document.body.removeChild(container);
            setLoadingPdfId(null);
        }
    };

    const exportClassPDF = async () => {
        if (reports.length === 0) {
            toast.info("Tidak ada laporan di kelas ini untuk diekspor.");
            return;
        }
        toast.info(`Membuat PDF untuk kelas ${className}...`);

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < reports.length; i++) {
            const report = reports[i];
            
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.style.top = '0';
            document.body.appendChild(container);

            const root = ReactDOM.createRoot(container);
            root.render(<ReportPDF report={report} />);
            await new Promise(resolve => setTimeout(resolve, 100));

            try {
                const content = container.querySelector('div');
                if (!content) throw new Error('Komponen PDF gagal dirender');
                const canvas = await html2canvas(content, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/jpeg', 0.92);
                
                const imgProps = pdf.getImageProperties(imgData);
                const imgRatio = imgProps.width / imgProps.height;
                let imgWidth = pdfWidth;
                let imgHeight = imgWidth / imgRatio;
                if (imgHeight > pdfHeight) {
                    imgHeight = pdfHeight;
                    imgWidth = imgHeight * imgRatio;
                }

                if (i > 0) {
                    pdf.addPage();
                }
                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            } catch(e) {
                 console.error("Gagal membuat halaman PDF:", e);
                 toast.error(`Gagal membuat PDF untuk ${report.studentName}.`);
            } finally {
                root.unmount();
                document.body.removeChild(container);
            }
        }
        
        const filename = `rapor_kelas_${className.replace(/\s+/g, '_')}.pdf`;
        pdf.save(filename);
        toast.success(`${filename} berhasil diunduh!`);
    };

    return (
        <div>
            <header className="bg-[var(--background-white)] sticky top-0 z-10 p-4 flex items-center justify-between border-b border-[var(--border-light)]">
                <button onClick={onBack} className="p-2 -ml-2 text-[var(--text-primary)] hover:opacity-70">
                    <ArrowLeftIcon className="size-6"/>
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)] text-center flex-1">Laporan {className}</h1>
                <button onClick={exportClassPDF} disabled={reports.length === 0} className="text-sm font-semibold text-[var(--primary-color)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed">Ekspor Kelas (PDF)</button>
            </header>
            <main className="p-4 space-y-2 pb-32">
                {reports.map(report => (
                    <div key={report.id} className="bg-[var(--background-white)] p-3 rounded-xl shadow-sm border border-[var(--border-light)] flex items-center gap-3 hover:shadow-md transition-shadow duration-200">
                        <div className="flex-grow cursor-pointer" onClick={() => onSelectReport(report)}>
                            <p className="font-bold text-[var(--text-primary)]">{report.studentName}</p>
                            <p className="text-sm text-[var(--text-secondary)]">Akademik: {report.akademik}</p>
                        </div>
                        <button 
                            onClick={() => handleDownloadStudentPDF(report)} 
                            disabled={loadingPdfId === report.id}
                            className="p-2 text-gray-500 hover:text-[var(--primary-color)] rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {loadingPdfId === report.id ? <Spinner size="sm" /> : <DocumentArrowDownIcon className="size-6"/>}
                        </button>
                        <button onClick={() => onSelectReport(report)} className="p-2 text-gray-500 hover:text-[var(--primary-color)] rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors">
                            <ChevronRightIcon className="size-5"/>
                        </button>
                    </div>
                ))}
            </main>
        </div>
    );
};

export const ReportListView: React.FC<ReportListViewProps> = ({ setActiveFeature, reports }) => {
    const [selectedClassName, setSelectedClassName] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<Evaluation | null>(null);

    const reportsByClass = useMemo(() => {
        return reports.reduce((acc, report) => {
            const className = report.className;
            if (!acc[className]) {
                acc[className] = [];
            }
            acc[className].push(report);
            return acc;
        }, {} as Record<string, Evaluation[]>);
    }, [reports]);

    const sortedClassNames = useMemo(() => Object.keys(reportsByClass).sort((a,b) => a.localeCompare(b)), [reportsByClass]);

    if (selectedClassName) {
        return (
            <div className="bg-[var(--background-light)] min-h-full">
                <SingleClassReportView
                    className={selectedClassName}
                    reports={reportsByClass[selectedClassName]}
                    onBack={() => setSelectedClassName(null)}
                    onSelectReport={setSelectedReport}
                />
                <DetailModal report={selectedReport} isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} />
            </div>
        );
    }

    return (
        <div className="bg-[var(--background-light)] min-h-full pb-40">
            <div className="p-6 md:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Daftar Rapor</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Pilih kelas untuk melihat dan mengunduh laporan.</p>
                </header>

                {sortedClassNames.length > 0 ? (
                    <div className="grid grid-cols-1 @md:grid-cols-2 gap-5">
                        {sortedClassNames.map((className, index) => (
                            <ClassReportCard
                                key={className}
                                classNameText={className}
                                reportCount={reportsByClass[className].length}
                                gradientClass={gradientClasses[index % gradientClasses.length]}
                                onClick={() => setSelectedClassName(className)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                        Icon={PencilSquareIcon}
                        title="Belum Ada Rapor"
                        description="Anda belum membuat rapor untuk siswa mana pun. Mulai dengan membuat evaluasi baru."
                        action={
                            <button 
                                onClick={() => setActiveFeature('evaluation')} 
                                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--primary-color-dark)] transition-colors"
                            >
                                <PlusIcon className="size-5"/>
                                Buat Evaluasi
                            </button>
                        }
                    />
                )}
            </div>

            <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40">
                 <button 
                    onClick={() => setActiveFeature('evaluation')}
                    className="flex items-center justify-center rounded-2xl h-16 w-16 bg-[var(--primary-color)] text-white shadow-xl hover:bg-[var(--primary-color-dark)] transition-all duration-300 transform hover:scale-110 active:scale-100"
                    aria-label="Buat rapor baru"
                >
                    <PlusIcon className="size-8" />
                </button>
            </div>
            
            <DetailModal report={selectedReport} isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} />
        </div>
    );
};
