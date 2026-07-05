'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { useAssignments, useCourses } from '@/hooks/useData';
import { Assignment } from '@/lib/seedData';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  PlusCircle, 
  AlertCircle,
  TrendingUp,
  Award,
  CircleDot
} from 'lucide-react';

export default function AssignmentsPage() {
  const { assignments, createAssignment, updateAssignment, deleteAssignment } = useAssignments();
  const { courses } = useCourses();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCourseId, setFilterCourseId] = useState('');
  
  // New assignment form state
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [type, setType] = useState('Assignment');
  const [status, setStatus] = useState<'Not started' | 'In progress' | 'Done'>('Not started');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [deadline, setDeadline] = useState('');
  const [score, setScore] = useState('');

  const getCourseName = (cId: string | null) => {
    if (!cId) return 'No Course';
    return courses.find(c => c.id === cId)?.name || 'No Course';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      let grade = null;
      const numScore = score ? Number(score) : null;
      if (numScore !== null) {
        if (numScore >= 90) grade = 'A';
        else if (numScore >= 80) grade = 'B';
        else if (numScore >= 70) grade = 'C';
        else if (numScore >= 60) grade = 'D';
        else grade = 'F';
      }

      await createAssignment({
        name,
        course_id: courseId || null,
        type,
        status,
        priority,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        score: numScore,
        grade
      });

      // Reset
      setName('');
      setCourseId('');
      setType('Assignment');
      setStatus('Not started');
      setPriority('Medium');
      setDeadline('');
      setScore('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const nextStatus: Record<string, 'Not started' | 'In progress' | 'Done'> = {
      'Not started': 'In progress',
      'In progress': 'Done',
      'Done': 'Not started'
    };
    
    try {
      await updateAssignment({
        id,
        updates: { status: nextStatus[currentStatus] }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this assignment record?')) {
      try {
        await deleteAssignment(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredAssignments = assignments.filter(ass => {
    return !filterCourseId || ass.course_id === filterCourseId;
  });

  return (
    <div className="flex-1 bg-bg-dark flex flex-col pb-12">
      <Header title="Assignments & Exams" subtitle="Track your grades and upcoming submissions. Map out deadlines." showSearch={false} />

      {/* Control bar */}
      <div className="px-6 md:px-8 mt-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-2 bg-card-dark border border-border-dark px-3 py-2 rounded-xl text-sm">
            <span className="text-text-muted text-xs font-semibold">Filter Course:</span>
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
          <span>Add Record</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="px-6 md:px-8 mt-6 flex-1">
        <div className="bg-card-dark border border-border-dark rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-dark text-text-muted text-[10px] font-bold uppercase tracking-widest bg-sidebar-dark/20">
                  <th className="px-6 py-4">Assignment Name</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-center">Grade</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark/60 text-sm font-semibold">
                {filteredAssignments.map(ass => (
                  <tr key={ass.id} className="hover:bg-sidebar-dark/10 transition">
                    <td className="px-6 py-4 font-outfit text-text-primary">{ass.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                        {getCourseName(ass.course_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-xs">
                      {ass.deadline ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-text-muted" />
                          <span>{new Date(ass.deadline).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-text-muted">No deadline</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-xs">{ass.type}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ass.priority === 'High' 
                          ? 'bg-red-500/10 text-red-500' 
                          : ass.priority === 'Medium'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-slate-500/10 text-text-secondary'
                      }`}>
                        {ass.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleUpdateStatus(ass.id, ass.status)}
                        className={`text-xs px-2.5 py-1 rounded-xl cursor-pointer transition ${
                          ass.status === 'Done'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : ass.status === 'In progress'
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              : 'bg-slate-500/10 text-text-secondary border border-slate-500/20'
                        }`}
                      >
                        {ass.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center text-text-primary">
                      {ass.score !== null ? `${ass.score}%` : <span className="text-text-muted">-</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {ass.grade ? (
                        <span className="font-outfit font-extrabold text-sm text-primary">{ass.grade}</span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(ass.id)}
                        className="text-text-muted hover:text-red-500 transition p-1 cursor-pointer"
                        title="Delete Assignment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAssignments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
              <Award size={40} className="text-text-muted" />
              <p className="text-sm font-semibold text-text-primary">No assignment records logged.</p>
              <p className="text-xs text-text-muted">Link details for upcoming semesters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <h3 className="font-outfit font-bold text-xl text-text-primary mb-4">Add Assignment / Exam</h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Calculus Quiz 1"
                  className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Link Course</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  >
                    <option value="">No Course Link</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Project">Project</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Final">Final</option>
                    <option value="Presentation">Presentation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  >
                    <option value="Not started">Not started</option>
                    <option value="In progress">In progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="85"
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
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
                  Log Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
