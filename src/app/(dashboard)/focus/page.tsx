'use client';

import React, { useEffect } from 'react';
import Header from '@/components/Header';
import { useUIStore } from '@/lib/store';
import { useCourses, useFocusSessions } from '@/hooks/useData';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Square,
  BookOpen,
  Coffee,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function FocusSessionPage() {
  const { courses } = useCourses();
  const { sessions, createFocusSession } = useFocusSessions();

  // Zustand Timer States
  const {
    timerStatus,
    timeLeft,
    timerDuration,
    timerType,
    activeCourseId,
    setTimerStatus,
    setTimeLeft,
    setTimerDuration,
    setTimerType,
    setActiveCourseId,
    resetTimer,
    tick
  } = useUIStore();

  // Timer Tick Side-Effect
  useEffect(() => {
    let interval: any = null;
    if (timerStatus === 'running') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerStatus, tick]);

  // Timer Completion Side-Effect
  useEffect(() => {
    if (timeLeft === 0 && timerStatus === 'running') {
      handleSessionCompletion();
    }
  }, [timeLeft, timerStatus]);

  const handleSessionCompletion = async () => {
    try {
      setTimerStatus('idle');
      
      // Save focus session to DB
      await createFocusSession({
        course_id: activeCourseId,
        duration: timerDuration,
        type: timerType
      });

      // Reset timer duration
      setTimeLeft(timerDuration);
      alert(`Well done! You completed a ${Math.round(timerDuration / 60)} minute ${timerType} session.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndSession = async () => {
    if (timerStatus === 'idle') return;

    if (confirm('End session early? Only elapsed time will be logged.')) {
      const elapsed = timerDuration - timeLeft;
      setTimerStatus('idle');
      
      try {
        if (elapsed > 10) { // Log if more than 10 seconds elapsed
          await createFocusSession({
            course_id: activeCourseId,
            duration: elapsed,
            type: timerType
          });
        }
      } catch (err) {
        console.error(err);
      }
      
      resetTimer();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCourseName = (cId: string | null) => {
    if (!cId) return 'Break Period';
    return courses.find(c => c.id === cId)?.name || 'Study Course';
  };

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const time = date.toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'});

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${time}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${time}`;
    }
    return `${date.toLocaleDateString()}, ${time}`;
  };

  const getSessionTag = (type: string) => {
    if (type === 'Break') return { text: 'REST', style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    return { text: 'FLOW', style: 'bg-violet-500/10 text-primary border-primary/20' };
  };

  // SVG dash offset calculation
  const strokeDash = 2 * Math.PI * 110;
  const dashOffset = strokeDash * (1 - timeLeft / timerDuration);

  return (
    <div className="flex-1 bg-bg-dark flex flex-col pb-12">
      <Header title="Focus Session" subtitle="Block out distractions. Recreate deep learning rituals." showSearch={false} />

      <div className="px-6 md:px-8 mt-6 flex flex-col items-center max-w-2xl mx-auto w-full space-y-8">
        
        {/* Course Selector & Session Toggle Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <div className="relative flex items-center bg-card-dark border border-border-dark px-4 py-2.5 rounded-2xl text-sm w-full sm:w-auto">
            <BookOpen size={16} className="text-text-muted mr-2" />
            <select
              value={activeCourseId || ''}
              onChange={(e) => setActiveCourseId(e.target.value || null)}
              className="bg-transparent text-text-primary text-sm font-semibold focus:outline-none cursor-pointer w-full pr-6"
            >
              <option value="">Select Study Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-card-dark border border-border-dark p-1 rounded-2xl flex items-center gap-1 w-full sm:w-auto">
            <button
              onClick={() => setTimerType('Deep Work')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition ${
                timerType === 'Deep Work' 
                  ? 'bg-primary text-white shadow-lg shadow-primary-glow border-glow' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Deep Work
            </button>
            <button
              onClick={() => setTimerType('Break')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition ${
                timerType === 'Break' 
                  ? 'bg-primary text-white shadow-lg shadow-primary-glow' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Break
            </button>
          </div>
        </div>

        {/* Large Glowing Pomodoro Circle Display */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="144"
              cy="144"
              r="110"
              className="stroke-border-dark/60"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="144"
              cy="144"
              r="110"
              className="stroke-primary transition-all duration-300 timer-glow"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDash}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-outfit font-bold text-5xl md:text-6xl text-text-primary tracking-tight text-glow">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-text-muted font-bold tracking-widest uppercase mt-2">
              {timerStatus === 'running' ? 'Focusing' : timerStatus === 'paused' ? 'Paused' : 'Idle'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-8 justify-center">
          {/* Reset */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={resetTimer}
              className="w-10 h-10 rounded-full border border-border-dark bg-card-dark/40 hover:bg-card-dark hover:border-text-secondary flex items-center justify-center text-text-secondary hover:text-text-primary transition cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>
            <span className="text-[10px] text-text-muted font-bold uppercase">Reset</span>
          </div>

          {/* Play/Pause Main button */}
          <button
            onClick={() => setTimerStatus(timerStatus === 'running' ? 'paused' : 'running')}
            className="w-16 h-16 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-2xl shadow-primary-glow border-glow transform hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            {timerStatus === 'running' ? <Pause size={24} /> : <Play size={24} className="fill-current ml-1" />}
          </button>

          {/* End */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={handleEndSession}
              disabled={timerStatus === 'idle'}
              className="w-10 h-10 rounded-full border border-border-dark bg-card-dark/40 hover:bg-card-dark hover:border-text-secondary disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-text-secondary hover:text-text-primary transition cursor-pointer"
            >
              <Square size={16} />
            </button>
            <span className="text-[10px] text-text-muted font-bold uppercase">End</span>
          </div>
        </div>

        {/* Recent Sessions list */}
        <div className="w-full bg-card-dark border border-border-dark rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 border-b border-border-dark pb-3">
            <h3 className="font-outfit font-bold text-base text-text-primary">Recent Sessions</h3>
            <span className="text-xs font-semibold text-text-muted">View All</span>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {sessions.slice(0, 4).map(session => {
              const tag = getSessionTag(session.type);
              return (
                <div 
                  key={session.id} 
                  className="p-3.5 bg-bg-dark border border-border-dark rounded-2xl flex items-center justify-between gap-3 hover:border-border-dark/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-card-dark border border-border-dark text-text-secondary`}>
                      {session.type === 'Break' ? <Coffee size={16} /> : <CheckCircle size={16} className="text-primary" />}
                    </div>
                    <div>
                      <h4 className="font-outfit font-semibold text-sm text-text-primary">{getCourseName(session.course_id)}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">{formatTimestamp(session.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-text-primary">{formatSessionTime(session.duration)}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${tag.style}`}>
                      {tag.text}
                    </span>
                  </div>
                </div>
              );
            })}

            {sessions.length === 0 && (
              <div className="text-center py-10 text-text-secondary text-xs italic">
                No focus sessions completed yet. Take action to start study sprints.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
