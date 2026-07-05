'use client';

import React, { useState } from 'react';
import { Search, Plus, Timer, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTasks, useCourses } from '@/hooks/useData';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
}

export default function Header({ title, subtitle, showSearch = true }: HeaderProps) {
  const router = useRouter();
  const { createTask } = useTasks();
  const { courses } = useCourses();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New task form state
  const [taskName, setTaskName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = useState('');

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    try {
      await createTask({
        name: taskName,
        course_id: courseId || null,
        status: 'To Do',
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : null
      });
      setTaskName('');
      setCourseId('');
      setPriority('Medium');
      setDueDate('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 md:px-8 py-6 border-b border-border-dark bg-bg-dark/50 backdrop-blur sticky top-0 z-20">
      <div>
        {title && <h1 className="font-outfit font-bold text-2xl md:text-3xl text-text-primary tracking-tight">{title}</h1>}
        {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
      </div>

      <div className="flex flex-1 md:justify-end items-center gap-3">
        {/* Search */}
        {showSearch && (
          <div className="relative w-full md:max-w-xs group">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition" />
            <input
              type="text"
              placeholder="Search tasks, notes, or courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card-dark border border-border-dark rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition"
            />
          </div>
        )}

        {/* Action Buttons */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-dark bg-card-dark text-text-primary text-sm font-semibold hover:border-text-secondary transition cursor-pointer"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Task</span>
        </button>

        <button
          onClick={() => router.push('/focus')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-primary-glow cursor-pointer"
        >
          <Timer size={16} />
          <span>Start Focus</span>
        </button>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <h3 className="font-outfit font-bold text-xl text-text-primary mb-4">Create New Task</h3>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Task Name</label>
                <input
                  type="text"
                  required
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Review lecture slide notes"
                  className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Associated Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full bg-bg-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                >
                  <option value="">No Course association</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-border-dark hover:bg-bg-dark text-text-secondary text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-primary-glow"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
