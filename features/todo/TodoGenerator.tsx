import React, { useState, useMemo, FC, useEffect } from 'react';
import { 
    ArrowLeftIcon, 
    PlusIcon, 
    ChevronDownIcon, 
    TrashIcon,
    CheckBadgeOutlineIcon,
    ArrowPathIcon,
    CheckBadgeSolidIcon,
    PencilIcon,
    ClipboardDocumentListIcon,
    LightBulbIcon,
    ExclamationCircleIcon,
    MagnifyingGlassIcon
} from '../../components/icons/Icons';
import type { Feature } from '../../App';
import { TaskItem, TaskStatus, TaskCategory } from '../../types';
import { Modal } from '../../components/Modal';
import { Spinner } from '../../components/Spinner';

interface TodoGeneratorProps {
    setActiveFeature: (feature: Feature) => void;
    tasks: TaskItem[];
    addTask: (task: Omit<TaskItem, 'id' | 'user_id'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<TaskItem>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
}

const formatDueDate = (dueDate: Date): string => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const taskDate = new Date(dueDate); // Create a new Date object to avoid mutating the original
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) {
        return "Tenggat: Hari ini";
    }
    if (taskDate.getTime() === tomorrow.getTime()) {
        return "Tenggat: Besok";
    }
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 7) {
        return `Tenggat: Dalam ${diffDays} hari`;
    }
    return `Tenggat: ${taskDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;
};

const categoryStyles: { [key in TaskCategory]: { icon: FC<any>, color: string, name: string } } = {
    'Koreksi': { icon: PencilIcon, color: 'border-purple-500', name: 'Koreksi' },
    'Persiapan': { icon: LightBulbIcon, color: 'border-blue-500', name: 'Persiapan' },
    'Administrasi': { icon: ClipboardDocumentListIcon, color: 'border-orange-500', name: 'Administrasi' },
    'Lainnya': { icon: ExclamationCircleIcon, color: 'border-teal-500', name: 'Lainnya' },
};

const statusConfig: { [key in TaskStatus]: { title: string; color: string; icon: FC<any>; } } = {
    'Belum': { title: 'Tugas Mendesak', color: 'red', icon: CheckBadgeOutlineIcon },
    'Dikerjakan': { title: 'Sedang Dikerjakan', color: 'yellow', icon: ArrowPathIcon },
    'Selesai': { title: 'Selesai', color: 'green', icon: CheckBadgeSolidIcon },
};

const ProgressSummary: FC<{ tasks: TaskItem[] }> = ({ tasks }) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Selesai').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <div className="px-4 pt-4 pb-2">
            <div className="bg-[var(--background-white)] p-4 rounded-xl shadow-sm border border-[var(--border-light)]">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-[var(--text-primary)]">Progres Tugas</h3>
                    <p className="font-semibold text-sm text-[var(--primary-color)]">{completedTasks}/{totalTasks} Selesai</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-[var(--primary-color)] h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};

const TaskItemCard: FC<{ task: TaskItem; onStatusChange: (id: string, newStatus: TaskStatus) => void; onDelete: (task: TaskItem) => void; onEdit: (task: TaskItem) => void; }> = ({ task, onStatusChange, onDelete, onEdit }) => {
    const categoryInfo = categoryStyles[task.category];
    const statusInfo = statusConfig[task.status];
    
    const statusCycle: Record<TaskStatus, TaskStatus> = {
        'Belum': 'Dikerjakan',
        'Dikerjakan': 'Selesai',
        'Selesai': 'Belum'
    };

    const handlePress = () => {
        onStatusChange(task.id, statusCycle[task.status]);
    };

    return (
        <div className={`group bg-[var(--background-white)] flex items-center gap-3 p-3 rounded-lg shadow-sm border-l-4 ${categoryInfo.color} transition-all duration-300`}>
            <div className="flex-1 flex items-center gap-3">
                <categoryInfo.icon className={`size-6 text-gray-500 dark:text-gray-400`} />
                <div>
                    <p className="font-semibold text-[var(--text-primary)]">{task.title}</p>
                    <p className={`text-sm font-medium ${task.status === 'Belum' && new Date() > task.dueDate ? 'text-red-500' : 'text-[var(--text-secondary)]'}`}>{formatDueDate(task.dueDate)}</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => onEdit(task)} className="p-2 text-gray-400 rounded-full hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/50 transition-colors">
                        <PencilIcon className="size-5"/>
                    </button>
                    <button onClick={() => onDelete(task)} className="p-2 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 transition-colors">
                        <TrashIcon className="size-5"/>
                    </button>
                </div>
                <button onClick={handlePress} className={`size-8 flex items-center justify-center rounded-full transition-colors text-${statusInfo.color}-600 bg-${statusInfo.color}-100 dark:bg-${statusInfo.color}-900/50 dark:text-${statusInfo.color}-400`}>
                    <statusInfo.icon className={`size-5 ${task.status === 'Dikerjakan' ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
    );
}

const AddEditTaskModal: FC<{
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (task: Omit<TaskItem, 'id' | 'status' | 'user_id'>, id?: string) => Promise<void>;
    taskToEdit: TaskItem | null;
}> = ({isOpen, onClose, onSave, taskToEdit}) => {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState<TaskCategory>('Persiapan');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsSaving(false);
            if (taskToEdit) {
                setTitle(taskToEdit.title);
                setDueDate(taskToEdit.dueDate.toISOString().split('T')[0]);
                setCategory(taskToEdit.category);
            } else {
                setTitle('');
                setDueDate(new Date().toISOString().split('T')[0]);
                setCategory('Persiapan');
            }
        }
    }, [isOpen, taskToEdit]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || isSaving) return;
        setIsSaving(true);
        try {
            await onSave({ title, dueDate: new Date(dueDate + 'T23:59:59'), category }, taskToEdit?.id);
            onClose();
        } catch (error) {
            console.error("Failed to save task", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? "Edit Tugas" : "Tambah Tugas Baru"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nama Tugas</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Koreksi ulangan harian" className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tenggat</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Kategori</label>
                        <select value={category} onChange={e => setCategory(e.target.value as TaskCategory)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]">
                            {Object.keys(categoryStyles).map(cat => <option key={cat} value={cat}>{(categoryStyles as any)[cat].name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Batal</button>
                    <button type="submit" disabled={isSaving} className="flex items-center justify-center px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-lg font-semibold disabled:opacity-70 transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">
                        {isSaving ? <Spinner size="sm" color="border-white" /> : 'Simpan Tugas'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}


export const TodoGenerator: React.FC<TodoGeneratorProps> = ({ setActiveFeature, tasks, addTask, updateTask, deleteTask }) => {
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
    const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
    const [collapsedSections, setCollapsedSections] = useState<Record<TaskStatus, boolean>>({ 'Selesai': true, 'Dikerjakan': false, 'Belum': false });
    const [searchTerm, setSearchTerm] = useState('');
    const [isGlobalLoading, setIsGlobalLoading] = useState(false); // State for global loading

    const filteredTasks = useMemo(() => {
        return tasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tasks, searchTerm]);

    const groupedTasks = useMemo(() => {
        const initialGroups: Record<TaskStatus, TaskItem[]> = { 'Belum': [], 'Dikerjakan': [], 'Selesai': [] };
        return [...filteredTasks]
            .sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime())
            .reduce((acc, task) => {
                acc[task.status].push(task);
                return acc;
            }, initialGroups);
    }, [filteredTasks]);

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        setIsGlobalLoading(true);
        try {
            await updateTask(taskId, { status: newStatus });
        } catch (error) {
            console.error("Error updating task status:", error);
        } finally {
            setIsGlobalLoading(false);
        }
    };

    const handleSaveTask = async (taskData: Omit<TaskItem, 'id' | 'status' | 'user_id'>, id?: string) => {
        setIsGlobalLoading(true);
        try {
            if (id) {
                await updateTask(id, taskData);
            } else {
                await addTask({ ...taskData, status: 'Belum' });
            }
        } catch (error) {
            console.error("Error saving task:", error);
        } finally {
            setIsGlobalLoading(false);
        }
    };
    
    const handleDelete = async () => {
        if (taskToDelete) {
            setIsGlobalLoading(true);
            try {
                await deleteTask(taskToDelete.id);
                setTaskToDelete(null);
            } catch (error) {
                console.error("Error deleting task:", error);
            } finally {
                setIsGlobalLoading(false);
            }
        }
    };

    const openEditModal = (task: TaskItem) => {
        setTaskToEdit(task);
        setIsAddEditModalOpen(true);
    };

    const openAddModal = () => {
        setTaskToEdit(null);
        setIsAddEditModalOpen(true);
    };
    
    const toggleSection = (status: TaskStatus) => {
        setCollapsedSections(prev => ({...prev, [status]: !prev[status]}));
    };
    
    return (
        <div className="bg-[var(--background-light)] min-h-full relative"> {/* Added relative for overlay positioning */}
            {isGlobalLoading && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
                    <Spinner size="lg" color="text-white" />
                </div>
            )}
            <header className="bg-[var(--background-white)]/80 backdrop-blur-sm sticky top-0 z-20 flex items-center p-4 border-b border-[var(--border-light)]">
                <button onClick={() => setActiveFeature('home')} className="p-2 -ml-2 md:hidden">
                    <ArrowLeftIcon className="size-6 text-[var(--text-primary)]" />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)] text-center flex-1">Daftar Tugas</h1>
                <div className="w-6 h-6 md:hidden"></div>
            </header>
            
            <div className="p-4 bg-[var(--background-white)]/80 backdrop-blur-sm sticky top-[73px] z-10 border-b border-[var(--border-light)]">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari tugas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-2.5 pl-10 pr-4 bg-[var(--background-light)] border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] text-[var(--text-primary)]"
                    />
                </div>
            </div>

            <ProgressSummary tasks={filteredTasks} />

            <main className="px-4 pb-40 space-y-4">
                {(Object.keys(groupedTasks) as TaskStatus[]).map(status => {
                    const sectionTasks = groupedTasks[status];
                    const config = statusConfig[status];
                    const isCollapsed = collapsedSections[status];
                    if (sectionTasks.length === 0 && status === 'Selesai') return null;
                    
                    return (
                        <div key={status}>
                             <button onClick={() => toggleSection(status)} className="w-full flex justify-between items-center p-2 rounded-lg">
                                <div className="flex items-center gap-2">
                                     <div className={`size-3 rounded-full bg-${config.color}-500`}></div>
                                     <h3 className="font-bold text-lg text-[var(--text-primary)]">{config.title}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className={`px-2.5 py-0.5 text-sm font-bold text-${config.color}-600 bg-${config.color}-100 dark:text-${config.color}-300 dark:bg-${config.color}-500/30 rounded-full`}>{sectionTasks.length}</span>
                                     <ChevronDownIcon className={`size-5 text-[var(--text-secondary)] transition-transform ${isCollapsed ? '' : 'rotate-180'}`}/>
                                </div>
                            </button>
                            {!isCollapsed && (
                                <div className="space-y-2 pt-2">
                                    {sectionTasks.length > 0 ? (
                                        sectionTasks.map(task => (
                                            <TaskItemCard key={task.id} task={task} onStatusChange={handleStatusChange} onDelete={setTaskToDelete} onEdit={openEditModal} />
                                        ))
                                    ) : (
                                        <div className="text-center text-[var(--text-secondary)] py-4 bg-[var(--background-white)] rounded-lg">Tidak ada tugas di bagian ini.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                 {tasks.length > 0 && filteredTasks.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-[var(--text-secondary)]">Tidak ada tugas yang cocok dengan pencarian Anda.</p>
                    </div>
                 )}
            </main>
            
            <button onClick={openAddModal} className="fixed bottom-24 right-4 z-40 w-16 h-16 bg-[var(--primary-color)] text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-[var(--primary-color-dark)] transition-all duration-300 transform hover:scale-110 active:scale-100">
                <PlusIcon className="size-8" />
            </button>
            
            <AddEditTaskModal isOpen={isAddEditModalOpen} onClose={() => setIsAddEditModalOpen(false)} onSave={handleSaveTask} taskToEdit={taskToEdit} />
            
            <Modal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} title="Konfirmasi Hapus">
                <p className="text-[var(--text-secondary)]">Anda yakin ingin menghapus tugas "{taskToDelete?.title}"?</p>
                 <div className="flex justify-end gap-3 pt-6">
                    <button type="button" onClick={() => setTaskToDelete(null)} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Batal</button>
                    <button onClick={handleDelete} className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Ya, Hapus</button>
                </div>
            </Modal>
        </div>
    );
};
