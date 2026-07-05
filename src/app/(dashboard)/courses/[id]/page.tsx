'use client';

import React, { use } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CourseDetailsProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailsPage({ params }: CourseDetailsProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const { courses, updateCourse } = useCourses();
  const { modules, lessons, updateLessonStatus } = useCourseContent(id);
  const { notes } = useNotes();
  const { tasks } = useTasks();
  const { assignments } = useAssignments();

  const course = courses.find(c => c.id === id);

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
        
        <span className="text-xs font-bold text-text-muted bg-card-dark px-3 py-1 rounded-full border border-border-dark">
          {course.code}
        </span>
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
    </div>
  );
}
