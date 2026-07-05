import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Pomodoro Focus Session State
  timerStatus: 'idle' | 'running' | 'paused';
  timeLeft: number; // in seconds
  timerDuration: number; // total duration in seconds
  timerType: 'Deep Work' | 'Break';
  activeCourseId: string | null;
  
  // Focus Timer Actions
  setTimerStatus: (status: 'idle' | 'running' | 'paused') => void;
  setTimeLeft: (time: number) => void;
  setTimerDuration: (duration: number) => void;
  setTimerType: (type: 'Deep Work' | 'Break') => void;
  setActiveCourseId: (courseId: string | null) => void;
  resetTimer: () => void;
  tick: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  timerStatus: 'idle',
  timeLeft: 25 * 60,
  timerDuration: 25 * 60,
  timerType: 'Deep Work',
  activeCourseId: null,
  
  setTimerStatus: (status) => set({ timerStatus: status }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setTimerDuration: (duration) => set({ timerDuration: duration, timeLeft: duration }),
  setTimerType: (type) => {
    const duration = type === 'Deep Work' ? 25 * 60 : 5 * 60;
    set({ 
      timerType: type, 
      timerDuration: duration, 
      timeLeft: duration,
      timerStatus: 'idle' 
    });
  },
  setActiveCourseId: (courseId) => set({ activeCourseId: courseId }),
  
  resetTimer: () => {
    set((state) => ({ 
      timeLeft: state.timerDuration, 
      timerStatus: 'idle' 
    }));
  },
  
  tick: () => {
    const { timeLeft, timerStatus } = get();
    if (timerStatus === 'running' && timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 });
    } else if (timeLeft === 0 && timerStatus === 'running') {
      set({ timerStatus: 'idle' });
    }
  }
}));
