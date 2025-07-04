import React, { useMemo } from 'react';
import type { Feature } from '../../App';
import { ScheduleItem, TaskItem, TaskCategory } from '../../types';
import { 
    Bars3Icon, 
    ChevronRightIcon,
    CalendarDaysIcon,
    PencilSquareIcon,
    LightBulbIcon,
    BookOpenIcon,
    UsersSolidIcon,
    FileIcon,
    FlaskIcon,
    SparklesIcon,
    UserCircleOutlineIcon,
    ClipboardDocumentListIcon,
    ExclamationCircleIcon,
    CheckBadgeSolidIcon,
    ChartBarOutlineIcon
} from '../../components/icons/Icons';
import { AIInsightCard } from './AIInsightCard';

interface HomeViewProps {
    setActiveFeature: (feature: Feature) => void;
    toggleSidebar: () => void;
    schedule: ScheduleItem[];
    tasks: TaskItem[];
    userName: string;
    profilePicUrl: string | null;
    onScheduleItemClick: (itemId: string) => void;
}

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
};

const GreetingHeader: React.FC<{ userName: string; profilePicUrl: string | null; onProfileClick: () => void; onMenuClick: () => void; }> = ({ userName, profilePicUrl, onProfileClick, onMenuClick }) => (
    <div className="flex items-center justify-between p-4">
        <button onClick={onMenuClick} className="p-2 -ml-2 md:hidden">
            <Bars3Icon className="size-7 text-[var(--text-primary)]" />
        </button>
        <div className="text-center md:text-left">
            <h1 className="text-lg font-bold text-[var(--text-primary)]">{getGreeting()},</h1>
            <p className="text-md text-[var(--text-secondary)] -mt-1">{userName}</p>
        </div>
        <button onClick={onProfileClick} className="size-11 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600 transition overflow-hidden">
            {profilePicUrl ? (
                <img src={profilePicUrl} alt="Foto Profil" className="w-full h-full object-cover" />
            ) : (
                <UserCircleOutlineIcon className="size-8 text-[var(--text-secondary)]"/>
            )}
        </button>
    </div>
);

const DailySummaryCard: React.FC<{ scheduleCount: number; urgentTaskCount: number; }> = ({ scheduleCount, urgentTaskCount }) => (
    <div className="p-4 mx-4 bg-[var(--background-white)] rounded-2xl shadow-sm border border-[var(--border-light)] flex justify-around text-center">
        <div>
            <p className="text-2xl font-bold text-[var(--primary-color)]">{scheduleCount}</p>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Jadwal Hari Ini</p>
        </div>
        <div className="border-l border-[var(--border-light)]"></div>
        <div>
            <p className="text-2xl font-bold text-red-500">{urgentTaskCount}</p>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Tugas Mendesak</p>
        </div>
    </div>
);


const SectionHeader: React.FC<{ title: string; onSeeAll?: () => void }> = ({ title, onSeeAll }) => (
    <div className="flex justify-between items-center px-4 mt-6 mb-3">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
        {onSeeAll && (
            <button onClick={onSeeAll} className="text-sm font-semibold text-[var(--primary-color)] hover:underline">
                Lihat Semua
            </button>
        )}
    </div>
);

const scheduleTypeStyles: { [key in ScheduleItem['type']]: { icon: React.FC<any>; bgColor: string; iconColor: string; } } = {
    mengajar: { icon: BookOpenIcon, bgColor: 'bg-blue-100 dark:bg-blue-900/50', iconColor: 'text-blue-500 dark:text-blue-400' },
    rapat: { icon: UsersSolidIcon, bgColor: 'bg-purple-100 dark:bg-purple-900/50', iconColor: 'text-purple-500 dark:text-purple-400' },
    administrasi: { icon: FileIcon, bgColor: 'bg-orange-100 dark:bg-orange-900/50', iconColor: 'text-orange-500 dark:text-orange-400' },
    lainnya: { icon: FlaskIcon, bgColor: 'bg-teal-100 dark:bg-teal-900/50', iconColor: 'text-teal-500 dark:text-teal-400' },
};

const ScheduleCard: React.FC<{ item: ScheduleItem; onClick: () => void }> = ({ item, onClick }) => {
    const { icon: Icon, bgColor, iconColor } = scheduleTypeStyles[item.type] || {};
    return (
        <button onClick={onClick} className="w-full text-left flex items-center gap-4 bg-[var(--background-white)] p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className={`flex items-center justify-center rounded-lg shrink-0 size-11 ${bgColor}`}>
                <Icon className={`size-6 ${iconColor}`} />
            </div>
            <div className="flex-1">
                <p className="text-[var(--text-primary)] font-semibold">{item.title}</p>
                <p className="text-[var(--text-secondary)] text-sm">{item.startTime} - {item.endTime}</p>
            </div>
            <ChevronRightIcon className="size-5 text-gray-400" />
        </button>
    );
};

const taskCategoryStyles: { [key in TaskCategory]: { icon: React.FC<any> } } = {
    'Koreksi': { icon: PencilSquareIcon },
    'Persiapan': { icon: LightBulbIcon },
    'Administrasi': { icon: ClipboardDocumentListIcon },
    'Lainnya': { icon: ExclamationCircleIcon },
};

const formatTaskDueDate = (dueDate: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);
    
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return `Terlewat ${-diffDays} hari`;
    }
    if (diffDays === 0) {
        return 'Tenggat hari ini';
    }
    if (diffDays === 1) {
        return 'Tenggat besok';
    }
    return `Tenggat dalam ${diffDays} hari`;
};

const TaskCard: React.FC<{item: TaskItem, onClick: () => void}> = ({ item, onClick }) => {
    const Icon = taskCategoryStyles[item.category].icon;
    return (
        <button onClick={onClick} className="w-full text-left flex items-center gap-4 bg-[var(--background-white)] p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className={`flex items-center justify-center rounded-lg shrink-0 size-11 bg-red-100 dark:bg-red-900/50`}>
                <Icon className={`size-6 text-red-500 dark:text-red-400`} />
            </div>
            <div className="flex-1">
                <p className="text-[var(--text-primary)] font-semibold">{item.title}</p>
                <p className={`font-medium text-sm text-red-600 dark:text-red-400`}>{formatTaskDueDate(item.dueDate)}</p>
            </div>
            <ChevronRightIcon className="size-5 text-gray-400" />
        </button>
    );
};

const QuickAccessCard: React.FC<{
    title: string;
    icon: React.FC<any>;
    gradientClass: string;
    onClick: () => void;
}> = ({ title, icon: Icon, gradientClass, onClick }) => (
    <button 
        onClick={onClick} 
        className={`rounded-2xl p-5 text-white text-left flex flex-col h-32 shadow-lg hover:shadow-xl active:scale-[0.97] hover:-translate-y-1 transition-all duration-200 ease-out ${gradientClass}`}
    >
        {/* Icon pushed to the top */}
        <Icon className="size-8 text-white mb-auto" />
        
        {/* Text at the bottom */}
        <span className="font-bold text-lg">{title}</span>
    </button>
);

export const HomeView: React.FC<HomeViewProps> = ({ setActiveFeature, toggleSidebar, schedule, tasks, userName, profilePicUrl, onScheduleItemClick }) => {
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    const todaySchedule = useMemo(() => {
        return schedule
            .filter(item => item.date === todayStr)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
    }, [schedule, todayStr]);

    const urgentTasks = useMemo(() => {
        return tasks
            .filter(task => task.status !== 'Selesai')
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    }, [tasks]);

    return (
        <div className="bg-[var(--background-light)] min-h-full">
            {/* Header */}
            <header className="bg-[var(--background-light)] sticky top-0 z-10">
                <GreetingHeader 
                    userName={userName} 
                    profilePicUrl={profilePicUrl} 
                    onProfileClick={() => setActiveFeature('profile')} 
                    onMenuClick={toggleSidebar}
                />
            </header>
            
            <main className="pb-40">
                <DailySummaryCard scheduleCount={todaySchedule.length} urgentTaskCount={urgentTasks.length} />

                <AIInsightCard schedule={schedule} tasks={tasks} />

                {/* Quick Access */}
                 <div className="p-4">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-4 mb-3">Akses Cepat</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <QuickAccessCard title="Jadwal" icon={CalendarDaysIcon} gradientClass="bg-gradient-brand" onClick={() => setActiveFeature('schedule')} />
                        <QuickAccessCard title="Tugas" icon={CheckBadgeSolidIcon} gradientClass="bg-gradient-accent-2" onClick={() => setActiveFeature('todo')} />
                        <QuickAccessCard title="Evaluasi" icon={PencilSquareIcon} gradientClass="bg-gradient-accent-1" onClick={() => setActiveFeature('evaluation')} />
                        <QuickAccessCard title="Rapor" icon={ChartBarOutlineIcon} gradientClass="bg-gradient-accent-4" onClick={() => setActiveFeature('reports')} />
                        <div className="col-span-2">
                           <QuickAccessCard title="Asisten AI" icon={SparklesIcon} gradientClass="bg-gradient-accent-3" onClick={() => setActiveFeature('ai-assistant')} />
                        </div>
                    </div>
                </div>

                {/* Jadwal Hari Ini */}
                <SectionHeader title="Jadwal Hari Ini" onSeeAll={() => setActiveFeature('schedule')} />
                {todaySchedule.length > 0 ? (
                    <div className="px-4 space-y-2.5">
                        {todaySchedule.slice(0, 3).map(item => <ScheduleCard key={item.id} item={item} onClick={() => onScheduleItemClick(item.id)} />)}
                    </div>
                ) : (
                    <div className="text-center py-6 mx-4 bg-[var(--background-white)] rounded-xl shadow-sm">
                        <p className="text-[var(--text-secondary)]">Tidak ada jadwal untuk hari ini. ✨</p>
                    </div>
                )}

                {/* Tugas Mendesak */}
                <SectionHeader title="Tugas Mendesak" onSeeAll={() => setActiveFeature('todo')} />
                {urgentTasks.length > 0 ? (
                    <div className="px-4 space-y-2.5">
                        {urgentTasks.slice(0, 2).map(item => <TaskCard key={item.id} item={item} onClick={() => setActiveFeature('todo')} />)}
                    </div>
                ) : (
                     <div className="text-center py-6 mx-4 bg-[var(--background-white)] rounded-xl shadow-sm">
                        <p className="text-[var(--text-secondary)]">Semua tugas selesai! Kerja bagus. 👍</p>
                    </div>
                )}
            </main>
        </div>
    );
};
