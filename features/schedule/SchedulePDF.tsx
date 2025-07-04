import React from 'react';
import { ScheduleItem } from '../../types';
import { AcademicCapIcon } from '../../components/icons/Icons';

interface SchedulePDFProps {
  items: ScheduleItem[];
  title: string;
}

const SchedulePDF = React.forwardRef<HTMLDivElement, SchedulePDFProps>(({ items, title }, ref) => {
    return (
        <div ref={ref} className="bg-white p-12 font-sans relative" style={{ width: '794px', minHeight: '1123px', color: '#111827' }}> 
            <header className="flex justify-between items-center border-b-4 border-gray-800 pb-4 mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
                    <p className="text-lg text-gray-600">Dibuat oleh Asisten Guru Cerdas</p>
                </div>
                <AcademicCapIcon className="w-16 h-16 text-blue-600" />
            </header>

            <main>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                            <th className="p-3 text-sm font-bold uppercase text-gray-600">Tanggal</th>
                            <th className="p-3 text-sm font-bold uppercase text-gray-600">Waktu</th>
                            <th className="p-3 text-sm font-bold uppercase text-gray-600 w-1/3">Judul Kegiatan</th>
                            <th className="p-3 text-sm font-bold uppercase text-gray-600">Tipe</th>
                            <th className="p-3 text-sm font-bold uppercase text-gray-600">Catatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className="border-b border-gray-200">
                                <td className="p-3 align-top">{new Date(item.date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                <td className="p-3 align-top">{item.startTime} - {item.endTime}</td>
                                <td className="p-3 align-top font-semibold">{item.title}</td>
                                <td className="p-3 align-top capitalize">{item.type}</td>
                                <td className="p-3 align-top text-sm">{item.notes || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {items.length === 0 && <p className="text-center text-gray-500 mt-8">Tidak ada data jadwal untuk ditampilkan.</p>}
            </main>

            <footer className="absolute bottom-12 left-12 right-12 mt-16 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                <p>Dokumen ini dibuat secara otomatis oleh aplikasi Asisten Guru Cerdas pada tanggal {new Date().toLocaleDateString('id-ID')}.</p>
            </footer>
        </div>
    );
});

export default SchedulePDF;