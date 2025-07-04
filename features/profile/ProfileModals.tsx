
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';

// Edit Profile Modal
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
  currentName: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSave, currentName }) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profil">
      <form onSubmit={handleSubmit}>
        <label htmlFor="userName" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Nama Pengguna</label>
        <input
          id="userName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]"
          required
        />
        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 text-gray-800 rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Batal</button>
          <button type="submit" className="px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Simpan</button>
        </div>
      </form>
    </Modal>
  );
};

// Confirm Logout Modal
interface ConfirmLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Keluar">
      <p className="text-[var(--text-secondary)]">
        Anda yakin ingin keluar dari akun Anda?
      </p>
      <div className="flex justify-end gap-3 pt-6">
        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 text-gray-800 rounded-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Batal</button>
        <button onClick={onConfirm} className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-transform duration-150 ease-in-out hover:scale-[1.03] active:scale-[0.98]">Ya, Keluar</button>
      </div>
    </Modal>
  );
};