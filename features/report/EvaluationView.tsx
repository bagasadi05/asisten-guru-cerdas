import React, { useState, useEffect } from 'react';
import { Classroom, Evaluation, Student } from '../../types';
import type { Feature } from '../../App';
import { PlusIcon, EllipsisVerticalIcon, UserPlusIcon, PencilIcon, TrashIcon, AcademicCapIcon, PencilSquareIcon } from '../../components/icons/Icons';
import { AddEditClassModal, ManageStudentsModal, ConfirmDeleteModal } from './EvaluationModals';
import { EvaluationFlow } from './EvaluationFlow';
import { EmptyState } from '../../components/EmptyState';

interface EvaluationViewProps {
    setActiveFeature: (feature: Feature) => void;
    classrooms: Classroom[];
    evaluationOptions: { sikap: string[], akademik: string[], karakter: string[] };
    addEvaluation: (evaluation: Omit<Evaluation, 'id' | 'user_id'>) => Promise<void>;
    addClassroom: (name: string) => Promise<void>;
    updateClassroom: (id: string, name: string) => Promise<void>;
    deleteClassroom: (id: string) => Promise<void>;
    addStudent: (classroomId: string, name: string) => Promise<void>;
    deleteStudent: (classroomId: string, studentId: string) => Promise<void>;
}

const colorClasses = [
  'from-blue-500 to-sky-400',
  'from-teal-500 to-green-400',
  'from-purple-500 to-violet-400',
  'from-orange-500 to-amber-400',
  'from-pink-500 to-rose-400',
  'from-indigo-500 to-cyan-400',
];

const ClassCard: React.FC<{
    classroom: Classroom;
    color: string;
    onStartEvaluation: () => void;
    onManageStudents: () => void;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ classroom, color, onStartEvaluation, onManageStudents, onEdit, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(prev => !prev);
    };

    const createActionHandler = (action: () => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        action();
        setIsMenuOpen(false); // Close menu after action
    };

    return (
        <div className={`relative rounded-2xl shadow-lg p-5 flex flex-col h-48 text-white bg-gradient-to-br ${color} overflow-hidden`}>
            {/* Menu Button and Dropdown */}
            <div className="absolute top-2 right-2 z-20">
                <button onClick={handleMenuToggle} className="p-2 rounded-full hover:bg-black/20 focus:bg-black/20 transition-colors">
                    <EllipsisVerticalIcon className="size-6 text-white"/>
                </button>
                {isMenuOpen && (
                    <div 
                        className="absolute top-12 right-0 w-48 bg-[var(--background-white)] rounded-md shadow-xl z-10 text-gray-800 dark:text-[var(--text-primary)] animate-fade-in" 
                        onClick={e => e.stopPropagation()}
                    >
                        <a onClick={createActionHandler(onEdit)} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-md cursor-pointer">
                            <PencilIcon className="size-5"/> Ubah Kelas
                        </a>
                        <a onClick={createActionHandler(onDelete)} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-b-md cursor-pointer">
                            <TrashIcon className="size-5"/> Hapus Kelas
                        </a>
                    </div>
                )}
            </div>

            {/* Card Content */}
            <div className="flex-1">
                <h3 className="text-2xl font-bold drop-shadow-md">{classroom.name}</h3>
                <p className="font-semibold opacity-90 drop-shadow-sm">{classroom.students.length} Siswa</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 text-sm font-semibold mt-auto z-10">
                <button 
                    onClick={onStartEvaluation} 
                    className="flex-1 py-2.5 bg-white/30 backdrop-blur-sm rounded-lg hover:bg-white/40 transition flex items-center justify-center gap-2"
                >
                    <PencilSquareIcon className="size-5"/> Evaluasi
                </button>
                <button 
                    onClick={onManageStudents}
                    className="flex-1 py-2.5 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-black/30 transition flex items-center justify-center gap-2"
                >
                    <UserPlusIcon className="size-5"/> Siswa
                </button>
            </div>
        </div>
    );
};


export const EvaluationView: React.FC<EvaluationViewProps> = (props) => {
    const { classrooms, evaluationOptions, addEvaluation, addClassroom, updateClassroom, deleteClassroom, addStudent, deleteStudent } = props;
    const [modal, setModal] = useState<{type: 'add' | 'edit' | 'delete' | 'students' | null, data?: Classroom}>({type: null});
    const [evaluatingClass, setEvaluatingClass] = useState<Classroom | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          if (activeMenu && !target.closest('.relative')) {
            setActiveMenu(null);
          }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeMenu]);

    const handleSaveClass = async (classData: {id?: string, name: string}) => {
        if (classData.id) {
            await updateClassroom(classData.id, classData.name);
        } else {
            await addClassroom(classData.name);
        }
        setModal({type: null});
    };

    const handleDeleteConfirm = async (classId: string) => {
        await deleteClassroom(classId);
        setModal({type: null});
    };
    
    const handleSaveEvaluation = async (newEvaluation: Omit<Evaluation, 'id'|'user_id'>) => {
        await addEvaluation(newEvaluation);
        setEvaluatingClass(null);
    };

    if (evaluatingClass) {
        return (
            <EvaluationFlow
                classroom={evaluatingClass}
                evaluationOptions={evaluationOptions}
                onSave={handleSaveEvaluation}
                onCancel={() => setEvaluatingClass(null)}
            />
        );
    }

    return (
        <div className="bg-[var(--background-light)] min-h-full pb-28">
            <div className="p-6 md:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Kelas Saya</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Pilih kelas untuk memulai evaluasi atau mengelola siswa.</p>
                </header>

                {classrooms.length > 0 ? (
                    <div className="grid grid-cols-1 @md:grid-cols-2 gap-5">
                        {classrooms.map((cls, index) => (
                            <ClassCard 
                                key={cls.id} 
                                classroom={cls}
                                color={colorClasses[index % colorClasses.length]}
                                onStartEvaluation={() => setEvaluatingClass(cls)}
                                onManageStudents={() => setModal({ type: 'students', data: cls })}
                                onEdit={() => setModal({ type: 'edit', data: cls })}
                                onDelete={() => setModal({ type: 'delete', data: cls })}
                            />
                        ))}
                    </div>
                ) : (
                     <EmptyState
                        Icon={AcademicCapIcon}
                        title="Belum Ada Kelas"
                        description="Anda belum membuat kelas. Buat kelas pertama Anda untuk mulai mengelola siswa dan evaluasi."
                        action={
                            <button 
                                onClick={() => setModal({type: 'add'})} 
                                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--primary-color-dark)] transition-colors"
                            >
                                <PlusIcon className="size-5"/>
                                Buat Kelas Baru
                            </button>
                        }
                    />
                )}
            </div>

            <button 
              onClick={() => setModal({type: 'add'})}
              className="fixed bottom-24 md:bottom-8 right-6 w-16 h-16 bg-[var(--primary-color)] text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-[var(--primary-color-dark)] transition-all duration-300 transform hover:scale-110 active:scale-100 z-40"
              aria-label="Tambah Kelas Baru"
            >
                <PlusIcon className="size-8" />
            </button>

            <AddEditClassModal
                isOpen={modal.type === 'add' || modal.type === 'edit'}
                onClose={() => setModal({ type: null })}
                onSave={handleSaveClass}
                classroom={modal.type === 'edit' ? modal.data : undefined}
            />
            <ManageStudentsModal
                isOpen={modal.type === 'students'}
                onClose={() => setModal({ type: null })}
                onAddStudent={addStudent}
                onDeleteStudent={deleteStudent}
                classroom={modal.data}
            />
            <ConfirmDeleteModal
                isOpen={modal.type === 'delete'}
                onClose={() => setModal({ type: null })}
                onConfirm={handleDeleteConfirm}
                classroomName={modal.data?.name || ''}
                classroomId={modal.data?.id || ''}
            />
        </div>
    );
};
