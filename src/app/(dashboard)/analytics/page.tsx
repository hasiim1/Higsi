'use client';

import React from 'react';
import Header from '@/components/Header';
import { 
  useAuth, 
  useProfile, 
  useCourses, 
  useTasks, 
  useAssignments, 
  useFocusSessions 
} from '@/hooks/useData';
import { 
  BarChart2, 
  Clock, 
  CheckSquare, 
  Award, 
  Flame, 
  TrendingUp, 
  Target, 
  BookOpen 
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { courses } = useCourses();
  const { tasks } = useTasks();
  const { assignments } = useAssignments();
  const { sessions } = useFocusSessions();

  // 1. Calculate Focus Metrics
  const totalFocusSecs = sessions.filter(s => s.type === 'Deep Work').reduce((a, b) => a + b.duration, 0);
  const totalStudyHours = Math.round((totalFocusSecs / 3600) * 10) / 10;

  // Weekly focus time (past 7 days)
  const pastWeekSecs = sessions
    .filter(s => {
      const diff = new Date().getTime() - new Date(s.created_at).getTime();
      return s.type === 'Deep Work' && diff <= 7 * 24 * 60 * 60 * 1000;
    })
    .reduce((a, b) => a + b.duration, 0);
  const weeklyFocusHours = Math.round((pastWeekSecs / 3600) * 10) / 10;

  // Monthly focus time (past 30 days)
  const pastMonthSecs = sessions
    .filter(s => {
      const diff = new Date().getTime() - new Date(s.created_at).getTime();
      return s.type === 'Deep Work' && diff <= 30 * 24 * 60 * 60 * 1000;
    })
    .reduce((a, b) => a + b.duration, 0);
  const monthlyFocusHours = Math.round((pastMonthSecs / 3600) * 10) / 10;

  // 2. Tasks Metrics
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 3. Assignments Metrics
  const completedAssignments = assignments.filter(a => a.status === 'Done').length;
  const totalAssignments = assignments.length;
  const assignmentCompletionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
  
  // Average score
  const gradedAssignments = assignments.filter(a => a.score !== null);
  const averageScore = gradedAssignments.length > 0
    ? Math.round(gradedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) / gradedAssignments.length)
    : 0;

  // 4. Course metrics
  const averageCourseProgress = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
    : 0;

  // Analytics cards
  const stats = [
    {
      title: 'Total Study Hours',
      value: `${totalStudyHours}h`,
      subtitle: 'All-time logged focus',
      icon: Clock,
      color: 'text-violet-500 bg-violet-500/10'
    },
    {
      title: 'Weekly Focus Time',
      value: `${weeklyFocusHours}h`,
      subtitle: 'Past 7 days',
      icon: BarChart2,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      title: 'Active Study Streak',
      value: `${profile?.streak || 7} Days`,
      subtitle: 'Daily learning momentum',
      icon: Flame,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      title: 'Average Grade Score',
      value: `${averageScore}%`,
      subtitle: 'Across assignments',
      icon: Award,
      color: 'text-emerald-500 bg-emerald-500/10'
    }
  ];

  return (
    <div className="flex-1 bg-bg-dark flex flex-col pb-12">
      <Header title="Analytics & Trends" subtitle="Evaluate your productivity curve and study statistics." showSearch={false} />

      <div className="px-6 md:px-8 mt-6 space-y-6">
        
        {/* Top 4 Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-card-dark border border-border-dark rounded-3xl p-6 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-text-secondary uppercase">{stat.title}</span>
                  <h3 className="font-outfit font-extrabold text-3xl text-text-primary mt-2">{stat.value}</h3>
                  <p className="text-[11px] text-text-muted mt-1">{stat.subtitle}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Mid Grid: Progress & Completion Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Course Syllabus Progress */}
          <div className="lg:col-span-2 bg-card-dark border border-border-dark rounded-3xl p-6">
            <h3 className="font-outfit font-bold text-base text-text-primary mb-5 border-b border-border-dark pb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <span>Active Course Progress</span>
            </h3>

            {courses.length === 0 ? (
              <p className="text-sm text-text-secondary italic text-center py-10">No active courses configured.</p>
            ) : (
              <div className="space-y-4">
                {courses.map(course => (
                  <div key={course.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-text-secondary">
                      <span>{course.name} ({course.code})</span>
                      <span className="font-bold text-text-primary">{course.progress}%</span>
                    </div>
                    
                    <div className="w-full h-2 bg-bg-dark rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          course.name.toLowerCase().includes('math')
                            ? 'bg-violet-500'
                            : course.name.toLowerCase().includes('design')
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                        }`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goal Completion Rate circular card */}
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6 flex flex-col justify-between items-center text-center">
            <h3 className="font-outfit font-bold text-base text-text-primary mb-3 self-start border-b border-border-dark pb-3 w-full text-left flex items-center gap-2">
              <Target size={18} className="text-primary" />
              <span>Goal Metrics</span>
            </h3>

            {/* Tasks completion circular indicators */}
            <div className="space-y-6 w-full py-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h4 className="font-outfit font-semibold text-sm text-text-primary">Tasks Completed</h4>
                  <p className="text-[10px] text-text-muted mt-0.5">{completedTasks} of {totalTasks} items finished</p>
                </div>
                <div className="text-right">
                  <span className="font-outfit font-extrabold text-xl text-primary">{taskCompletionRate}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h4 className="font-outfit font-semibold text-sm text-text-primary">Exam/Assignment Clear</h4>
                  <p className="text-[10px] text-text-muted mt-0.5">{completedAssignments} of {totalAssignments} submissions done</p>
                </div>
                <div className="text-right">
                  <span className="font-outfit font-extrabold text-xl text-primary">{assignmentCompletionRate}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h4 className="font-outfit font-semibold text-sm text-text-primary">Academic Syllabus Fill</h4>
                  <p className="text-[10px] text-text-muted mt-0.5">Average across courses</p>
                </div>
                <div className="text-right">
                  <span className="font-outfit font-extrabold text-xl text-primary">{averageCourseProgress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productivity Trends Card (Focus Hours Details) */}
        <div className="bg-card-dark border border-border-dark rounded-3xl p-6">
          <h3 className="font-outfit font-bold text-base text-text-primary mb-4 border-b border-border-dark pb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <span>Productivity Trends</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4.5 bg-bg-dark border border-border-dark rounded-2xl">
              <span className="text-[10px] font-bold text-text-secondary uppercase">Weekly Avg Focus Time</span>
              <h4 className="font-outfit font-extrabold text-2xl text-text-primary mt-2">
                {Math.round(weeklyFocusHours / 7 * 10) / 10}h <span className="text-xs font-semibold text-text-secondary">/ day</span>
              </h4>
            </div>

            <div className="p-4.5 bg-bg-dark border border-border-dark rounded-2xl">
              <span className="text-[10px] font-bold text-text-secondary uppercase">Monthly Avg Focus Time</span>
              <h4 className="font-outfit font-extrabold text-2xl text-text-primary mt-2">
                {Math.round(monthlyFocusHours / 30 * 10) / 10}h <span className="text-xs font-semibold text-text-secondary">/ day</span>
              </h4>
            </div>

            <div className="p-4.5 bg-bg-dark border border-border-dark rounded-2xl">
              <span className="text-[10px] font-bold text-text-secondary uppercase">Focus Session Count</span>
              <h4 className="font-outfit font-extrabold text-2xl text-text-primary mt-2">
                {sessions.filter(s => s.type === 'Deep Work').length} <span className="text-xs font-semibold text-text-secondary">sessions total</span>
              </h4>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
