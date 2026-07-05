'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { useCourses, useTasks, useNotes } from '@/hooks/useData';
import { 
  Plus, 
  BookOpen, 
  Settings, 
  ArrowRight,
  TrendingUp,
  MapPin,
  User,
  GraduationCap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
  const router = useRouter();
  const { courses, createCourse } = useCourses();
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New course form state
  const [courseName, setCourseName] = useState('');
  const [code, setCode] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [credits, setCredits] = useState(3);
  const [coverUrl, setCoverUrl] = useState('');
  const [feeStatus, setFeeStatus] = useState('🟢 Bixiyay');

  const activeCourses = courses.filter(c => !c.archived);
  const archivedCourses = courses.filter(c => c.archived);

  // Fallback archived courses if none exist (matches mockup history)
  const defaultArchived = [
    { name: 'Intro to Macroeconomics', grade: 'A', semester: 'Fall 2023' },
    { name: 'Linguistics foundations', grade: 'A-', semester: 'Fall 2023' },
    { name: 'Molecular Biology', grade: 'B+', semester: 'Spring 2023' },
    { name: 'World History 101', grade: 'A', semester: 'Spring 2023' }
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    try {
      const defaultCovers = [
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60'
      ];
      
      await createCourse({
        name: courseName,
        code: code || 'CS100',
        lecturer: lecturer || 'Dr. Professor',
        location: location || 'Online',
        email: email || 'prof@university.edu',
        credits: Number(credits),
        cover_url: coverUrl || defaultCovers[Math.floor(Math.random() * defaultCovers.length)],
        schedule: ['Tue 2:00-4:00'],
        fee_status: feeStatus
      });

      // Reset
      setCourseName('');
      setCode('');
      setLecturer('');
      setLocation('');
      setEmail('');
      setCredits(3);
      setCoverUrl('');
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getCourseTasksCount = (courseId: string) => {
    return tasks.filter(t => t.course_id === courseId).length;
  };

  const getCourseNotesCount = (courseId: string) => {
    return notes.filter(n => n.course_id === courseId).length;
  };

  const getSubjectColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('math') || n.includes('calc')) return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
    if (n.includes('design') || n.includes('psych')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (n.includes('sci') || n.includes('coding') || n.includes('program')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  return (
    <div className="flex-1 bg-bg-dark flex flex-col pb-12">
      <Header title="My Courses" subtitle="Organize your academic journey. Manage active learning modules and review past achievements." />

      <div className="px-6 md:px-8 mt-6">
        
        {/* Semester Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="font-outfit font-bold text-xl text-text-primary">Current Semester</h2>
            <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Spring 2026
            </span>
          </div>
        </div>

        {/* Courses grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Create New Course Dotted Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="border-2 border-dashed border-border-dark hover:border-primary/50 bg-card-dark/20 rounded-3xl p-6 h-64 flex flex-col items-center justify-center gap-3 group transition cursor-pointer text-center"
          >
            <div className="w-12 h-12 rounded-full border border-border-dark group-hover:border-primary flex items-center justify-center text-text-secondary group-hover:text-primary transition">
              <Plus size={24} />
            </div>
            <span className="font-outfit font-semibold text-text-secondary group-hover:text-text-primary transition">Create New Course</span>
          </button>

          {/* Active Courses */}
          {activeCourses.map(course => {
            const taskCount = getCourseTasksCount(course.id);
            const noteCount = getCourseNotesCount(course.id);
            return (
              <div
                key={course.id}
                onClick={() => router.push(`/courses/${course.id}`)}
                className="bg-card-dark border border-border-dark hover:border-text-muted rounded-3xl p-6 h-64 flex flex-col justify-between cursor-pointer group transition relative overflow-hidden"
              >
                {/* Subject banner background decoration */}
                <div 
                  className="absolute inset-x-0 top-0 h-1.5 opacity-80"
                  style={{
                    backgroundColor: course.name.toLowerCase().includes('math') 
                      ? '#8b5cf6' 
                      : course.name.toLowerCase().includes('design')
                        ? '#10b981'
                        : '#f59e0b'
                  }}
                />

                <div className="flex items-start justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${getSubjectColor(course.name)}`}>
                    {course.code || 'CODE'}
                  </span>
                  <BookOpen size={16} className="text-text-muted group-hover:text-text-primary transition" />
                </div>

                <div>
                  <h3 className="font-outfit font-bold text-lg text-text-primary mt-3 group-hover:text-primary transition line-clamp-1">
                    {course.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 truncate">Prof. {course.lecturer}</p>
                </div>

                <div>
                  {/* Progress */}
                  <div className="flex justify-between items-center text-xs font-semibold text-text-secondary mb-1.5">
                    <span>Course Progress</span>
                    <span className="font-bold text-text-primary">{course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg-dark rounded-full overflow-hidden">
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

                <div className="flex items-center gap-4 text-xs font-semibold text-text-secondary border-t border-border-dark pt-3">
                  <div className="flex items-center gap-1">
                    <span>{taskCount} tasks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{noteCount} notes</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Archived Courses section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6 border-b border-border-dark pb-3">
            <h3 className="font-outfit font-bold text-lg text-text-primary">Archived Courses</h3>
            <span className="text-xs font-semibold text-text-muted">View All History</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(archivedCourses.length > 0 ? archivedCourses : defaultArchived).map((course, idx) => (
              <div 
                key={idx}
                className="bg-card-dark/40 border border-border-dark/60 rounded-2xl p-4 flex items-center justify-between hover:bg-card-dark transition"
              >
                <div>
                  <h4 className="font-outfit font-semibold text-sm text-text-primary truncate max-w-[150px]">{course.name}</h4>
                  <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase mt-1 block">
                    {'semester' in course ? course.semester : 'Spring 2024'}
                  </span>
                </div>
                
                <div className="bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">
                  GRADE: {'grade' in course ? course.grade : 'A'}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <h3 className="font-outfit font-bold text-xl text-text-primary mb-4">Create New Course</h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
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
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="MATH201"
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Credits</label>
                  <input
                    type="number"
                    required
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    placeholder="3"
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Lecturer</label>
                <input
                  type="text"
                  value={lecturer}
                  onChange={(e) => setLecturer(e.target.value)}
                  placeholder="Dr. John Watson"
                  className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Cis Lab 3"
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Fee Status</label>
                  <select
                    value={feeStatus}
                    onChange={(e) => setFeeStatus(e.target.value)}
                    className="w-full bg-bg-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                  >
                    <option value="🟢 Bixiyay">🟢 Bixiyay (Paid)</option>
                    <option value="🟡 Qeyb">🟡 Qeyb (Partial)</option>
                    <option value="🔴 Lama Bixin">🔴 Lama Bixin (Unpaid)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-border-dark hover:bg-bg-dark text-text-secondary text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-primary-glow"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
