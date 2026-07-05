'use client';

import React from 'react';
import Header from '@/components/Header';
import { 
  useAuth, 
  useProfile, 
  useTasks, 
  useAssignments, 
  useFocusSessions 
} from '@/hooks/useData';
import { useUIStore } from '@/lib/store';
import { 
  Flame, 
  Play, 
  Pause,
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  FileEdit, 
  Clock, 
  Calendar,
  AlertCircle,
  Timer
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { tasks, updateTask } = useTasks();
  const { assignments } = useAssignments();
  const { sessions } = useFocusSessions();

  // Zustand Timer UI Sync
  const { 
    timerStatus, 
    timeLeft, 
    timerType, 
    setTimerStatus 
  } = useUIStore();

  // Get active priority tasks (not completed)
  const priorityTasks = tasks
    .filter(t => t.status !== 'Completed')
    .slice(0, 3);

  // Get upcoming deadlines
  const upcomingDeadlines = assignments
    .filter(a => a.status !== 'Done' && a.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3);

  // Format timer text
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle task completion
  const handleToggleTask = async (id: string, currentStatus: string) => {
    try {
      await updateTask({
        id,
        updates: { status: currentStatus === 'Completed' ? 'To Do' : 'Completed' }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate weekly focus hours
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Today', 'Sat', 'Sun'];
  const dailyFocusMins = [0, 0, 0, 0, 0, 0, 0]; // Monday to Sunday

  // Aggregate focus session duration in current week
  sessions.forEach(session => {
    const date = new Date(session.created_at);
    let dayIndex = date.getDay() - 1; // 0 = Mon, 6 = Sun
    if (dayIndex === -1) dayIndex = 6; // Sunday fix
    
    // Check if within past 7 days
    const diffTime = Math.abs(new Date().getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7 && dayIndex >= 0 && dayIndex < 7) {
      dailyFocusMins[dayIndex] += Math.round(session.duration / 60);
    }
  });

  const totalFocusHours = Math.round(dailyFocusMins.reduce((a, b) => a + b, 0) / 60 * 10) / 10;

  // Format deadlines text
  const getDeadlineRelativeText = (dateStr: string | null) => {
    if (!dateStr) return '';
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `In ${days} Days`;
    return 'Next Week';
  };

  return (
    <div className="flex-1 bg-bg-dark flex flex-col pb-12">
      <Header title="Dashboard" subtitle="Welcome to your learning control center." />

      {/* Main Grid Content */}
      <div className="px-6 md:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome & Streak Banner */}
        <div className="lg:col-span-3 bg-card-dark border border-border-dark rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="font-outfit font-bold text-2xl md:text-3xl text-text-primary tracking-tight">
              Good Morning, {profile?.name ? profile.name.split(' ')[0] : 'User'}
            </h2>
            <p className="text-text-secondary text-sm md:text-base mt-1">
              Your mind is sharp. Ready for another breakthrough deep work session?
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 self-start md:self-auto">
            <div className="flex items-center gap-2 bg-primary/15 border border-primary/20 text-primary px-4 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-primary-glow">
              <Flame size={18} className="fill-current text-primary" />
              <span>{profile?.streak || 7} Day Streak!</span>
            </div>
            <span className="text-text-secondary text-xs font-semibold">Keep the momentum going.</span>
          </div>
        </div>

        {/* Column 1: Today's Focus (Mini Pomodoro) */}
        <div className="bg-card-dark border border-border-dark rounded-3xl p-6 flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between mb-4 border-b border-border-dark pb-3">
            <h3 className="font-outfit font-semibold text-text-primary text-base">Today&apos;s Focus</h3>
            <Clock size={16} className="text-text-muted" />
          </div>

          {/* Circle Timer display */}
          <div className="relative w-44 h-44 flex items-center justify-center my-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="78"
                className="stroke-border-dark"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r="78"
                className="stroke-primary transition-all duration-300"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 78}
                strokeDashoffset={2 * Math.PI * 78 * (1 - timeLeft / (25 * 60))}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-outfit font-bold text-4xl text-text-primary tracking-tight">{formatTime(timeLeft)}</span>
              <span className="text-[10px] text-text-secondary font-bold tracking-widest uppercase mt-1">
                {timerType === 'Deep Work' ? 'Focusing' : 'Break'}
              </span>
            </div>
          </div>

          <p className="text-xs text-text-secondary font-medium mb-6">
            Session: {timerType === 'Deep Work' ? 'Deep Work Practice' : 'Resting'}
          </p>

          <button
            onClick={() => setTimerStatus(timerStatus === 'running' ? 'paused' : 'running')}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-primary-glow cursor-pointer"
          >
            {timerStatus === 'running' ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
            <span>{timerStatus === 'running' ? 'Pause Session' : 'Start Session'}</span>
          </button>
        </div>

        {/* Column 2: Priority Tasks */}
        <div className="bg-card-dark border border-border-dark rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-border-dark pb-3">
              <h3 className="font-outfit font-semibold text-text-primary text-base">Priority Tasks</h3>
              <button 
                onClick={() => router.push('/tasks')} 
                className="text-text-muted hover:text-primary transition text-xs font-semibold flex items-center gap-0.5"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {priorityTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <CheckCircle2 size={36} className="text-emerald-500/80" />
                <p className="text-sm font-medium text-text-primary">All caught up!</p>
                <p className="text-xs text-text-muted">Create a new task to get started.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {priorityTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="p-4 bg-bg-dark border border-border-dark hover:border-text-muted rounded-2xl flex items-center justify-between gap-3 group transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button 
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className="w-5 h-5 rounded-lg border border-border-dark hover:border-primary flex items-center justify-center transition cursor-pointer text-transparent hover:text-primary/50 shrink-0"
                      >
                        <CheckCircle2 size={12} className="fill-current text-white" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{task.name}</p>
                        {task.priority && (
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 uppercase ${
                            task.priority === 'High' 
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                              : task.priority === 'Medium'
                                ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                : 'bg-slate-500/10 text-text-secondary border border-slate-500/20'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/tasks')}
            className="w-full py-3 mt-6 border border-border-dark hover:border-text-secondary text-text-primary rounded-2xl text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer bg-card-dark"
          >
            <Plus size={16} />
            <span>Manage Tasks</span>
          </button>
        </div>

        {/* Column 3: Upcoming Deadlines */}
        <div className="bg-card-dark border border-border-dark rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-border-dark pb-3">
              <h3 className="font-outfit font-semibold text-text-primary text-base">Deadlines</h3>
              <Calendar size={16} className="text-text-muted" />
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <AlertCircle size={36} className="text-text-muted" />
                <p className="text-sm font-medium text-text-primary">No deadlines scheduled</p>
                <p className="text-xs text-text-muted">Enjoy your study sessions!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {upcomingDeadlines.map(assignment => (
                  <div key={assignment.id} className="flex gap-3 items-start relative group">
                    {/* Color indicator stem */}
                    <div className={`w-1 self-stretch rounded-full ${
                      assignment.priority === 'High' 
                        ? 'bg-red-500' 
                        : assignment.priority === 'Medium'
                          ? 'bg-blue-500'
                          : 'bg-slate-500'
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-primary tracking-wider uppercase">
                        {getDeadlineRelativeText(assignment.deadline)}
                      </span>
                      <h4 className="font-outfit font-semibold text-sm text-text-primary truncate mt-0.5">{assignment.name}</h4>
                      <p className="text-xs text-text-muted mt-0.5">{assignment.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/assignments')}
            className="w-full py-3 mt-6 border border-border-dark hover:border-text-secondary text-text-primary rounded-2xl text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer bg-card-dark"
          >
            <span>View All Deadlines</span>
          </button>
        </div>

        {/* Weekly Study Progress (Dynamic Chart) */}
        <div className="lg:col-span-2 bg-card-dark border border-border-dark rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-outfit font-semibold text-text-primary text-base">Weekly Progress</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-text-secondary">Focus Time</span>
            </div>
          </div>
          
          <p className="text-xs text-text-muted mb-6">
            You&apos;ve studied <span className="text-text-primary font-bold">{totalFocusHours} hours</span> this week.
          </p>

          {/* Simple Custom Bar Chart */}
          <div className="flex items-end justify-between h-44 px-2 pt-6 border-b border-border-dark relative">
            {dailyFocusMins.map((minutes, idx) => {
              const heightPct = Math.min(Math.max((minutes / 180) * 100, 4), 100); // Max 3 hours base
              return (
                <div key={idx} className="flex flex-col items-center flex-1 gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition bg-bg-dark border border-border-dark px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-text-primary z-10 pointer-events-none shadow-xl border-glow">
                    {minutes}m
                  </div>
                  
                  {/* Bar */}
                  <div 
                    style={{ height: `${heightPct}%` }}
                    className="w-8 sm:w-10 bg-primary/20 group-hover:bg-primary border border-primary/20 group-hover:border-primary/50 rounded-t-lg transition-all duration-300 ease-out cursor-pointer relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-t-lg" />
                  </div>
                  
                  <span className="text-[10px] font-bold text-text-secondary uppercase">{daysOfWeek[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-card-dark border border-border-dark rounded-3xl p-6 flex flex-col gap-3 justify-center">
          <h3 className="font-outfit font-semibold text-text-primary text-base mb-2 border-b border-border-dark pb-3">Quick Actions</h3>

          <button
            onClick={() => router.push('/notes?new=true')}
            className="flex items-center justify-between p-4 bg-bg-dark hover:bg-border-dark border border-border-dark rounded-2xl text-left group transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                <FileEdit size={18} />
              </div>
              <div>
                <h4 className="font-outfit font-semibold text-sm text-text-primary">New Note</h4>
                <p className="text-[10px] text-text-muted mt-0.5">Capture a sudden insight</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-text-muted group-hover:text-primary transition" />
          </button>

          <button
            onClick={() => router.push('/focus')}
            className="flex items-center justify-between p-4 bg-bg-dark hover:bg-border-dark border border-border-dark rounded-2xl text-left group transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                <Timer size={18} />
              </div>
              <div>
                <h4 className="font-outfit font-semibold text-sm text-text-primary">Focus Session</h4>
                <p className="text-[10px] text-text-muted mt-0.5">Enter the flow state now</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-text-muted group-hover:text-primary transition" />
          </button>
        </div>

      </div>
    </div>
  );
}
