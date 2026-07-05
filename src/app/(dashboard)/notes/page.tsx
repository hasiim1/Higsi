'use client';

import React, { useState, useEffect, use } from 'react';
import Header from '@/components/Header';
import { useNotes, useCourses } from '@/hooks/useData';
import { Note } from '@/lib/seedData';
import { 
  Plus, 
  Trash2, 
  Tag, 
  Search, 
  BookOpen, 
  Eye, 
  Edit,
  Save,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notes, createNote, updateNote, deleteNote } = useNotes();
  const { courses } = useCourses();

  // Search and selected note states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  
  // Editor values
  const [noteName, setNoteName] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [courseId, setCourseId] = useState('');
  const [tagsString, setTagsString] = useState('');
  
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Trigger from URL parameters
  const urlNew = searchParams.get('new') === 'true';
  const urlNoteId = searchParams.get('note');

  useEffect(() => {
    if (urlNoteId) {
      const note = notes.find(n => n.id === urlNoteId);
      if (note) {
        loadNote(note);
      }
    } else if (urlNew) {
      handleNewNote();
    } else if (notes.length > 0 && !selectedNoteId) {
      loadNote(notes[0]);
    }
  }, [urlNoteId, urlNew, notes]);

  const loadNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setNoteName(note.name);
    setNoteContent(note.content || '');
    setCourseId(note.course_id || '');
    setTagsString(note.tags?.join(', ') || '');
    setSaveStatus('idle');
  };

  const handleNewNote = () => {
    setSelectedNoteId(null);
    setNoteName('');
    setNoteContent('');
    setCourseId('');
    setTagsString('');
    setSaveStatus('idle');
    setIsPreview(false);
  };

  const handleSave = async () => {
    if (!noteName.trim()) return;
    setSaveStatus('saving');
    
    const tags = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      if (selectedNoteId) {
        // Update existing note
        await updateNote({
          id: selectedNoteId,
          updates: {
            name: noteName,
            content: noteContent,
            course_id: courseId || null,
            tags
          }
        });
      } else {
        // Create new note
        const newNote = await createNote({
          name: noteName,
          content: noteContent,
          course_id: courseId || null,
          tags
        });
        setSelectedNoteId(newNote.id);
        
        // Remove 'new' flag from URL query
        router.replace('/notes');
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus('idle');
    }
  };

  const handleDelete = async () => {
    if (!selectedNoteId) return;
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(selectedNoteId);
        setSelectedNoteId(null);
        handleNewNote();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getCourseName = (cId: string | null) => {
    if (!cId) return null;
    return courses.find(c => c.id === cId)?.name || null;
  };

  return (
    <div className="flex-1 bg-bg-dark flex flex-col h-screen overflow-hidden">
      <Header title="Study Notes" subtitle="Document your breakthroughs. Live markdown preview and tagging." showSearch={false} />

      {/* Workspace Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Notes list */}
        <aside className="w-80 border-r border-border-dark flex flex-col bg-sidebar-dark/30 overflow-y-auto">
          {/* List Controls */}
          <div className="p-4 border-b border-border-dark flex gap-2">
            <div className="relative flex-1 group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card-dark border border-border-dark rounded-xl pl-8 pr-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary transition"
              />
            </div>
            
            <button
              onClick={handleNewNote}
              className="bg-primary hover:bg-primary-hover p-2 rounded-xl text-white transition cursor-pointer shadow-lg shadow-primary-glow"
              title="Create new note"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredNotes.map(note => {
              const isActive = selectedNoteId === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => loadNote(note)}
                  className={`p-3.5 rounded-2xl cursor-pointer border transition ${
                    isActive 
                      ? 'bg-primary/10 border-primary/45 text-text-primary' 
                      : 'bg-card-dark/40 border-border-dark hover:bg-card-dark text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <h4 className="font-outfit font-bold text-sm truncate">{note.name || 'Untitled Note'}</h4>
                  
                  {note.course_id && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-primary uppercase mt-1">
                      <BookOpen size={8} />
                      <span>{getCourseName(note.course_id)}</span>
                    </div>
                  )}

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 bg-bg-dark/60 rounded border border-border-dark">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredNotes.length === 0 && (
              <div className="text-center py-12 text-text-muted text-xs">
                No notes found matching query.
              </div>
            )}
          </div>
        </aside>

        {/* Note Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-bg-dark">
          {/* Editor Header controls */}
          <div className="px-6 py-3 border-b border-border-dark flex items-center justify-between bg-card-dark/30">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPreview(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${!isPreview ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <Edit size={12} />
                <span>Editor</span>
              </button>
              <button
                onClick={() => setIsPreview(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${isPreview ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <Eye size={12} />
                <span>Preview</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {selectedNoteId && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                  title="Delete Note"
                >
                  <Trash2 size={16} />
                </button>
              )}
              
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving' || !noteName.trim()}
                className="flex items-center gap-1.5 px-4.5 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-primary-glow cursor-pointer"
              >
                {saveStatus === 'saved' ? <CheckCircle size={14} /> : <Save size={14} />}
                <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Note'}</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 border-b border-border-dark flex flex-col md:flex-row gap-4 bg-card-dark/10">
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Note Title</label>
              <input
                type="text"
                placeholder="Lecture Note 1: Structural Engineering Basics"
                value={noteName}
                onChange={(e) => setNoteName(e.target.value)}
                className="w-full bg-transparent font-outfit font-bold text-xl text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            </div>

            <div className="w-full md:w-48">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Link Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full bg-card-dark border border-border-dark rounded-xl px-2 py-1.5 text-xs text-text-primary focus:outline-none"
              >
                <option value="">No Course Link</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Tags (comma split)</label>
              <div className="relative">
                <Tag size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="algebra, lectures"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                  className="w-full bg-card-dark border border-border-dark rounded-xl pl-7 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Editor Workspace */}
          <div className="flex-1 overflow-hidden relative">
            {!isPreview ? (
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="# Add Markdown content here..."
                className="w-full h-full p-6 bg-transparent text-text-primary placeholder:text-text-muted font-mono text-sm leading-relaxed resize-none focus:outline-none overflow-y-auto"
              />
            ) : (
              <div className="w-full h-full p-6 overflow-y-auto prose prose-invert max-w-none">
                {noteContent ? (
                  <div className="space-y-4">
                    {/* Basic Markdown Parser for styling */}
                    {noteContent.split('\n').map((line, idx) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={idx} className="text-2xl font-outfit font-extrabold text-text-primary border-b border-border-dark pb-2 mt-4">{line.substring(2)}</h1>;
                      }
                      if (line.startsWith('## ')) {
                        return <h2 key={idx} className="text-xl font-outfit font-bold text-text-primary mt-3">{line.substring(3)}</h2>;
                      }
                      if (line.startsWith('### ')) {
                        return <h3 key={idx} className="text-lg font-outfit font-semibold text-text-primary mt-2">{line.substring(4)}</h3>;
                      }
                      if (line.startsWith('- ') || line.startsWith('* ')) {
                        return <li key={idx} className="text-sm text-text-secondary pl-4 list-disc">{line.substring(2)}</li>;
                      }
                      if (line.trim() === '') {
                        return <div key={idx} className="h-2" />;
                      }
                      return <p key={idx} className="text-sm text-text-secondary leading-relaxed">{line}</p>;
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-text-muted gap-2">
                    <FileText size={40} />
                    <p className="text-sm">No notes content added yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
