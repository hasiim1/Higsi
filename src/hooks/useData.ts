import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  Course,
  Module,
  Lesson,
  Task,
  Assignment,
  Note,
  FocusSession,
  Notification
} from '@/lib/seedData';
import { useState, useEffect } from 'react';

// 1. Auth Hook
export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabase production auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      queryClient.invalidateQueries();
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const signUp = async (email: string, password: string, name: string) => {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    return res;
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
  };

  return {
    user,
    isLoading: loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };
}

// 2. Profile and Settings Hook
export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });
}

export function useUserSettings(userId?: string) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['settings', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const mutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', userId] });
    }
  });

  return { ...query, updateSettings: mutation.mutateAsync };
}

// 3. Courses Hook
export function useCourses() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Course[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newCourse: Omit<Course, 'id' | 'archived' | 'progress'>) => {
      const { data, error } = await supabase
        .from('courses')
        .insert([newCourse])
        .select()
        .single();
      if (error) throw error;
      return data as Course;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Course> }) => {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Course;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] })
  });

  return {
    courses: query.data || [],
    isLoading: query.isLoading,
    createCourse: createMutation.mutateAsync,
    updateCourse: updateMutation.mutateAsync,
    deleteCourse: deleteMutation.mutateAsync
  };
}

// 4. Modules and Lessons Hook (Combined for simple course details rendering)
export function useCourseContent(courseId: string) {
  const queryClient = useQueryClient();

  const modulesQuery = useQuery({
    queryKey: ['modules', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');
      if (error) throw error;
      return data as Module[];
    },
    enabled: !!courseId
  });

  const lessonsQuery = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*, modules!inner(course_id)')
        .eq('modules.course_id', courseId)
        .order('order_index');
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!courseId
  });

  const createModule = useMutation({
    mutationFn: async (module: Omit<Module, 'id'>) => {
      const { data, error } = await supabase.from('modules').insert([module]).select().single();
      if (error) throw error;
      return data as Module;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modules', courseId] })
  });

  const updateLessonStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Lesson['status'] }) => {
      const { data, error } = await supabase
        .from('lessons')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Lesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });

  return {
    modules: modulesQuery.data || [],
    lessons: lessonsQuery.data || [],
    isLoading: modulesQuery.isLoading || lessonsQuery.isLoading,
    createModule: createModule.mutateAsync,
    updateLessonStatus: updateLessonStatus.mutateAsync
  };
}

// 5. Tasks Hook
export function useTasks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Task[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (task: Omit<Task, 'id'>) => {
      const { data, error } = await supabase.from('tasks').insert([task]).select().single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  return {
    tasks: query.data || [],
    isLoading: query.isLoading,
    createTask: createMutation.mutateAsync,
    updateTask: updateMutation.mutateAsync,
    deleteTask: deleteMutation.mutateAsync
  };
}

// 6. Assignments Hook
export function useAssignments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('deadline', { ascending: true });
      if (error) throw error;
      return data as Assignment[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (assignment: Omit<Assignment, 'id'>) => {
      const { data, error } = await supabase.from('assignments').insert([assignment]).select().single();
      if (error) throw error;
      return data as Assignment;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Assignment> }) => {
      const { data, error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Assignment;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] })
  });

  return {
    assignments: query.data || [],
    isLoading: query.isLoading,
    createAssignment: createMutation.mutateAsync,
    updateAssignment: updateMutation.mutateAsync,
    deleteAssignment: deleteMutation.mutateAsync
  };
}

// 7. Notes Hook
export function useNotes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as Note[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('notes').insert([note]).select().single();
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Note> }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] })
  });

  return {
    notes: query.data || [],
    isLoading: query.isLoading,
    createNote: createMutation.mutateAsync,
    updateNote: updateMutation.mutateAsync,
    deleteNote: deleteMutation.mutateAsync
  };
}

// 8. Focus Sessions Hook
export function useFocusSessions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['focus_sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as FocusSession[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (session: Omit<FocusSession, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('focus_sessions').insert([session]).select().single();
      if (error) throw error;
      return data as FocusSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  return {
    sessions: query.data || [],
    isLoading: query.isLoading,
    createFocusSession: createMutation.mutateAsync
  };
}

// 9. Notifications Hook
export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Notification[];
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Notification;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  return {
    notifications: query.data || [],
    isLoading: query.isLoading,
    markAsRead: markAsRead.mutateAsync
  };
}
