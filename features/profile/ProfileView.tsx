import React, { useState, useRef } from 'react';
import type { Feature } from '../../App';
import { Profile } from '../../types';
import { 
    ArrowLeftIcon, 
    UserCircleOutlineIcon,
    ChevronRightIcon,
    BellAlertIcon,
    ShieldCheckIcon,
    MoonIcon,
    SunIcon,
    QuestionMarkCircleIcon,
    EnvelopeIcon,
    ArrowLeftStartOnRectangleIcon,
    PencilIcon,
    CameraIcon,
} from '../../components/icons/Icons';
import { EditProfileModal } from './ProfileModals';

interface ProfileViewProps {
    setActiveFeature: (feature: Feature) => void;
    profile: Profile;
    onUpdateProfile: (updates: { userName: string; profilePicUrl: string | null; }) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onLogoutClick: () => void;
}

const MenuItem: React.FC<{
    icon: React.FC<{ className?: string }>;
    label: string;
    onClick: () => void;
}> = ({ icon: Icon, label, onClick }) => (
    <button 
        onClick={onClick} 
        className="w-full text-left flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
        <div className="flex items-center gap-4">
            <Icon className="size-6 text-gray-500 dark:text-gray-400" />
            <span className="font-semibold text-[var(--text-primary)]">{label}</span>
        </div>
        <ChevronRightIcon className="size-5 text-gray-400" />
    </button>
);

const AppearanceToggle: React.FC<{
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}> = ({ theme, toggleTheme }) => (
     <div className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
            {theme === 'light' 
              ? <SunIcon className="size-6 text-gray-500 dark:text-gray-400" /> 
              : <MoonIcon className="size-6 text-gray-500 dark:text-gray-400" />
            }
            <span className="font-semibold text-[var(--text-primary)]">Tampilan</span>
        </div>
        <label htmlFor="dark-mode-toggle" className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="dark-mode-toggle" className="sr-only peer" checked={theme === 'dark'} onChange={toggleTheme} />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--primary-color)]"></div>
        </label>
    </div>
);


export const ProfileView: React.FC<ProfileViewProps> = ({ setActiveFeature, profile, onUpdateProfile, theme, toggleTheme, onLogoutClick }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user_name: userName, profile_pic_url: profilePicUrl } = profile;

    const handlePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newPicUrl = event.target?.result as string;
                onUpdateProfile({ userName, profilePicUrl: newPicUrl });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSaveName = (newName: string) => {
        onUpdateProfile({ userName: newName, profilePicUrl });
    }
    
    const appSettings = [
        { icon: BellAlertIcon, label: 'Notifikasi', onClick: () => setActiveFeature('profile-notifications') },
        { icon: ShieldCheckIcon, label: 'Keamanan Akun', onClick: () => setActiveFeature('profile-security') },
    ];

    const helpInfo = [
        { icon: QuestionMarkCircleIcon, label: 'Pusat Bantuan', onClick: () => setActiveFeature('profile-help') },
        { icon: EnvelopeIcon, label: 'Hubungi Kami', onClick: () => setActiveFeature('profile-contact') },
    ];

    return (
         <>
            <div className="bg-[var(--background-light)] min-h-full pb-28">
                <header className="bg-[var(--background-white)]/80 dark:bg-[var(--background-white)]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center p-4 border-b border-[var(--border-light)]">
                    <button onClick={() => setActiveFeature('home')} className="p-2 -ml-2 md:hidden">
                        <ArrowLeftIcon className="size-6 text-[var(--text-primary)]" />
                    </button>
                    <h1 className="text-lg font-bold text-[var(--text-primary)] text-center flex-1">Profil Saya</h1>
                    <div className="w-6 h-6 md:hidden"></div> {/* Spacer */}
                </header>

                <main className="p-4 md:p-6">
                    {/* Profile Card */}
                    <div className="bg-[var(--background-white)] rounded-2xl shadow-sm border border-[var(--border-light)] p-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <input type="file" ref={fileInputRef} onChange={handlePicUpload} accept="image/*" className="hidden" />
                            <div className="size-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                                {profilePicUrl ? (
                                    <img src={profilePicUrl} alt="Foto Profil" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircleOutlineIcon className="size-20 text-gray-400" />
                                )}
                            </div>
                            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 size-8 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 hover:bg-[var(--primary-color-dark)] transition-colors" aria-label="Ubah foto profil">
                               <CameraIcon className="size-5"/>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{userName}</h2>
                        </div>
                        <button onClick={() => setIsEditModalOpen(true)} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--primary-color)] hover:underline">
                            <PencilIcon className="size-4" />
                            Edit Profil
                        </button>
                    </div>

                    {/* App Settings */}
                    <div className="mt-6">
                        <h3 className="px-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Pengaturan Aplikasi</h3>
                        <div className="bg-[var(--background-white)] rounded-2xl shadow-sm border border-[var(--border-light)] overflow-hidden divide-y divide-[var(--border-light)]">
                            {appSettings.map((item) => (
                                <MenuItem key={item.label} icon={item.icon} label={item.label} onClick={item.onClick} />
                            ))}
                            <AppearanceToggle theme={theme} toggleTheme={toggleTheme} />
                        </div>
                    </div>

                    {/* Help & Info */}
                    <div className="mt-6">
                        <h3 className="px-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Bantuan & Informasi</h3>
                        <div className="bg-[var(--background-white)] rounded-2xl shadow-sm border border-[var(--border-light)] overflow-hidden divide-y divide-[var(--border-light)]">
                            {helpInfo.map((item) => (
                                <MenuItem key={item.label} icon={item.icon} label={item.label} onClick={item.onClick}/>
                            ))}
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="mt-8">
                         <button onClick={onLogoutClick} className="w-full flex items-center justify-center gap-3 p-3 text-red-600 font-bold bg-white dark:bg-[var(--background-white)] border border-red-200 dark:border-red-500/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm">
                            <ArrowLeftStartOnRectangleIcon className="size-6" />
                            Keluar
                         </button>
                    </div>
                </main>
            </div>
            
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveName}
                currentName={userName}
            />
        </>
    )
};
