

import React from 'react';
import type { Session } from '@supabase/supabase-js';

export type { Session };

export interface Profile {
  id: string;
  user_name: string;
  profile_pic_url: string | null;
  updated_at: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: 'mengajar' | 'rapat' | 'administrasi' | 'lainnya';
  notes: string;
}

export type TaskStatus = 'Selesai' | 'Dikerjakan' | 'Belum';
export type TaskCategory = 'Koreksi' | 'Persiapan' | 'Administrasi' | 'Lainnya';

export interface TaskItem {
  id: string;
  title: string;
  dueDate: Date; // For logic
  status: TaskStatus;
  category: TaskCategory;
}

export interface Student {
  id: string;
  name: string;
}

export interface Classroom {
  id: string;
  name: string;
  students: Student[];
}

export interface Evaluation {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  
  // Structured data from form
  sikap: string;
  akademik: string;
  karakter: string;
  catatan: string;
  deskripsi: string;
  
  // AI-generated narrative
  reportText: string;
}

export interface Message {
    id: string;
    text: string;
    sender: 'ai' | 'user';
}

export type NotificationPermission = 'granted' | 'denied' | 'default';
