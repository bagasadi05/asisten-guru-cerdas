
import { createClient } from '@supabase/supabase-js';
import { ScheduleItem, TaskItem, Classroom, Student, Evaluation, Profile } from '../types';

const supabaseUrl = "https://mgsroafwooxstthsfokd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nc3JvYWZ3b294c3R0aHNmb2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzA5ODAsImV4cCI6MjA2Njc0Njk4MH0.fb73GQGfE3tFdzorvqEFOB-x42PqrKvQYU5f42B3_rw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to handle Supabase query errors
async function handleQuery<T>(query: PromiseLike<{ data: T | null; error: any }>): Promise<T | null> {
    const { data, error } = await query;
    if (error) {
        // .maybeSingle() will not error on 0 rows, but .single() will.
        // This log is still useful for other types of errors.
        console.error("Supabase error:", error.message);
        return null;
    }
    return data;
}

// --- Profile ---
export const getProfile = async (): Promise<Profile | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    let profile = await handleQuery<Profile>(
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    );

    // Fallback: If profile doesn't exist (e.g., trigger is slow), create it on the client.
    // This makes the app more resilient to the race condition after sign-up.
    if (!profile) {
        console.warn("Profile not found, attempting to create a fallback profile.");
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ 
                id: user.id, 
                user_name: user.email?.split('@')[0] || 'Pengguna Baru' 
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error creating fallback profile:", insertError);
            return null; // Could not fetch or create a profile.
        }
        
        console.log("Fallback profile created successfully.");
        profile = newProfile;
    }

    return profile;
}

export const updateProfile = async (updates: { user_name?: string; profile_pic_url?: string | null }): Promise<Profile | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Use .maybeSingle() to prevent error if the profile is being updated but doesn't exist.
    const profile = await handleQuery<Profile>(
        supabase.from('profiles').update(updates).eq('id', user.id).select().maybeSingle()
    );
    return profile;
}

// --- Schedule ---
export const getSchedules = async (): Promise<ScheduleItem[]> => {
    const data = await handleQuery<any[]>(supabase.from('schedules').select('*').order('date,start_time'));
    if (!data) return [];
    return data.map(item => ({
        id: item.id,
        title: item.title,
        date: item.date,
        startTime: item.start_time,
        endTime: item.end_time,
        type: item.type,
        notes: item.notes,
    }));
}

export const addSchedule = async (item: Omit<ScheduleItem, 'id' | 'user_id'>): Promise<ScheduleItem | null> => {
    const itemForSupabase = {
        title: item.title,
        date: item.date,
        start_time: item.startTime,
        end_time: item.endTime,
        type: item.type,
        notes: item.notes,
    };
    // .single() is fine here because an insert of one item should return exactly one item.
    const data = await handleQuery<any>(supabase.from('schedules').insert([itemForSupabase]).select().single());
    if (!data) return null;
    
    return {
        id: data.id,
        title: data.title,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        type: data.type,
        notes: data.notes,
    };
}

export const addMultipleSchedules = async (items: Omit<ScheduleItem, 'id'|'user_id'>[]): Promise<ScheduleItem[] | null> => {
    const itemsForSupabase = items.map(item => ({
        title: item.title,
        date: item.date,
        start_time: item.startTime,
        end_time: item.endTime,
        type: item.type,
        notes: item.notes,
    }));
    
    const data = await handleQuery<any[]>(supabase.from('schedules').insert(itemsForSupabase).select());

    if (!data) return null;
    
    return data.map(d => ({
        id: d.id,
        title: d.title,
        date: d.date,
        startTime: d.start_time,
        endTime: d.end_time,
        type: d.type,
        notes: d.notes,
    }));
}

export const updateSchedule = async (id: string, item: Omit<ScheduleItem, 'id' | 'user_id'>): Promise<ScheduleItem | null> => {
    const itemForSupabase = {
        title: item.title,
        date: item.date,
        start_time: item.startTime,
        end_time: item.endTime,
        type: item.type,
        notes: item.notes,
    };
    const data = await handleQuery<any>(supabase.from('schedules').update(itemForSupabase).eq('id', id).select().single());
    if (!data) return null;

    return {
        id: data.id,
        title: data.title,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        type: data.type,
        notes: data.notes,
    };
}

export const deleteSchedule = async (id: string): Promise<any> => {
    return handleQuery(supabase.from('schedules').delete().eq('id', id).select());
}

// --- Tasks ---
export const getTasks = async (): Promise<TaskItem[]> => {
    const data = await handleQuery<any[]>(supabase.from('tasks').select('*').order('due_date'));
    return (data || []).map(task => ({
        ...task,
        dueDate: new Date(task.due_date + 'T00:00:00'), // Ensure we parse as local date without timezone shift
    }));
}

export const addTask = async (item: Omit<TaskItem, 'id' | 'user_id'>): Promise<TaskItem | null> => {
    const itemForSupabase = { ...item, due_date: item.dueDate.toISOString().split('T')[0] };
    delete (itemForSupabase as any).dueDate;

    const data = await handleQuery<any>(supabase.from('tasks').insert([itemForSupabase]).select().single());
    if (!data) return null;
    return { ...data, dueDate: new Date(data.due_date + 'T00:00:00') };
}

export const updateTask = async (id: string, updates: Partial<TaskItem>): Promise<TaskItem | null> => {
    const updatesForSupabase: any = { ...updates };
    if (updates.dueDate) {
        updatesForSupabase.due_date = updates.dueDate.toISOString().split('T')[0];
        delete updatesForSupabase.dueDate;
    }
    // Use .maybeSingle() for robustness in case the item was deleted elsewhere.
    const data = await handleQuery<any>(supabase.from('tasks').update(updatesForSupabase).eq('id', id).select().maybeSingle());
    if (!data) return null;
    return { ...data, dueDate: new Date(data.due_date + 'T00:00:00') };
}

export const deleteTask = async (id: string): Promise<any> => {
    // Adding .select() ensures that the deleted data is returned, which is useful for confirmation.
    return handleQuery(supabase.from('tasks').delete().eq('id', id).select());
}

// --- Classrooms & Students ---
export const getClassrooms = async (): Promise<Classroom[]> => {
    const classroomsData = await handleQuery<any[]>(supabase.from('classrooms').select('*').order('created_at'));
    if (!classroomsData) return [];
    
    // Fetch all students at once to avoid N+1 queries
    const studentsData = await handleQuery<Student[]>(supabase.from('students').select('*'));
    
    // Create a map for quick student lookup
    const studentsByClassroom = studentsData?.reduce((acc, student) => {
        const classId = (student as any).classroom_id;
        if (!acc[classId]) {
            acc[classId] = [];
        }
        acc[classId].push(student);
        return acc;
    }, {} as Record<string, Student[]>);


    return classroomsData.map(c => ({
        ...c,
        students: studentsByClassroom?.[c.id] || [],
    }));
}

export const addClassroom = async (name: string): Promise<Classroom | null> => {
    const data = await handleQuery<any>(supabase.from('classrooms').insert([{ name }]).select().single());
    if (!data) return null;
    return { ...data, students: [] };
}

export const updateClassroom = async (id: string, name: string): Promise<Pick<Classroom, 'id' | 'name'> | null> => {
    const data = await handleQuery<Pick<Classroom, 'id' | 'name'>>(
        supabase.from('classrooms').update({ name }).eq('id', id).select('id, name').maybeSingle()
    );
    return data;
}

export const deleteClassroom = async (id: string): Promise<any> => {
    // Note: Assumes ON DELETE CASCADE is set for students in Supabase.
    return handleQuery(supabase.from('classrooms').delete().eq('id', id).select());
}

export const addStudent = async (name: string, classroom_id: string): Promise<Student | null> => {
    const data = await handleQuery<Student>(supabase.from('students').insert([{ name, classroom_id }]).select('id, name').single());
    return data;
}

export const deleteStudent = async (id: string): Promise<any> => {
    return handleQuery(supabase.from('students').delete().eq('id', id).select());
}

// --- Evaluations ---
export const getEvaluations = async (): Promise<Evaluation[]> => {
    const data = await handleQuery<any[]>(supabase.from('evaluations').select('*').order('date', { ascending: false }));
    if (!data) return [];
    return data.map(result => ({
        id: result.id,
        studentId: result.student_id,
        studentName: result.student_name,
        classId: result.class_id,
        className: result.class_name,
        date: result.date,
        sikap: result.sikap,
        akademik: result.akademik,
        karakter: result.karakter,
        catatan: result.catatan,
        deskripsi: result.deskripsi,
        reportText: result.report_text,
    }));
}

export const addEvaluation = async (evaluation: Omit<Evaluation, 'id'>): Promise<Evaluation | null> => {
    const evalForSupabase = {
        student_id: evaluation.studentId,
        student_name: evaluation.studentName,
        class_id: evaluation.classId,
        class_name: evaluation.className,
        date: evaluation.date,
        sikap: evaluation.sikap,
        akademik: evaluation.akademik,
        karakter: evaluation.karakter,
        catatan: evaluation.catatan,
        deskripsi: evaluation.deskripsi,
        report_text: evaluation.reportText,
    };
    const data = await handleQuery<any>(supabase.from('evaluations').insert([evalForSupabase]).select().single());
    if (!data) return null;

    return {
        id: data.id,
        studentId: data.student_id,
        studentName: data.student_name,
        classId: data.class_id,
        className: data.class_name,
        date: data.date,
        sikap: data.sikap,
        akademik: data.akademik,
        karakter: data.karakter,
        catatan: data.catatan,
        deskripsi: data.deskripsi,
        reportText: data.report_text,
    };
}
