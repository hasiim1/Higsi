'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { useTasks, useCourses } from '@/hooks/useData';
import { Task } from '@/lib/seedData';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Search,
  Filter,
  CheckCircle,
  MoreVertical,
  AlertCircle
} from 'lucide-react';

type Columns = 'To Do' | 'In Progress' | 'Completed';
const COLUMN_KEYS: Columns[] = ['To Do', 'In Progress', 'Completed'];

export default function TasksPage() {
  const { tasks, createTask, updateTask, deleteTask } = useTasks();
  const { courses } = useCourses();
  
  const [filterCourseId, setFilterCourseId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New task form state
  const [taskName, setTaskName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = useState('');

  // Native HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Columns) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    try {
      await updateTask({ id, updates: { status: targetStatus } });
    } catch (err) {
      console.error(err);
    }
  };

  // Move task via button click (fallback/accessibility)
  const handleMoveStatus = async (id: string, currentStatus: Columns) => {
    const statusCycle: Record<Columns, Columns> = {
      'To Do': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'To Do'
    };
    try {
      await updateTask({ id, updates: { status: statusCycle[currentStatus] } });
    } catch (err) {
      console.error(err);
    }
  };

  // Submit new task
  const handleCreate = async (e: React.FormEvent) => {
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
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter and Search logic
  const filteredTasks = tasks.filter(task => {
    const matchesCourse = !filterCourseId || task.course_id === filterCourseId;
    const matchesSearch = !searchQuery || task.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const getCourseName = (courseId: string | null) => {
    if (!courseId) return null;
    return courses.find(c => c.id === courseId)?.name || null;
  };

  return (
    <div className="flex-1 bg-bg-dark flex flex-col pb-12">
      <Header title="Tasks Board" subtitle="Structure your study sprint. Drag and drop to log your workflow." showSearch={false} />

      {/* Control bar */}
      <div className="px-6 md:px-8 mt-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-card-dark border border-border-dark rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary transition"
            />
          </div>

          <div className="relative flex items-center gap-2 bg-card-dark border border-border-dark px-3 py-2 rounded-xl text-sm">
            <Filter size={14} className="text-text-muted" />
            <select
              value={filterCourseId}
              onChange={(e) => setFilterCourseId(e.target.value)}
              className="bg-transparent text-text-primary text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold transition shadow-lg shadow-primary-glow cursor-pointer"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="px-6 md:px-8 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {COLUMN_KEYS.map(column => {
          const colTasks = filteredTasks.filter(t => t.status === column);
          return (
            <div
              key={column}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column)}
              className="bg-card-dark/30 border border-border-dark/60 rounded-3xl p-5 flex flex-col h-full min-h-[300px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-border-dark pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    column === 'To Do' 
                      ? 'bg-rose-500' 
                      : column === 'In Progress' 
                        ? 'bg-blue-500' 
                        : 'bg-emerald-500'
                  }`} />
                  <h3 className="font-outfit font-bold text-sm text-text-primary tracking-wide uppercase">{column}</h3>
                </div>
                <span className="text-xs font-bold bg-card-dark text-text-secondary px-2.5 py-0.5 rounded-full border border-border-dark">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => handleMoveStatus(task.id, column)}
                    className="p-4 bg-card-dark border border-border-dark hover:border-text-muted rounded-2xl cursor-grab active:cursor-grabbing transition relative group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-outfit font-bold text-sm text-text-primary tracking-tight leading-snug line-clamp-2">
                        {task.name}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(task.id);
                        }}
                        className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Course tag */}
                    {task.course_id && (
                      <span className="inline-block bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full mt-2.5 uppercase tracking-wide">
                        {getCourseName(task.course_id)}
                      </span>
                    )}

                    {/* Footer stats */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-border-dark/60 text-[10px] font-bold text-text-secondary">
                      <span className={`px-2 py-0.5 rounded-full ${
                        task.priority === 'High' 
                          ? 'bg-red-500/10 text-red-500' 
                          : task.priority === 'Medium'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-slate-500/10 text-text-secondary'
                      }`}>
                        {task.priority}
                      </span>
                      
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar size={10} />
                          <span>{new Date(task.due_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted text-xs border border-dashed border-border-dark/40 rounded-2xl h-36">
                    <p className="font-medium">Empty column</p>
                    <p className="text-[10px] mt-1">Drag a task here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <h3 className="font-outfit font-bold text-xl text-text-primary mb-4">Create New Task</h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
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
    </div>
  );
}
