import {
  SEED_COURSES,
  SEED_MODULES,
  SEED_LESSONS,
  SEED_NOTES,
  SEED_TASKS,
  SEED_ASSIGNMENTS,
  SEED_FOCUS_SESSIONS,
  SEED_NOTIFICATIONS,
  Course,
  Module,
  Lesson,
  Task,
  Assignment,
  Note,
  FocusSession,
  Notification
} from './seedData';

// Storage keys
const KEYS = {
  COURSES: 'higsi_courses',
  MODULES: 'higsi_modules',
  LESSONS: 'higsi_lessons',
  TASKS: 'higsi_tasks',
  ASSIGNMENTS: 'higsi_assignments',
  NOTES: 'higsi_notes',
  FOCUS: 'higsi_focus',
  NOTIFICATIONS: 'higsi_notifications',
  PROFILE: 'higsi_profile',
  SETTINGS: 'higsi_settings'
};

// Initialize localStorage with seed data if empty
export const initDemoDb = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(KEYS.COURSES)) {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(SEED_COURSES));
  }
  if (!localStorage.getItem(KEYS.MODULES)) {
    localStorage.setItem(KEYS.MODULES, JSON.stringify(SEED_MODULES));
  }
  if (!localStorage.getItem(KEYS.LESSONS)) {
    localStorage.setItem(KEYS.LESSONS, JSON.stringify(SEED_LESSONS));
  }
  if (!localStorage.getItem(KEYS.TASKS)) {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(SEED_TASKS));
  }
  if (!localStorage.getItem(KEYS.ASSIGNMENTS)) {
    localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(SEED_ASSIGNMENTS));
  }
  if (!localStorage.getItem(KEYS.NOTES)) {
    localStorage.setItem(KEYS.NOTES, JSON.stringify(SEED_NOTES));
  }
  if (!localStorage.getItem(KEYS.FOCUS)) {
    localStorage.setItem(KEYS.FOCUS, JSON.stringify(SEED_FOCUS_SESSIONS));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
  }
  if (!localStorage.getItem(KEYS.PROFILE)) {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify({
      id: 'demo-user-id',
      name: 'Alex Rivera',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60',
      streak: 7,
      last_active: new Date().toISOString()
    }));
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify({
      id: 'demo-user-id',
      theme: 'dark',
      pomodoro_duration: 25,
      short_break_duration: 5,
      long_break_duration: 15,
      auto_start_breaks: false,
      auto_start_pomo: false
    }));
  }
};

// Generic read/write helpers
const read = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  initDemoDb();
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const write = <T>(key: string, data: T[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

const readItem = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  initDemoDb();
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const writeItem = <T>(key: string, data: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Demo database API
export const demoDb = {
  // Profile & Settings
  getProfile: () => readItem<{ id: string; name: string; avatar_url: string; streak: number; last_active: string }>(KEYS.PROFILE),
  updateProfile: (profile: any) => {
    const curr = demoDb.getProfile() || {};
    const updated = { ...curr, ...profile };
    writeItem(KEYS.PROFILE, updated);
    return updated;
  },
  getSettings: () => readItem<{ id: string; theme: string; pomodoro_duration: number; short_break_duration: number; long_break_duration: number; auto_start_breaks: boolean; auto_start_pomo: boolean }>(KEYS.SETTINGS),
  updateSettings: (settings: any) => {
    const curr = demoDb.getSettings() || {};
    const updated = { ...curr, ...settings };
    writeItem(KEYS.SETTINGS, updated);
    return updated;
  },

  // Courses
  getCourses: () => read<Course>(KEYS.COURSES),
  createCourse: (course: Omit<Course, 'id' | 'archived' | 'progress'>) => {
    const list = read<Course>(KEYS.COURSES);
    const newCourse: Course = {
      ...course,
      id: crypto.randomUUID(),
      archived: false,
      progress: 0
    };
    write(KEYS.COURSES, [...list, newCourse]);
    return newCourse;
  },
  updateCourse: (id: string, updates: Partial<Course>) => {
    const list = read<Course>(KEYS.COURSES);
    const updated = list.map(c => c.id === id ? { ...c, ...updates } : c);
    write(KEYS.COURSES, updated);
    return updated.find(c => c.id === id) || null;
  },
  deleteCourse: (id: string) => {
    const list = read<Course>(KEYS.COURSES);
    write(KEYS.COURSES, list.filter(c => c.id !== id));
  },

  // Modules
  getModules: () => read<Module>(KEYS.MODULES),
  createModule: (module: Omit<Module, 'id'>) => {
    const list = read<Module>(KEYS.MODULES);
    const newModule: Module = { ...module, id: crypto.randomUUID() };
    write(KEYS.MODULES, [...list, newModule]);
    return newModule;
  },
  updateModule: (id: string, updates: Partial<Module>) => {
    const list = read<Module>(KEYS.MODULES);
    const updated = list.map(m => m.id === id ? { ...m, ...updates } : m);
    write(KEYS.MODULES, updated);
    return updated.find(m => m.id === id) || null;
  },
  deleteModule: (id: string) => {
    const list = read<Module>(KEYS.MODULES);
    write(KEYS.MODULES, list.filter(m => m.id !== id));
  },

  // Lessons
  getLessons: () => read<Lesson>(KEYS.LESSONS),
  createLesson: (lesson: Omit<Lesson, 'id'>) => {
    const list = read<Lesson>(KEYS.LESSONS);
    const newLesson: Lesson = { ...lesson, id: crypto.randomUUID() };
    write(KEYS.LESSONS, [...list, newLesson]);
    return newLesson;
  },
  updateLesson: (id: string, updates: Partial<Lesson>) => {
    const list = read<Lesson>(KEYS.LESSONS);
    const updated = list.map(l => l.id === id ? { ...l, ...updates } : l);
    write(KEYS.LESSONS, updated);
    
    // Auto update course progress when lessons change status
    const lesson = updated.find(l => l.id === id);
    if (lesson) {
      demoDb.recalculateCourseProgressByModule(lesson.module_id);
    }
    return updated.find(l => l.id === id) || null;
  },
  deleteLesson: (id: string) => {
    const list = read<Lesson>(KEYS.LESSONS);
    write(KEYS.LESSONS, list.filter(l => l.id !== id));
  },

  // Recalculate progress helper
  recalculateCourseProgressByModule: (moduleId: string) => {
    const modules = read<Module>(KEYS.MODULES);
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    
    const courseId = mod.course_id;
    const courseModules = modules.filter(m => m.course_id === courseId).map(m => m.id);
    const lessons = read<Lesson>(KEYS.LESSONS).filter(l => courseModules.includes(l.module_id));
    
    if (lessons.length === 0) return;
    
    const completed = lessons.filter(l => l.status === 'completed').length;
    const progress = Math.round((completed / lessons.length) * 100);
    
    demoDb.updateCourse(courseId, { progress });
  },

  // Tasks
  getTasks: () => read<Task>(KEYS.TASKS),
  createTask: (task: Omit<Task, 'id'>) => {
    const list = read<Task>(KEYS.TASKS);
    const newTask: Task = { ...task, id: crypto.randomUUID() };
    write(KEYS.TASKS, [...list, newTask]);
    return newTask;
  },
  updateTask: (id: string, updates: Partial<Task>) => {
    const list = read<Task>(KEYS.TASKS);
    const updated = list.map(t => t.id === id ? { ...t, ...updates } : t);
    write(KEYS.TASKS, updated);
    return updated.find(t => t.id === id) || null;
  },
  deleteTask: (id: string) => {
    const list = read<Task>(KEYS.TASKS);
    write(KEYS.TASKS, list.filter(t => t.id !== id));
  },

  // Assignments
  getAssignments: () => read<Assignment>(KEYS.ASSIGNMENTS),
  createAssignment: (assignment: Omit<Assignment, 'id'>) => {
    const list = read<Assignment>(KEYS.ASSIGNMENTS);
    const newAss: Assignment = { ...assignment, id: crypto.randomUUID() };
    write(KEYS.ASSIGNMENTS, [...list, newAss]);
    return newAss;
  },
  updateAssignment: (id: string, updates: Partial<Assignment>) => {
    const list = read<Assignment>(KEYS.ASSIGNMENTS);
    const updated = list.map(a => a.id === id ? { ...a, ...updates } : a);
    write(KEYS.ASSIGNMENTS, updated);
    return updated.find(a => a.id === id) || null;
  },
  deleteAssignment: (id: string) => {
    const list = read<Assignment>(KEYS.ASSIGNMENTS);
    write(KEYS.ASSIGNMENTS, list.filter(a => a.id !== id));
  },

  // Notes
  getNotes: () => read<Note>(KEYS.NOTES),
  createNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    const list = read<Note>(KEYS.NOTES);
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    write(KEYS.NOTES, [...list, newNote]);
    return newNote;
  },
  updateNote: (id: string, updates: Partial<Note>) => {
    const list = read<Note>(KEYS.NOTES);
    const updated = list.map(n => n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n);
    write(KEYS.NOTES, updated);
    return updated.find(n => n.id === id) || null;
  },
  deleteNote: (id: string) => {
    const list = read<Note>(KEYS.NOTES);
    write(KEYS.NOTES, list.filter(n => n.id !== id));
  },

  // Focus Sessions
  getFocusSessions: () => read<FocusSession>(KEYS.FOCUS),
  createFocusSession: (session: Omit<FocusSession, 'id' | 'created_at'>) => {
    const list = read<FocusSession>(KEYS.FOCUS);
    const newSession: FocusSession = {
      ...session,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    write(KEYS.FOCUS, [...list, newSession]);
    
    // Add streak check
    const profile = demoDb.getProfile();
    if (profile) {
      // Check if last focus was yesterday or today
      const today = new Date().toDateString();
      const lastActive = new Date(profile.last_active).toDateString();
      if (lastActive !== today) {
        const diffDays = Math.floor((new Date().getTime() - new Date(profile.last_active).getTime()) / (1000 * 60 * 60 * 24));
        let streak = profile.streak;
        if (diffDays <= 1) {
          streak += 1;
        } else {
          streak = 1; // reset streak
        }
        demoDb.updateProfile({ streak, last_active: new Date().toISOString() });
      }
    }
    
    return newSession;
  },

  // Notifications
  getNotifications: () => read<Notification>(KEYS.NOTIFICATIONS),
  createNotification: (notif: Omit<Notification, 'id' | 'is_read' | 'created_at'>) => {
    const list = read<Notification>(KEYS.NOTIFICATIONS);
    const newNotif: Notification = {
      ...notif,
      id: crypto.randomUUID(),
      is_read: false,
      created_at: new Date().toISOString()
    };
    write(KEYS.NOTIFICATIONS, [...list, newNotif]);
    return newNotif;
  },
  updateNotification: (id: string, updates: Partial<Notification>) => {
    const list = read<Notification>(KEYS.NOTIFICATIONS);
    const updated = list.map(n => n.id === id ? { ...n, ...updates } : n);
    write(KEYS.NOTIFICATIONS, updated);
    return updated.find(n => n.id === id) || null;
  }
};
