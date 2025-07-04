import { useEffect, useState } from 'react';
import { ScheduleItem, TaskItem } from '../types';

interface UseNotificationsProps {
  schedule: ScheduleItem[];
  tasks: TaskItem[];
}

const NOTIFICATION_LEAD_TIME_MS = 15 * 60 * 1000; // 15 minutes
const CHECK_INTERVAL_MS = 60 * 1000; // Check every 1 minute

export const useNotifications = ({ schedule, tasks }: UseNotificationsProps) => {
  const [notifiedItemIds, setNotifiedItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Only run the interval if permission is granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date().getTime();

      // Check schedule items
      schedule.forEach(item => {
        const itemTime = new Date(`${item.date}T${item.startTime}`).getTime();
        // Check if the item is in the future but within the lead time
        if (
          !notifiedItemIds.has(item.id) &&
          itemTime > now &&
          itemTime - now <= NOTIFICATION_LEAD_TIME_MS
        ) {
          new Notification('Pengingat Jadwal', {
            body: `${item.title} akan dimulai pada pukul ${item.startTime}.`,
            icon: '/vite.svg', // Using a default icon
            tag: item.id, // Tag prevents duplicate notifications for the same item
          });
          // Add to notified set to prevent re-notifying
          setNotifiedItemIds(prev => new Set(prev).add(item.id));
        }
      });

      // Check task items
      tasks.forEach(task => {
        // Skip completed tasks
        if (task.status === 'Selesai') return;
        
        const dueDate = task.dueDate.getTime();
        if (
          !notifiedItemIds.has(task.id) &&
          dueDate > now &&
          dueDate - now <= NOTIFICATION_LEAD_TIME_MS
        ) {
          new Notification('Pengingat Tugas', {
            body: `Tugas "${task.title}" akan segera tenggat.`,
            icon: '/vite.svg',
            tag: task.id,
          });
          setNotifiedItemIds(prev => new Set(prev).add(task.id));
        }
      });
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [schedule, tasks, notifiedItemIds]);
};
