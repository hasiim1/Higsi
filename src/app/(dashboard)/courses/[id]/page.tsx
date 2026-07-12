'use client';

import React, { use, useState, useEffect } from 'react';
import Header from '@/components/Header';
import { 
  useCourses, 
  useCourseContent, 
  useNotes, 
  useTasks, 
  useAssignments 
} from '@/hooks/useData';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  GraduationCap, 
  ChevronRight, 
  CheckSquare, 
  Play, 
  CheckCircle,
  FileText,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CourseDetailsProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailsPage({ params }: CourseDetailsProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const { courses, updateCourse, deleteCourse } = useCourses();
  const { modules, lessons, updateLessonStatus } = useCourseContent(id);
  const { notes } = useNotes();
  const { tasks } = useTasks();
  const { assignments } = useAssignments();

  const course = courses.find(c => c.id === id);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editLecturer, setEditLecturer] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCredits, setEditCredits] = useState(3);
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editFeeStatus, setEditFeeStatus] = useState('');

  useEffect(() => {
    if (course) {
      setEditName(course.name);
      setEditCode(course.code || '');
      setEditLecturer(course.lecturer || '');
      setEditLocation(course.location || '');
      setEditEmail(course.email || '');
      setEditCredits(course.credits || 3);
      setEditCoverUrl(course.cover_url || '');
      setEditFeeStatus(course.fee_status || '🟢 Bixiyay');
    }
  }, [course, showEditModal]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateCourse({
        id,
        updates: {
          name: editName,
          code: editCode,
          lecturer: editLecturer,
          location: editLocation,
          email: editEmail,
          credits: Number(editCredits),
          cover_url: editCoverUrl,
          fee_status: editFeeStatus,
        }
      });
      setShowEditModal(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to update course.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteCourse(id);
      setShowDeleteDialog(false);
      router.push('/courses');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete course.');
      setIsDeleting(false);
    }
  };

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-dark text-text-primary">
        <div className="flex flex-col items-center gap-3 text-center p-6">
          <AlertCircle size={40} className="text-red-500" />
          <h3 className="font-outfit font-bold text-xl">Course Not Found</h3>
          <p className="text-sm text-text-secondary">The requested course could not be located in your database.</p>
          <button 
            onClick={() => router.push('/courses')}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const courseNotes = notes.filter(n => n.course_id === id);
  const courseTasks = tasks.filter(t => t.course_id === id);
  const courseAssignments = assignments.filter(a => a.course_id === id);

  const handleToggleLesson = async (lessonId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
      await updateLessonStatus({ id: lessonId, status: nextStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle size={16} className="text-emerald-500 fill-emerald-500/10" />;
    if (status === 'in_progress') return <Play size={14} className="text-amber-500 fill-amber-500/10" />;
    return <div className="w-4 h-4 rounded-full border border-border-dark" />;
  };

  return (
    <div className="flex-1 bg-bg-dark flex flex-col pb-12">
      <header className="px-6 md:px-8 py-5 border-b border-border-dark flex items-center justify-between">
        <button 
          onClick={() => router.push('/courses')}
          className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm font-semibold transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Courses</span>
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1 text-xs font-bold bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white text-primary px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            <Edit size={12} />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-1 text-xs font-bold bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">Delete</span>
          </button>
          <span className="text-xs font-bold text-text-muted bg-card-dark px-3 py-1.5 rounded-xl border border-border-dark">
            {course.code}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="px-6 md:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Modules, Lessons & Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Banner */}
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6 relative overflow-hidden flex flex-col justify-end min-h-[160px]">
            <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: `url(${course.cover_url})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-card-dark to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="font-outfit font-extrabold text-2xl md:text-3xl text-text-primary tracking-tight">
                {course.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary mt-3">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>Prof. {course.lecturer}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{course.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap size={14} />
                  <span>{course.credits} Credits</span>
                </div>
              </div>
            </div>
          </div>

          {/* Syllabus / Modules */}
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6">
            <h3 className="font-outfit font-bold text-lg text-text-primary mb-4 border-b border-border-dark pb-3">Course Modules & Lessons</h3>
            
            {modules.length === 0 ? (
              <div className="text-center py-10 text-text-secondary text-sm">
                No syllabus modules configured for this course yet.
              </div>
            ) : (
              <div className="space-y-6">
                {modules.map((mod, idx) => {
                  const modLessons = lessons.filter(l => l.module_id === mod.id);
                  return (
                    <div key={mod.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-outfit font-extrabold text-primary text-sm">0{idx + 1}</span>
                        <h4 className="font-outfit font-bold text-base text-text-primary">{mod.name}</h4>
                      </div>
                      {mod.description && <p className="text-xs text-text-muted pl-6">{mod.description}</p>}
                      
                      <div className="pl-6 space-y-1.5">
                        {modLessons.map(lesson => (
                          <div 
                            key={lesson.id}
                            onClick={() => handleToggleLesson(lesson.id, lesson.status)}
                            className="p-3 bg-bg-dark border border-border-dark hover:border-text-muted rounded-xl flex items-center justify-between gap-3 group transition cursor-pointer"
                          >
                            <span className={`text-sm font-semibold transition ${lesson.status === 'completed' ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                              {lesson.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(lesson.status)}
                            </div>
                          </div>
                        ))}
                        {modLessons.length === 0 && (
                          <p className="text-xs text-text-muted italic">No lessons in this module.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Stats, Notes, and Assignments */}
        <div className="space-y-6">
          
          {/* Study Metrics */}
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6">
            <h3 className="font-outfit font-bold text-base text-text-primary mb-4 border-b border-border-dark pb-3">Study Statistics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-bg-dark border border-border-dark rounded-2xl text-center">
                <span className="font-outfit font-bold text-2xl text-text-primary">{course.progress}%</span>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">Progress</p>
              </div>
              
              <div className="p-4 bg-bg-dark border border-border-dark rounded-2xl text-center">
                <span className="font-outfit font-bold text-2xl text-text-primary">{courseTasks.length}</span>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">Tasks</p>
              </div>

              <div className="p-4 bg-bg-dark border border-border-dark rounded-2xl text-center">
                <span className="font-outfit font-bold text-2xl text-text-primary">{courseNotes.length}</span>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">Notes</p>
              </div>

              <div className="p-4 bg-bg-dark border border-border-dark rounded-2xl text-center">
                <span className="font-outfit font-bold text-2xl text-text-primary">{course.fee_status.includes('🟢') ? 'Paid' : 'Unpaid'}</span>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">Fee Status</p>
              </div>
            </div>
          </div>

          {/* Assignments list */}
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6">
            <h3 className="font-outfit font-bold text-base text-text-primary mb-4 border-b border-border-dark pb-3">Deadlines & Grades</h3>

            {courseAssignments.length === 0 ? (
              <p className="text-xs text-text-secondary py-4 italic text-center">No assignments assigned to this course.</p>
            ) : (
              <div className="space-y-3">
                {courseAssignments.map(ass => (
                  <div key={ass.id} className="p-3.5 bg-bg-dark border border-border-dark rounded-2xl flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-outfit font-semibold text-sm text-text-primary truncate">{ass.name}</h4>
                      <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-wider">{ass.type}</p>
                    </div>
                    
                    {ass.score && (
                      <span className="bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                        {ass.score}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Associated Notes */}
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6">
            <h3 className="font-outfit font-bold text-base text-text-primary mb-4 border-b border-border-dark pb-3">Course Notes</h3>

            {courseNotes.length === 0 ? (
              <p className="text-xs text-text-secondary py-4 italic text-center">No study notes linked to this course.</p>
            ) : (
              <div className="space-y-3">
                {courseNotes.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => router.push(`/notes?note=${note.id}`)}
                    className="p-3 bg-bg-dark border border-border-dark hover:border-text-muted rounded-2xl flex items-center justify-between gap-3 group transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={16} className="text-text-muted group-hover:text-primary transition" />
                      <span className="text-xs font-semibold text-text-primary truncate group-hover:text-text-primary transition">{note.name}</span>
                    </div>
                    <ChevronRight size={14} className="text-text-muted" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <h3 className="font-outfit font-bold text-xl text-text-primary mb-4">Edit Course</h3>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-xs mb-3 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Advanced Linear Algebra"
                  className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    placeholder="MATH201"
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Credits</label>
                  <input
                    type="number"
                    required
                    value={editCredits}
                    onChange={(e) => setEditCredits(Number(e.target.value))}
                    placeholder="3"
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Lecturer</label>
                <input
                  type="text"
                  value={editLecturer}
                  onChange={(e) => setEditLecturer(e.target.value)}
                  placeholder="Dr. John Watson"
                  className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Cis Lab 3"
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Fee Status</label>
                  <select
                    value={editFeeStatus}
                    onChange={(e) => setEditFeeStatus(e.target.value)}
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  >
                    <option value="🟢 Bixiyay">🟢 Bixiyay (Paid)</option>
                    <option value="🟡 Qeyb">🟡 Qeyb (Partial)</option>
                    <option value="🔴 Lama Bixin">🔴 Lama Bixin (Unpaid)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={editCoverUrl}
                  onChange={(e) => setEditCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-border-dark hover:bg-bg-dark text-text-secondary text-sm font-semibold transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-primary-glow disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Course Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteDialog(false)} />
          
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <h3 className="font-outfit font-bold text-xl text-text-primary mb-2 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={24} />
              <span>Delete Course</span>
            </h3>
            
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              Are you sure you want to delete <strong className="text-text-primary">{course.name}</strong>? This action is permanent and will delete all associated modules, lessons, tasks, assignments, and notes.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-xs mb-3 font-semibold">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 rounded-xl border border-border-dark hover:bg-bg-dark text-text-secondary text-sm font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition shadow-lg disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanent'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
