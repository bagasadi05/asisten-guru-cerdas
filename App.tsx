
import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ScheduleView } from './features/schedule/ScheduleView';
import { TodoGenerator } from './features/todo/TodoGenerator';
import { EvaluationView } from './features/report/ReportGenerator';
import { TipsGenerator } from './features/tips/TipsGenerator';
import { HomeView } from './features/home/HomeView';
import { ProfileView } from './features/profile/ProfileView';
import { Sidebar } from './components/Sidebar';
import { 
  HomeSolidIcon, HomeOutlineIcon,
  ChatBubbleBottomCenterTextSolidIcon, ChatBubbleBottomCenterTextOutlineIcon,
  PencilSquareIcon, AcademicCapIcon,
  CalendarDaysIcon,
  CalendarIcon,
  CheckBadgeOutlineIcon,
  CheckBadgeSolidIcon,
  ChartBarOutlineIcon,
  ChartBarSolidIcon,
  PencilIcon,
} from './components/icons/Icons';
import { LoadingScreen } from './components/LoadingScreen';
import { Spinner } from './components/Spinner';
import { ScheduleItem, TaskItem, Classroom, Evaluation, Message, Student, Profile, Session } from './types';
import * as supabaseService from './services/supabaseService';
import { supabase } from './services/supabaseService';
import { NotificationSettingsView } from './features/profile/NotificationSettingsView';
import { SecuritySettingsView } from './features/profile/SecuritySettingsView';
import { HelpCenterView } from './features/profile/HelpCenterView';
import { ContactView } from './features/profile/ContactView';
import { ConfirmLogoutModal } from './features/profile/ProfileModals';
import { useNotifications } from './hooks/useNotifications';
import { AuthView } from './features/auth/AuthView';
import { ChangePasswordView } from './features/profile/ChangePasswordView';
import { TwoFactorAuthView } from './features/profile/TwoFactorAuthView';
import { ConnectedDevicesView } from './features/profile/ConnectedDevicesView';
import { useToast } from './components/Toast';
import { ReportListView } from './features/reports/ReportListView';
import { BottomNavBar } from './components/BottomNavBar';
import SchedulePDF from './features/schedule/SchedulePDF';
import TasksPDF from './features/todo/TasksPDF';
import ReportPDF from './features/reports/ReportPDF';

export type Feature = 
  'home' | 'schedule' | 'todo' | 'evaluation' | 'ai-assistant' | 
  'reports' | 'profile' | 'profile-notifications' | 'profile-security' | 
  'profile-help' | 'profile-contact' | 'profile-change-password' |
  'profile-2fa' | 'profile-devices';

const evaluationOptionsData = {
  sikap: ['Sangat Baik', 'Baik', 'Cukup', 'Perlu Bimbingan'],
  akademik: ['Melampaui Harapan', 'Sesuai Harapan', 'Perlu Peningkatan', 'Membutuhkan Bantuan'],
  karakter: ['Mandiri', 'Bertanggung Jawab', 'Jujur', 'Disiplin', 'Kerja Sama'],
};

const initialAiMessages: Message[] = [
    {
        id: '1',
        text: `Halo! Saya Asisten AI Anda. Anda bisa bertanya tentang jadwal, tugas, atau data siswa. Ada yang bisa saya bantu?`,
        sender: 'ai'
    },
];

const loadFromLocalStorage = <T,>(key: string, fallback: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return fallback;
    }
};

const DesktopSidebar: React.FC<{ activeFeature: Feature; onNavigate: (feature: Feature) => void; }> = ({ activeFeature, onNavigate }) => {
    const NavItem: React.FC<{ 
      iconOutline: React.FC<any>;
      iconSolid: React.FC<any>;
      label: string; 
      feature: Feature;
      isActive: boolean; 
      onClick: () => void; 
    }> = ({ iconOutline: IconOutline, iconSolid: IconSolid, label, isActive, onClick }) => (
        <a 
            href="#"
            onClick={(e) => { e.preventDefault(); onClick(); }}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive 
                ? 'bg-[var(--primary-color)] text-white' 
                : 'text-[var(--text-secondary)] hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-[var(--text-primary)]'
            }`}
        >
            {isActive ? <IconSolid className="size-6 mr-3" /> : <IconOutline className="size-6 mr-3" />}
            <span className="font-semibold">{label}</span>
        </a>
    );

    const mainNavItems = [
      { feature: 'home', label: 'Beranda', iconOutline: HomeOutlineIcon, iconSolid: HomeSolidIcon },
      { feature: 'schedule', label: 'Jadwal Lengkap', iconOutline: CalendarDaysIcon, iconSolid: CalendarIcon },
      { feature: 'todo', label: 'Daftar Tugas', iconOutline: CheckBadgeOutlineIcon, iconSolid: CheckBadgeSolidIcon },
      { feature: 'evaluation', label: 'Evaluasi', iconOutline: PencilSquareIcon, iconSolid: PencilIcon },
      { feature: 'reports', label: 'Rapor', iconOutline: ChartBarOutlineIcon, iconSolid: ChartBarSolidIcon },
      { feature: 'ai-assistant', label: 'Asisten AI', iconOutline: ChatBubbleBottomCenterTextOutlineIcon, iconSolid: ChatBubbleBottomCenterTextSolidIcon },
    ] as const;


    return (
        <aside className="hidden md:flex flex-col w-72 bg-[var(--background-white)] border-r border-[var(--border-light)]">
            <div className="flex items-center gap-3 px-6 h-20 border-b border-[var(--border-light)]">
                <AcademicCapIcon className="size-8 text-[var(--primary-color)]" />
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Asisten Guru</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                 {mainNavItems.map(item => (
                    <NavItem 
                        key={item.feature}
                        feature={item.feature}
                        label={item.label}
                        iconOutline={item.iconOutline}
                        iconSolid={item.iconSolid}
                        isActive={activeFeature === item.feature}
                        onClick={() => onNavigate(item.feature)}
                    />
                ))}
            </nav>
            <div className="p-4 border-t border-[var(--border-light)]">
                <p className="text-xs text-center text-gray-400">&copy; 2024 Asisten Guru Cerdas</p>
            </div>
        </aside>
    );
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For data loading after auth is confirmed
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // For the initial auth check
  const [activeFeature, setActiveFeature] = useState<Feature>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toast = useToast();

  // --- Centralized State ---
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluationOptions] = useState(evaluationOptionsData);
  
  // --- User, Theme, and Modal State ---
  const [profile, setProfile] = useState<Profile | null>(null);
  const [aiMessages, setAiMessages] = useState<Message[]>(() => loadFromLocalStorage('aiMessages', initialAiMessages));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadFromLocalStorage('theme', 'light'));
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [initialItemId, setInitialItemId] = useState<string | null>(null);

  // --- Auth & Data Loading ---
  useEffect(() => {
    const fetchDataForSession = async () => {
        setIsLoading(true);

        const attemptFetch = async (): Promise<boolean> => {
            try {
                const profileData = await supabaseService.getProfile();
                if (profileData) {
                    const [schedulesData, tasksData, classroomsData, evaluationsData] = await Promise.all([
                        supabaseService.getSchedules(),
                        supabaseService.getTasks(),
                        supabaseService.getClassrooms(),
                        supabaseService.getEvaluations(),
                    ]);
                    setProfile(profileData);
                    setSchedule(schedulesData);
                    setTasks(tasksData);
                    setClassrooms(classroomsData);
                    setEvaluations(evaluationsData);
                    return true;
                }
                return false;
            } catch (error) {
                console.error("Error during data fetch attempt:", error);
                return false;
            }
        };

        let success = false;
        let retryCount = 0;
        const MAX_RETRIES = 3;

        while (retryCount < MAX_RETRIES && !success) {
            success = await attemptFetch();
            if (!success) {
                retryCount++;
                if (retryCount < MAX_RETRIES) {
                    await new Promise(res => setTimeout(res, 1500));
                }
            }
        }

        if (!success) {
            toast.error("Gagal memuat data penting. Sesi Anda akan diakhiri.");
            supabase.auth.signOut();
        }

        setIsLoading(false);
    };

    // Check initial session state ONCE.
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setIsCheckingAuth(false);
        if (session) {
            fetchDataForSession();
        }
    });

    // Listen for future auth state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (_event === 'SIGNED_IN') {
            fetchDataForSession();
        } else if (_event === 'SIGNED_OUT') {
            setProfile(null);
            setSchedule([]);
            setTasks([]);
            setClassrooms([]);
            setEvaluations([]);
        }
    });

    return () => {
        subscription?.unsubscribe();
    };
  }, [toast]); // Dependency on toast is fine as it's stable.


  // --- Save non-core data to LocalStorage Effects ---
  useEffect(() => { localStorage.setItem('aiMessages', JSON.stringify(aiMessages)); }, [aiMessages]);
  useEffect(() => { localStorage.setItem('theme', JSON.stringify(theme)); }, [theme]);

  // --- Notification Hook ---
  useNotifications({ schedule, tasks });
  
  // --- CRUD Operations ---
  const addScheduleItem = async (item: Omit<ScheduleItem, 'id'|'user_id'>, repeatOption: string, repeatUntil: string) => {
    if (repeatOption === 'none' || !repeatUntil) {
        // Original logic for single item
        const newItem = await supabaseService.addSchedule(item);
        if (newItem) {
            setSchedule(prev => [...prev, newItem].sort((a,b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)));
            toast.success('Jadwal berhasil ditambahkan!');
        } else {
            toast.error('Gagal menambahkan jadwal.');
        }
        return;
    }

    // Logic for recurring items
    const newItemsToCreate: Omit<ScheduleItem, 'id'|'user_id'>[] = [];
    let currentDate = new Date(item.date + 'T00:00:00Z'); // Use Z to avoid timezone issues
    const endDate = new Date(repeatUntil + 'T00:00:00Z');

    if (currentDate > endDate) {
        toast.error('Tanggal akhir pengulangan harus setelah tanggal mulai.');
        return;
    }

    while (currentDate <= endDate) {
        newItemsToCreate.push({
            ...item,
            date: currentDate.toISOString().split('T')[0]
        });
        // Increment by one week
        currentDate.setDate(currentDate.getDate() + 7);
    }
    
    if(newItemsToCreate.length === 0) {
        toast.error('Tidak ada jadwal yang dibuat. Periksa kembali tanggal Anda.');
        return;
    }

    if(newItemsToCreate.length > 52) { // Safety break, 1 year
         toast.error('Terlalu banyak jadwal berulang (maksimal 52 minggu).');
         return;
    }

    const addedItems = await supabaseService.addMultipleSchedules(newItemsToCreate);
    if (addedItems && addedItems.length > 0) {
        setSchedule(prev => [...prev, ...addedItems].sort((a,b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)));
        toast.success(`${addedItems.length} jadwal berulang berhasil ditambahkan!`);
    } else {
        toast.error('Gagal menambahkan jadwal berulang.');
    }
  };

  const updateScheduleItem = async (id: string, updates: Omit<ScheduleItem, 'id'|'user_id'>) => {
    const updatedItem = await supabaseService.updateSchedule(id, updates);
    if (updatedItem) {
        setSchedule(prev => prev.map(s => s.id === id ? updatedItem : s).sort((a,b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)));
        toast.success('Jadwal berhasil diperbarui!');
    } else {
        toast.error('Gagal memperbarui jadwal.');
    }
  };
  const deleteScheduleItem = async (id: string) => {
    const result: any[] | null = await supabaseService.deleteSchedule(id);
    // A successful delete returns an array of the deleted items.
    // If RLS prevents deletion or the item doesn't exist, it returns an empty array.
    if (result && Array.isArray(result) && result.length > 0) {
        setSchedule(prev => prev.filter(item => item.id !== id));
        toast.success('Jadwal berhasil dihapus.');
    } else {
        toast.error('Gagal menghapus jadwal. Item mungkin sudah dihapus atau Anda tidak memiliki izin.');
    }
  };
  const addTaskItem = async (item: Omit<TaskItem, 'id'|'user_id'>) => {
    const newItem = await supabaseService.addTask(item);
    if (newItem) {
        setTasks(prev => [...prev, newItem]);
        toast.success('Tugas berhasil ditambahkan!');
    } else {
        toast.error('Gagal menambahkan tugas.');
    }
  };
  const updateTaskItem = async (id: string, updates: Partial<TaskItem>) => {
    const updatedItem = await supabaseService.updateTask(id, updates);
    if (updatedItem) {
        setTasks(prev => prev.map(t => t.id === id ? updatedItem : t));
        if (updates.status) {
             toast.info(`Status tugas diperbarui menjadi "${updates.status}".`);
        } else {
             toast.success('Tugas berhasil diperbarui!');
        }
    } else {
        toast.error('Gagal memperbarui tugas.');
    }
  };
  const deleteTaskItem = async (id: string) => {
    const result: any[] | null = await supabaseService.deleteTask(id);
    // A successful delete returns an array of the deleted items.
    // If RLS prevents deletion or the item doesn't exist, it returns an empty array.
    // So we check if the result is an array and if it's not empty.
    if (result && Array.isArray(result) && result.length > 0) {
        setTasks(prev => prev.filter(item => item.id !== id));
        toast.success('Tugas berhasil dihapus.');
    } else {
        toast.error('Gagal menghapus tugas. Item mungkin sudah dihapus atau Anda tidak memiliki izin.');
    }
  };
  const addClassroomItem = async (name: string) => {
    const newItem = await supabaseService.addClassroom(name);
    if(newItem) {
        setClassrooms(prev => [newItem, ...prev]);
        toast.success('Kelas berhasil ditambahkan!');
    } else {
        toast.error('Gagal menambahkan kelas.');
    }
  };
  const updateClassroomItem = async(id: string, name: string) => {
    const updatedItem = await supabaseService.updateClassroom(id, name);
    if(updatedItem) {
        setClassrooms(prev => prev.map(c => c.id === id ? {...c, name: updatedItem.name} : c));
        toast.success('Nama kelas berhasil diperbarui!');
    } else {
        toast.error('Gagal memperbarui nama kelas.');
    }
  };
  const deleteClassroomItem = async (id: string) => {
    const result: any[] | null = await supabaseService.deleteClassroom(id);
     if (result && Array.isArray(result) && result.length > 0) {
        setClassrooms(prev => prev.filter(c => c.id !== id));
        setEvaluations(prev => prev.filter(e => e.classId !== id));
        toast.success('Kelas berhasil dihapus.');
    } else {
        toast.error('Gagal menghapus kelas. Item mungkin sudah dihapus atau Anda tidak memiliki izin.');
    }
  };
  const addStudentToClass = async (classroomId: string, name: string) => {
    const newStudent = await supabaseService.addStudent(name, classroomId);
    if(newStudent) {
      setClassrooms(prev => prev.map(c => c.id === classroomId ? {...c, students: [...c.students, newStudent]} : c));
      toast.success(`Siswa "${name}" berhasil ditambahkan.`);
    } else {
      toast.error('Gagal menambahkan siswa.');
    }
  };
  const deleteStudentFromClass = async (classroomId: string, studentId: string) => {
    const result: any[] | null = await supabaseService.deleteStudent(studentId);
    if(result && Array.isArray(result) && result.length > 0) {
        setClassrooms(prev => prev.map(c => c.id === classroomId ? {...c, students: c.students.filter(s => s.id !== studentId)} : c));
        setEvaluations(prev => prev.filter(e => e.studentId !== studentId));
        toast.success('Siswa berhasil dihapus.');
    } else {
        toast.error('Gagal menghapus siswa. Item mungkin sudah dihapus atau Anda tidak memiliki izin.');
    }
  };
  const addEvaluationItem = async(item: Omit<Evaluation, 'id'|'user_id'>) => {
    const newItem = await supabaseService.addEvaluation(item);
    if(newItem) {
        setEvaluations(prev => [newItem, ...prev]);
        toast.success(`Rapor untuk ${newItem.studentName} berhasil disimpan.`);
    } else {
        toast.error('Gagal menyimpan rapor.');
    }
  };

  const handleUpdateProfile = async (updates: { userName: string; profilePicUrl: string | null; }) => {
    if (!profile) return;
    const { userName, profilePicUrl } = updates;
    const oldProfile = profile;
    setProfile({ ...profile, user_name: userName, profile_pic_url: profilePicUrl }); // Optimistic update
    
    const updatedProfile = await supabaseService.updateProfile({ user_name: userName, profile_pic_url: profilePicUrl });
    if(updatedProfile) {
        toast.success('Profil berhasil diperbarui!');
    } else {
        setProfile(oldProfile); // Revert on failure
        toast.error('Gagal memperbarui profil.');
    }
  };


  const toggleTheme = () => {
      setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    setActiveFeature('home');
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error)
        toast.error('Gagal keluar: ' + error.message);
    } else {
        toast.info('Anda telah berhasil keluar.');
    }
  };

  const handleScheduleItemClick = (itemId: string) => {
    setActiveFeature('schedule');
    setInitialItemId(itemId);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- PDF Export Functions ---
    const downloadPDF = async (component: React.ReactElement, filename: string, multiPageComponents: React.ReactElement[] = []) => {
        toast.info(`Membuat file PDF: ${filename}...`);
        
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const componentsToRender = multiPageComponents.length > 0 ? multiPageComponents : [component];

        for (let i = 0; i < componentsToRender.length; i++) {
            const currentComponent = componentsToRender[i];
            
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.style.top = '0';
            document.body.appendChild(container);

            const root = ReactDOM.createRoot(container);
            root.render(currentComponent);
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
                toast.error("Gagal membuat halaman PDF.");
            } finally {
                root.unmount();
                document.body.removeChild(container);
            }
        }
        
        pdf.save(filename);
        toast.success(`${filename} berhasil diunduh!`);
    };

    const exportSchedulePDF = () => {
        if (schedule.length === 0) {
            toast.info("Tidak ada jadwal untuk diekspor.");
            return;
        }
        downloadPDF(
            <SchedulePDF items={schedule} title="Laporan Jadwal" />,
            'laporan_jadwal.pdf'
        );
    };

    const exportTasksPDF = () => {
        if (tasks.length === 0) {
            toast.info("Tidak ada tugas untuk diekspor.");
            return;
        }
        downloadPDF(
            <TasksPDF items={tasks} title="Laporan Daftar Tugas" />,
            'laporan_tugas.pdf'
        );
    };

    const exportAllReportsPDF = () => {
        if (evaluations.length === 0) {
            toast.info("Tidak ada rapor untuk diekspor.");
            return;
        }
        const reportComponents = evaluations.map(report => <ReportPDF key={report.id} report={report} />);
        downloadPDF(
            reportComponents[0],
            'semua_laporan_rapor.pdf',
            reportComponents
        );
    };

  const handleNavigate = (feature: Feature) => {
    setActiveFeature(feature);
    setIsSidebarOpen(false);
  };

  const renderFeature = () => {
    if (!profile) {
        return <LoadingScreen />;
    }
    switch (activeFeature) {
        case 'home': return <HomeView setActiveFeature={setActiveFeature} toggleSidebar={toggleSidebar} schedule={schedule} tasks={tasks} userName={profile.user_name || 'Pengguna'} profilePicUrl={profile.profile_pic_url} onScheduleItemClick={handleScheduleItemClick} />;
        case 'schedule': return <ScheduleView schedule={schedule} addSchedule={addScheduleItem} updateSchedule={updateScheduleItem} deleteSchedule={deleteScheduleItem} setActiveFeature={setActiveFeature} initialItemId={initialItemId} />;
        case 'todo': return <TodoGenerator setActiveFeature={setActiveFeature} tasks={tasks} addTask={addTaskItem} updateTask={updateTaskItem} deleteTask={deleteTaskItem} />;
        case 'evaluation': return <EvaluationView setActiveFeature={setActiveFeature} classrooms={classrooms} evaluationOptions={evaluationOptions} addEvaluation={addEvaluationItem} addClassroom={addClassroomItem} updateClassroom={updateClassroomItem} deleteClassroom={deleteClassroomItem} addStudent={addStudentToClass} deleteStudent={deleteStudentFromClass} />;
        case 'ai-assistant': return <TipsGenerator setActiveFeature={setActiveFeature} schedule={schedule} tasks={tasks} classrooms={classrooms} messages={aiMessages} setMessages={setAiMessages} />;
        case 'reports': return <ReportListView setActiveFeature={setActiveFeature} reports={evaluations} />;
        case 'profile': return <ProfileView setActiveFeature={setActiveFeature} profile={profile} onUpdateProfile={handleUpdateProfile} theme={theme} toggleTheme={toggleTheme} onLogoutClick={() => setIsLogoutModalOpen(true)} />;
        case 'profile-notifications': return <NotificationSettingsView setActiveFeature={setActiveFeature} />;
        case 'profile-security': return <SecuritySettingsView setActiveFeature={setActiveFeature} />;
        case 'profile-help': return <HelpCenterView setActiveFeature={setActiveFeature} />;
        case 'profile-contact': return <ContactView setActiveFeature={setActiveFeature} />;
        case 'profile-change-password': return <ChangePasswordView setActiveFeature={setActiveFeature} />;
        case 'profile-2fa': return <TwoFactorAuthView setActiveFeature={setActiveFeature} />;
        case 'profile-devices': return <ConnectedDevicesView setActiveFeature={setActiveFeature} />;
        default: return <HomeView setActiveFeature={setActiveFeature} toggleSidebar={toggleSidebar} schedule={schedule} tasks={tasks} userName={profile.user_name || 'Pengguna'} profilePicUrl={profile.profile_pic_url} onScheduleItemClick={handleScheduleItemClick} />;
    }
  };

  if (isCheckingAuth) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <AuthView />;
  }

  return (
    <div id="app-container" className={`flex h-dvh font-sans antialiased ${theme}`}>
        <DesktopSidebar activeFeature={activeFeature} onNavigate={setActiveFeature} />
        <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
            <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--background-light)] z-50">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    renderFeature()
                )}
            </div>
        </div>
        <BottomNavBar activeFeature={activeFeature} onNavigate={handleNavigate} />
        <Sidebar
            isOpen={isSidebarOpen}
            onClose={toggleSidebar}
            onNavigate={handleNavigate}
            onExportSchedule={exportSchedulePDF}
            onExportTasks={exportTasksPDF}
            onExportReports={exportAllReportsPDF}
            onLogoutClick={() => setIsLogoutModalOpen(true)}
            hasSchedule={schedule.length > 0}
            hasTasks={tasks.length > 0}
            hasReports={evaluations.length > 0}
        />
        <ConfirmLogoutModal 
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={handleLogout}
        />
    </div>
  );
};

export default App;
