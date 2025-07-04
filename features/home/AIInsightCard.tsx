
import React, { useState, useEffect, useMemo } from 'react';
import { generateContent } from '../../services/geminiService';
import { ScheduleItem, TaskItem } from '../../types';
import { SparklesIcon } from '../../components/icons/Icons';
import { Spinner } from '../../components/Spinner';

interface AIInsightCardProps {
  schedule: ScheduleItem[];
  tasks: TaskItem[];
}

const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const todayStr = today.toISOString().split('T')[0];
const tomorrowStr = tomorrow.toISOString().split('T')[0];

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ schedule, tasks }) => {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const scheduleForInsight = useMemo(() => {
    return schedule.filter(item => item.date === todayStr || item.date === tomorrowStr);
  }, [schedule]);

  const tasksForInsight = useMemo(() => {
    return tasks.filter(task => task.status !== 'Selesai');
  }, [tasks]);

  useEffect(() => {
    const fetchInsight = async () => {
      const storedInsight = localStorage.getItem('ai_daily_insight');
      const lastFetchedDate = localStorage.getItem('ai_daily_insight_date');
      const currentDate = new Date().toDateString();

      if (storedInsight && lastFetchedDate === currentDate) {
        setInsight(storedInsight);
        setIsLoading(false);
        return;
      }
      
      if (scheduleForInsight.length === 0 && tasksForInsight.length === 0) {
          setIsLoading(false);
          setInsight("Semua tugas selesai dan tidak ada jadwal terdekat. Manfaatkan waktu luang Anda!");
          return;
      }

      setIsLoading(true);
      setError('');

      const prompt = `
        Anda adalah "Asisten Guru Cerdas". Berdasarkan jadwal dan daftar tugas ini, berikan satu (1) insight atau saran proaktif yang singkat (maksimal 20 kata), memotivasi, dan bermanfaat untuk seorang guru SD di Indonesia. 
        Fokus pada hal yang paling penting atau mendesak untuk hari ini atau besok. Jangan gunakan format list/poin.
        Jika tidak ada data, berikan sapaan motivasi umum.
        
        DATA:
        - Jadwal (hari ini & besok): ${JSON.stringify(scheduleForInsight)}
        - Tugas (belum selesai): ${JSON.stringify(tasksForInsight)}
      `;

      try {
        const result = await generateContent(prompt);
        setInsight(result);
        localStorage.setItem('ai_daily_insight', result);
        localStorage.setItem('ai_daily_insight_date', currentDate);
      } catch (e) {
        setError('Gagal mendapatkan insight AI.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsight();
  }, [scheduleForInsight, tasksForInsight]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex items-center gap-2"><Spinner size="sm" /> <span className="text-[var(--text-secondary)]">Menganalisis...</span></div>;
    }
    if (error) {
      return <p className="text-red-500">{error}</p>;
    }
    return <p className="text-base font-medium text-[var(--text-primary)] leading-snug">{insight}</p>;
  };

  return (
    <div className="mx-4 mt-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/40 dark:to-purple-900/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-start gap-4 shadow-sm">
            <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 size-10 rounded-xl flex items-center justify-center text-white">
                <SparklesIcon className="size-6" />
            </div>
            <div className="flex-1 min-h-[40px] flex items-center">
                {renderContent()}
            </div>
        </div>
    </div>
  );
};
