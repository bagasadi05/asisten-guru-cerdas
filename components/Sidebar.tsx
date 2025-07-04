import React from 'react';
import { 
    ArrowLeftStartOnRectangleIcon,
    DocumentArrowDownIcon,
    UserCircleOutlineIcon,
    QuestionMarkCircleIcon,
    EnvelopeIcon,
    ArrowUpTrayIcon,
} from './icons/Icons';
import type { Feature } from '../App';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (feature: Feature) => void;
    onExportSchedule: () => void;
    onExportTasks: () => void;
    onExportReports: () => void;
    onLogoutClick: () => void;
    hasSchedule: boolean;
    hasTasks: boolean;
    hasReports: boolean;
}

const NavItem: React.FC<{
    icon: React.FC<any>;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
}> = ({ icon: Icon, label, onClick, disabled = false }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 group ${
            disabled 
            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'text-[var(--text-primary)] hover:bg-blue-50 dark:hover:bg-gray-800'
        }`}
    >
        <Icon className={`size-6 mr-4 ${disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400 group-hover:text-[var(--primary-color)]'}`}/>
        <span className={`font-semibold ${disabled ? '' : 'group-hover:text-[var(--primary-color)]'}`}>{label}</span>
    </button>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="px-4 pt-4 pb-1 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
    isOpen, 
    onClose, 
    onNavigate,
    onExportSchedule,
    onExportTasks,
    onExportReports,
    onLogoutClick,
    hasSchedule,
    hasTasks,
    hasReports
}) => {
    const handleNavigate = (feature: Feature) => {
        onNavigate(feature);
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-80 bg-[var(--background-white)] shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="p-5 border-b border-[var(--border-light)]">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Menu Ekstra</h2>
                </div>
                <nav className="p-2 flex-1 overflow-y-auto">
                    {/* Akun & Pengaturan */}
                    <SectionHeader title="Akun & Pengaturan" />
                    <NavItem icon={UserCircleOutlineIcon} label="Profil & Pengaturan" onClick={() => handleNavigate('profile')} />

                    {/* Manajemen Data */}
                    <SectionHeader title="Manajemen Data" />
                    <NavItem icon={ArrowUpTrayIcon} label="Impor Data" disabled={true} />
                    <NavItem icon={DocumentArrowDownIcon} label="Ekspor Jadwal (PDF)" onClick={onExportSchedule} disabled={!hasSchedule} />
                    <NavItem icon={DocumentArrowDownIcon} label="Ekspor Tugas (PDF)" onClick={onExportTasks} disabled={!hasTasks} />
                    <NavItem icon={DocumentArrowDownIcon} label="Ekspor Semua Rapor (PDF)" onClick={onExportReports} disabled={!hasReports} />

                    {/* Bantuan & Informasi */}
                    <SectionHeader title="Bantuan & Informasi" />
                    <NavItem icon={QuestionMarkCircleIcon} label="Pusat Bantuan" onClick={() => handleNavigate('profile-help')} />
                    <NavItem icon={EnvelopeIcon} label="Hubungi Kami" onClick={() => handleNavigate('profile-contact')} />
                </nav>
                <div className="p-2 border-t border-[var(--border-light)]">
                     <NavItem icon={ArrowLeftStartOnRectangleIcon} label="Keluar" onClick={onLogoutClick} />
                </div>
            </div>
        </>
    );
};