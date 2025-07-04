import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ScheduleItem } from '../../types';
import type { Feature } from '../../App';
import { 
    BookOpenIcon, 
    UsersSolidIcon, 
    FileIcon, 
    FlaskIcon,
    PlusIcon,
    TrashIcon,
    ArrowLeftIcon,
    CalendarDaysIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PencilIcon,
} from '../../components/icons/Icons';
import { EmptyState } from '../../components/EmptyState';

interface ScheduleViewProps {
    schedule: ScheduleItem[];
    addSchedule: (item: Omit<ScheduleItem, 'id' | 'user_id'>, repeatOption: string, repeatUntil: string) => Promise<void>;
    updateSchedule: (id: string, item: Omit<ScheduleItem, 'id' | 'user_id'>) => Promise<void>;
    deleteSchedule: (id: string) => Promise<void>;
    setActiveFeature: (feature: Feature) => void;
    initialItemId: string | null;
}

// --- Date Helper Functions ---
const isSameDay = (d1: Date, d2: Date): boolean => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const isToday = (d: Date): boolean => isSameDay(d, new Date());

// A robust function to generate 42 days (6 weeks) for a calendar grid
const generateCalendarDays = (dateInMonth: Date): Date[] => {
    const year = dateInMonth.getFullYear();
    const month = dateInMonth.getMonth();
    
    // Get the first Sunday of the week containing the 1st of the month.
    const firstDayOfMonth = new Date(year, month, 1);
    const firstSunday = new Date(firstDayOfMonth);
    firstSunday.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

    // Now, simply generate 42 days (6 weeks) from this starting Sunday.
    return Array.from({ length: 42 }, (_, i) => {
        const day = new Date(firstSunday);
        day.setDate(day.getDate() + i);
        return day;
    });
};

const typeStyles: { [key in ScheduleItem['type']]: { icon: React.FC<any>; color: string; bgColor: string; name: string } } = {
    mengajar: { icon: BookOpenIcon, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/50', name: 'Mengajar' },
    rapat: { icon: UsersSolidIcon, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/50', name: 'Rapat' },
    administrasi: { icon: FileIcon, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/50', name: 'Administrasi' },
    lainnya: { icon: FlaskIcon, color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-100 dark:bg-teal-900/50', name: 'Lainnya' },
};

const TimelineItem: React.FC<{ item: ScheduleItem; onClick: () => void }> = ({ item, onClick }) => {
    const { icon: Icon, color, bgColor } = typeStyles[item.type];
    return (
         <div className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0 w-16">
                <p className="font-bold text-[var(--text-primary)] text-sm">{item.startTime}</p>
                <div className="relative flex-grow w-0.5 bg-gray-200 dark:bg-gray-700 my-1">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-3.5 rounded-full bg-[var(--background-light)] border-2 border-[var(--primary-color)]"></div>
                </div>
            </div>
            <div className="flex-1 pb-6">
                <button onClick={onClick} className="w-full text-left flex items-center gap-4 bg-[var(--background-white)] p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-[var(--border-light)]">
                    <div className={`flex items-center justify-center rounded-lg shrink-0 size-11 ${color} ${bgColor}`}>
                        <Icon className="size-6" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[var(--text-primary)] text-base font-semibold leading-normal">{item.title}</p>
                        <p className="text-[var(--text-secondary)] text-sm font-medium leading-normal">{item.startTime} - {item.endTime}</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

const AddEditScheduleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Omit<ScheduleItem, 'id' | 'user_id'>, repeatOption: string, repeatUntil: string, id?: string) => Promise<void>;
    itemToEdit: ScheduleItem | null;
    initialDate: Date;
}> = ({ isOpen, onClose, onSave, itemToEdit, initialDate }) => {
    const getInitialState = useCallback((date: Date) => ({
        title: '',
        date: date.toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '09:00',
        type: 'mengajar' as ScheduleItem['type'],
        notes: ''
    }), []);
    
    const [itemData, setItemData] = useState(() => getInitialState(initialDate));
    const [repeatOption, setRepeatOption] = useState('none');
    const [repeatUntil, setRepeatUntil] = useState('');

    useEffect(() => {
        if (isOpen) {
            setRepeatOption('none');
            setRepeatUntil('');
            if (itemToEdit) {
                setItemData({
                    title: itemToEdit.title,
                    date: itemToEdit.date,
                    startTime: itemToEdit.startTime,
                    endTime: itemToEdit.endTime,
                    type: itemToEdit.type,
                    notes: itemToEdit.notes
                });
            } else {
                setItemData(getInitialState(initialDate));
            }
        }
    }, [isOpen, itemToEdit, initialDate, getInitialState]);


    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(itemData, repeatOption, repeatUntil, itemToEdit?.id);
        onClose();
    };
    
    const inputStyles = "w-full p-3 bg-[var(--background-light)] border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] text-[var(--text-primary)]";
    const selectStyles = "w-full p-3 bg-[var(--background-light)] border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] text-[var(--text-primary)] appearance-none bg-no-repeat bg-right";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-[var(--background-white)] rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)]">{itemToEdit ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <input type="text" placeholder="Nama Kegiatan" value={itemData.title} onChange={e => setItemData({ ...itemData, title: e.target.value })} className={inputStyles} required />
                     <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={itemData.date} onChange={e => setItemData({ ...itemData, date: e.target.value })} className={inputStyles} required />
                        <select value={itemData.type} onChange={e => setItemData({ ...itemData, type: e.target.value as ScheduleItem['type'] })} className={inputStyles}>
                            <option value="mengajar">Mengajar</option>
                            <option value="rapat">Rapat</option>
                            <option value="administrasi">Administrasi</option>
                            <option value="lainnya">Lainnya</option>
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="time" value={itemData.startTime} onChange={e => setItemData({ ...itemData, startTime: e.target.value })} className={inputStyles} required />
                        <input type="time" value={itemData.endTime} onChange={e => setItemData({ ...itemData, endTime: e.target.value })} className={inputStyles} required />
                     </div>
                     <textarea placeholder="Catatan (opsional)" value={itemData.notes} onChange={e => setItemData({ ...itemData, notes: e.target.value })} className={`${inputStyles} h-24`} rows={3}></textarea>
                     
                     {!itemToEdit && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-[var(--border-light)]">
                            <h3 className="text-md font-semibold mb-2 text-[var(--text-primary)]">Pengulangan</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <select value={repeatOption} onChange={e => setRepeatOption(e.target.value)} className={inputStyles}>
                                    <option value="none">Tidak berulang</option>
                                    <option value="weekly">Setiap minggu</option>
                                </select>
                                {repeatOption !== 'none' && (
                                    <input 
                                        type="date" 
                                        value={repeatUntil} 
                                        onChange={e => setRepeatUntil(e.target.value)} 
                                        className={inputStyles} 
                                        required={repeatOption !== 'none'}
                                        title="Ulangi hingga tanggal"
                                        min={itemData.date}
                                    />
                                )}
                            </div>
                            {repeatOption !== 'none' && !repeatUntil && <p className="text-xs text-red-500 mt-2">Pilih tanggal akhir pengulangan.</p>}
                        </div>
                    )}

                     <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Batal</button>
                        <button type="submit" className="px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Simpan</button>
                     </div>
                </form>
            </div>
        </div>
    );
};

const DetailModal: React.FC<{
    item: ScheduleItem | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: (id: string) => Promise<void>;
    onEdit: (item: ScheduleItem) => void;
}> = ({ item, isOpen, onClose, onDelete, onEdit }) => {
    if (!isOpen || !item) return null;

    const { icon: Icon, color, name, bgColor } = typeStyles[item.type];
    const fullDate = new Date(item.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const handleDelete = async () => {
        if (window.confirm(`Anda yakin ingin menghapus kegiatan "${item.title}"?`)) {
            await onDelete(item.id);
            onClose();
        }
    };

    const handleEdit = () => {
        onEdit(item);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-[var(--background-white)] rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-start gap-4 mb-5">
                    <div className={`flex items-center justify-center rounded-xl shrink-0 size-16 ${bgColor}`}><Icon className={`size-8 ${color}`} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{item.title}</h2>
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${bgColor} ${color}`}>{name}</span>
                    </div>
                </div>
                <div className="space-y-3 text-[var(--text-secondary)] border-t border-[var(--border-light)] pt-4">
                    <p><strong>Tanggal:</strong> {fullDate}</p>
                    <p><strong>Waktu:</strong> {item.startTime} - {item.endTime}</p>
                    {item.notes && <p><strong>Catatan:</strong> {item.notes}</p>}
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--border-light)]">
                    <div className="flex gap-2">
                         <button onClick={handleDelete} className="px-3 py-2 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 rounded-lg flex items-center gap-2 font-semibold hover:bg-red-200 dark:hover:bg-red-900 transition-colors">
                            <TrashIcon className="size-5"/> Hapus
                        </button>
                         <button onClick={handleEdit} className="px-3 py-2 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400 rounded-lg flex items-center gap-2 font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-900 transition-colors">
                            <PencilIcon className="size-5"/> Edit
                        </button>
                    </div>
                    <button onClick={onClose} className="px-5 py-2.5 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule, addSchedule, updateSchedule, deleteSchedule, setActiveFeature, initialItemId }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<ScheduleItem | null>(null);

    useEffect(() => {
        if (initialItemId && schedule.length > 0) {
            const item = schedule.find(s => s.id === initialItemId);
            if (item) {
                const itemDate = new Date(item.date + 'T00:00:00');
                setSelectedDate(itemDate);
                setCurrentMonthDate(itemDate);
                setSelectedItem(item);
                setIsDetailModalOpen(true);
            }
        }
    }, [initialItemId, schedule]);

    const handleSaveSchedule = async (itemData: Omit<ScheduleItem, 'id' | 'user_id'>, repeatOption: string, repeatUntil: string, id?: string) => {
        if (id) {
            await updateSchedule(id, itemData);
        } else {
            await addSchedule(itemData, repeatOption, repeatUntil);
        }
    };

    const handleEditClick = (item: ScheduleItem) => {
        setIsDetailModalOpen(false);
        setSelectedItem(null);
        setItemToEdit(item);
        setIsAddEditModalOpen(true);
    };
    
    const handleAddClick = () => {
        setItemToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const openDetailModal = (item: ScheduleItem) => {
        setSelectedItem(item);
        setIsDetailModalOpen(true);
    };

    const selectedDaySchedule = useMemo(() => {
        return schedule
            .filter(item => {
                const itemDate = new Date(item.date + 'T00:00:00');
                return isSameDay(itemDate, selectedDate);
            })
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [schedule, selectedDate]);
    
    const handleMonthChange = (direction: 'prev' | 'next') => {
        setCurrentMonthDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1); // Avoids issues with different day counts
            newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
            return newDate;
        });
    }
    const handleGoToday = () => {
        const today = new Date();
        setSelectedDate(today);
        setCurrentMonthDate(today);
    }

    const calendarDays = useMemo(() => generateCalendarDays(currentMonthDate), [currentMonthDate]);
    const eventDates = useMemo(() => new Set(schedule.map(item => item.date)), [schedule]);

    return (
        <div className="bg-[var(--background-light)] flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-[var(--background-white)]/80 backdrop-blur-sm shadow-sm">
                 <div className="relative flex items-center justify-center p-4 border-b border-[var(--border-light)]">
                    <div className="absolute left-2 md:hidden">
                        <button onClick={() => setActiveFeature('home')} className="p-2">
                             <ArrowLeftIcon className="size-6 text-[var(--text-primary)]" />
                        </button>
                    </div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Jadwal Saya</h1>
                    <div className="absolute right-2">
                        <button onClick={handleGoToday} className="p-2 text-sm font-semibold text-[var(--primary-color)] hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg">
                            Hari Ini
                        </button>
                    </div>
                </div>
                
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <button onClick={() => handleMonthChange('prev')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                             <ChevronLeftIcon className="size-6 text-[var(--text-secondary)]"/>
                        </button>
                        <h2 className="text-lg font-bold text-center text-[var(--text-primary)]">
                            {currentMonthDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={() => handleMonthChange('next')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                           <ChevronRightIcon className="size-6 text-[var(--text-secondary)]"/>
                        </button>
                    </div>
                     <div className="grid grid-cols-7 text-center text-xs text-[var(--text-secondary)] font-bold mb-2">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            const dayHasEvent = eventDates.has(day.toISOString().split('T')[0]);
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = day.getMonth() === currentMonthDate.getMonth();
                            const isTodaysDate = isToday(day);

                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedDate(day);
                                        if (!isCurrentMonth) {
                                            setCurrentMonthDate(day);
                                        }
                                    }}
                                    className={`relative flex h-11 w-full items-center justify-center rounded-full text-sm transition-all duration-200
                                        ${!isCurrentMonth ? 'text-[var(--text-secondary)] opacity-30' : 'text-[var(--text-primary)]'}
                                        ${isSelected ? 'bg-[var(--primary-color)] !text-white font-bold' : ''}
                                        ${!isSelected && isCurrentMonth ? 'hover:bg-blue-100 dark:hover:bg-blue-900/50' : ''}
                                    `}
                                >
                                    <span className={`relative flex items-center justify-center size-9 rounded-full ${isTodaysDate && !isSelected ? 'border-2 border-[var(--primary-color)]' : ''}`}>
                                        {day.getDate()}
                                    </span>

                                    {dayHasEvent && isCurrentMonth && (
                                        <div className={`absolute bottom-1.5 size-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[var(--primary-color)]'}`}></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pt-4 px-4 pb-40">
                 <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">{selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                {selectedDaySchedule.length > 0 ? (
                    <div className="relative">
                        {selectedDaySchedule.map((item) => (
                           <TimelineItem key={item.id} item={item} onClick={() => openDetailModal(item)} />
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                        Icon={CalendarDaysIcon}
                        title="Jadwal Kosong"
                        description={`Tidak ada jadwal untuk hari ini.`}
                    />
                )}
            </main>
            
            <div className="fixed bottom-24 right-4 z-40">
                <button 
                    onClick={handleAddClick}
                    className="flex items-center justify-center rounded-full h-16 w-16 bg-[var(--primary-color)] text-white shadow-lg hover:bg-[var(--primary-color-dark)] transition-transform duration-200 hover:scale-105 active:scale-100"
                    aria-label="Tambah kegiatan baru">
                    <PlusIcon className="size-8" />
                </button>
            </div>
            
            <AddEditScheduleModal isOpen={isAddEditModalOpen} onClose={() => setIsAddEditModalOpen(false)} onSave={handleSaveSchedule} itemToEdit={itemToEdit} initialDate={selectedDate}/>
            <DetailModal item={selectedItem} isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} onDelete={deleteSchedule} onEdit={handleEditClick} />
        </div>
    );
