
import React, { useState, useEffect } from 'react';
import { Classroom, Student } from '../../types';
import { Modal } from '../../components/Modal';
import { TrashIcon, UserPlusIcon } from '../../components/icons/Icons';

// Add/Edit Class Modal
interface AddEditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: { id?: string; name: string }) => Promise<void>;
  classroom?: Classroom;
}

export const AddEditClassModal: React.FC<AddEditClassModalProps> = ({ isOpen, onClose, onSave, classroom }) => {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && classroom) {
      setName(classroom.name);
    } else {
      setName('');
    }
  }, [isOpen, classroom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isSaving) {
      setIsSaving(true);
      await onSave({ id: classroom?.id, name });
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={classroom ? 'Edit Nama Kelas' : 'Tambah Kelas Baru'}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="className" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Nama Kelas</label>
        <input
          id="className"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Kelas 5A Ceria"
          className="w-full p-3 bg-[var(--background-light)] border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] text-[var(--text-primary)]"
          required
        />
        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Batal</button>
          <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-lg font-semibold disabled:opacity-50 transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Manage Students Modal
interface ManageStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddStudent: (classroomId: string, name: string) => Promise<void>;
    onDeleteStudent: (classroomId: string, studentId: string) => Promise<void>;
    classroom?: Classroom;
}

export const ManageStudentsModal: React.FC<ManageStudentsModalProps> = ({ isOpen, onClose, onAddStudent, onDeleteStudent, classroom }) => {
    const [newStudentName, setNewStudentName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newStudentName.trim() && classroom && !isAdding) {
            setIsAdding(true);
            await onAddStudent(classroom.id, newStudentName.trim());
            setNewStudentName('');
            setIsAdding(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Kelola Siswa: ${classroom?.name || ''}`}>
            <div className="space-y-4">
                <form onSubmit={handleAddStudent} className="flex gap-2">
                    <input
                      type="text"
                      value={newStudentName}
                      onChange={e => setNewStudentName(e.target.value)}
                      placeholder="Nama siswa baru"
                      className="flex-grow p-3 bg-[var(--background-light)] text-[var(--text-primary)] border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]"
                    />
                    <button type="submit" disabled={isAdding} className="flex-shrink-0 p-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color-dark)] disabled:opacity-50 transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">
                        <UserPlusIcon className="size-6" />
                    </button>
                </form>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {classroom && classroom.students.length > 0 ? classroom.students.map(student => (
                        <div key={student.id} className="flex items-center justify-between bg-[var(--background-light)] p-3 rounded-lg">
                            <p className="text-[var(--text-primary)]">{student.name}</p>
                            <button onClick={() => onDeleteStudent(classroom.id, student.id)} className="p-1 text-red-400 dark:text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                                <TrashIcon className="size-5" />
                            </button>
                        </div>
                    )) : (
                        <p className="text-center text-[var(--text-secondary)] py-4">Belum ada siswa di kelas ini.</p>
                    )}
                </div>
            </div>
             <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Selesai</button>
            </div>
        </Modal>
    );
};

// Confirm Delete Modal
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (classroomId: string) => Promise<void>;
  classroomName: string;
  classroomId: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, classroomName, classroomId }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm(classroomId);
    setIsDeleting(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Hapus">
      <p className="text-[var(--text-secondary)]">
        Anda yakin ingin menghapus kelas <strong>{classroomName}</strong>? Semua siswa dan laporan evaluasi terkait akan ikut terhapus. Tindakan ini tidak dapat diurungkan.
      </p>
      <div className="flex justify-end gap-3 pt-6">
        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Batal</button>
        <button onClick={handleConfirm} disabled={isDeleting} className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
        </button>
      </div>
    </Modal>
  );
};