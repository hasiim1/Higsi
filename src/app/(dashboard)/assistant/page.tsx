'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useData';
import { 
  Send, 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Sparkles, 
  User, 
  Bot, 
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ChatFile {
  id: string;
  name: string;
  type: string;
  url: string;
  extractedText?: string;
  base64Data?: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: Omit<ChatFile, 'extractedText' | 'base64Data'>[];
}

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

export default function AIAssistantPage() {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your Higsi AI Assistant. You can upload study documents (PDF, Word, TXT, MD) or images (PNG, JPG) here, and ask me questions about them or review your semester progress. How can I help you study today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<ChatFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !user?.id) return;

    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fileType = file.type;
      const fileName = file.name;

      // Validate file extension
      const fileExt = fileName.split('.').pop()?.toLowerCase();
      const allowedExts = ['pdf', 'docx', 'txt', 'md', 'png', 'jpg', 'jpeg'];
      
      if (!fileExt || !allowedExts.includes(fileExt)) {
        showToast('error', `Unsupported file: ${fileName}. Only PDF, DOCX, TXT, MD, PNG, JPG are supported.`);
        continue;
      }

      // Max file size 5MB
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', `File ${fileName} exceeds the 5MB size limit.`);
        continue;
      }

      // Add placeholder to state
      const newFilePlaceholder: ChatFile = {
        id: fileId,
        name: fileName,
        type: fileType,
        url: '',
        status: 'uploading'
      };

      setAttachedFiles(prev => [...prev, newFilePlaceholder]);

      try {
        // 1. Upload to Supabase Storage
        const uploadPath = `assistant/${user.id}/${fileId}-${fileName}`;
        const { data, error: uploadError } = await supabase.storage
          .from('assistant-files')
          .upload(uploadPath, file, { upsert: true });

        if (uploadError) {
          throw new Error('Please ensure you have created a public bucket named "assistant-files" in Supabase Storage.');
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('assistant-files')
          .getPublicUrl(uploadPath);

        // Update state to processing
        setAttachedFiles(prev => prev.map(f => f.id === fileId ? { ...f, url: publicUrl, status: 'processing' } : f));

        // 3. Handle File Extraction / Analysis Preparation
        let extractedText = '';
        let base64Data = '';

        if (fileType.startsWith('image/')) {
          // Get base64 representation for multimodal input
          base64Data = await getBase64(file);
        } else {
          // Send to serverless API endpoint to parse PDF/DOCX/TXT/MD
          const formData = new FormData();
          formData.append('file', file);

          const extractRes = await fetch('/api/extract', {
            method: 'POST',
            body: formData
          });

          if (!extractRes.ok) {
            const errData = await extractRes.json();
            throw new Error(errData.error || 'Failed to extract text from document.');
          }

          const extractData = await extractRes.json();
          extractedText = extractData.text;
        }

        // Update file to ready state
        setAttachedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                url: publicUrl, 
                extractedText, 
                base64Data, 
                status: 'ready' 
              } 
            : f
        ));
      } catch (err: any) {
        console.error(err);
        showToast('error', err.message || `Failed to process ${fileName}`);
        setAttachedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f));
      }
    }

    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachedFiles.length === 0) return;
    if (loading) return;

    // Check if any files are still uploading or processing
    const hasUnreadyFiles = attachedFiles.some(f => f.status === 'uploading' || f.status === 'processing');
    if (hasUnreadyFiles) {
      showToast('error', 'Please wait for your files to finish processing before sending.');
      return;
    }

    // Clean any files in error state
    const readyFiles = attachedFiles.filter(f => f.status === 'ready');
    const userMessageContent = input;

    const userMessage: Message = {
      id: `${Date.now()}`,
      role: 'user',
      content: userMessageContent,
      timestamp: new Date(),
      files: readyFiles.map(f => ({ id: f.id, name: f.name, type: f.type, url: f.url, status: f.status }))
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setLoading(true);

    try {
      // Build messages payload for chat endpoint
      const chatMessages = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      chatMessages.push({ role: 'user', content: userMessageContent });

      // Call our API endpoint
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: chatMessages,
          files: readyFiles
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate response.');
      }

      const resData = await res.json();

      const assistantMessage: Message = {
        id: `${Date.now()}`,
        role: 'assistant',
        content: resData.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'An error occurred during chat execution.');
      
      // Append error message to history
      setMessages(prev => [...prev, {
        id: `${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'I encountered an error and could not generate a response. Please check your Supabase/Gemini API key settings.'}`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('Wipe current chat history?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hello! I am your Higsi AI Assistant. You can upload study documents (PDF, Word, TXT, MD) or images (PNG, JPG) here, and ask me questions about them or review your semester progress. How can I help you study today?",
          timestamp: new Date()
        }
      ]);
      setAttachedFiles([]);
      showToast('success', 'Chat history cleared.');
    }
  };

  // Simple formatter to convert markdown headers, bold, bullet points into neat HTML
  const formatMsgContent = (text: string) => {
    let formatted = text;
    
    // Escape HTML tags to prevent XSS
    formatted = formatted
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    formatted = formatted.replace(/^### (.*$)/gim, '<h4 class="font-outfit font-bold text-sm text-text-primary mt-3 mb-1">$1</h4>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h3 class="font-outfit font-bold text-base text-primary mt-4 mb-1.5">$1</h3>');
    formatted = formatted.replace(/^# (.*$)/gim, '<h2 class="font-outfit font-bold text-lg text-primary mt-5 mb-2">$1</h2>');
    
    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-text-primary">$1</strong>');
    
    // Bullet points
    formatted = formatted.replace(/^\s*\*\s+(.*$)/gim, '<li class="ml-4 list-disc text-xs text-text-secondary mt-1">$1</li>');
    formatted = formatted.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-xs text-text-secondary mt-1">$1</li>');

    // Numbered lists
    formatted = formatted.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-xs text-text-secondary mt-1">$2</li>');

    // Inline Code
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-bg-dark border border-border-dark px-1.5 py-0.5 rounded text-[11px] font-mono text-primary">$1</code>');

    // Code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="bg-bg-dark border border-border-dark p-3 rounded-xl font-mono text-[11px] text-text-secondary my-3 overflow-x-auto whitespace-pre-wrap">$1</pre>');

    return <div className="leading-relaxed text-xs space-y-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="flex-1 bg-bg-dark flex flex-col pb-6 relative min-h-screen">
      <Header title="AI Assistant" subtitle="Your learning companion. Upload study material and ask complex questions." showSearch={false} />

      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-2xl border transition-all duration-300 transform translate-x-0 animate-fade-in ${
              toast.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' 
                : 'bg-red-950/90 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircle size={18} className="text-emerald-500" />
              ) : (
                <AlertCircle size={18} className="text-red-500" />
              )}
              <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-text-primary transition ml-3 shrink-0 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 mt-6 flex flex-col h-[calc(100vh-140px)]">
        {/* Chat window container */}
        <div className="flex-1 bg-card-dark border border-border-dark rounded-3xl flex flex-col overflow-hidden shadow-xl">
          
          {/* Active Chat Header */}
          <div className="px-6 py-4 border-b border-border-dark flex items-center justify-between bg-sidebar-dark/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-sm text-text-primary">Higsi Scholar Bot</h3>
                <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Gemini Multimodal Active</span>
                </p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="flex items-center gap-1 text-[11px] font-bold text-red-500 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Clear Chat</span>
            </button>
          </div>

          {/* Messages log */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                  msg.role === 'user' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border-dark bg-bg-dark text-text-secondary'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Message Box */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-2xl border ${
                    msg.role === 'user' 
                      ? 'bg-primary/10 border-primary/20 text-text-primary rounded-tr-none shadow-md shadow-primary-glow' 
                      : 'bg-bg-dark border-border-dark text-text-secondary rounded-tl-none'
                  }`}>
                    {/* Render attachment indicators */}
                    {msg.files && msg.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3 border-b border-border-dark pb-2.5">
                        {msg.files.map(file => (
                          <a
                            key={file.id}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-card-dark border border-border-dark hover:border-primary px-2.5 py-1 rounded-xl text-[10px] font-semibold text-text-primary transition"
                          >
                            {file.type.startsWith('image/') ? <ImageIcon size={11} /> : <FileText size={11} />}
                            <span className="truncate max-w-[120px]">{file.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                    {formatMsgContent(msg.content)}
                  </div>
                  <div className={`text-[9px] text-text-muted px-1.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading/Typing Indicator */}
            {loading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full border border-border-dark bg-bg-dark text-text-secondary flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-bg-dark border border-border-dark p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attached Files List Input Bar */}
          {attachedFiles.length > 0 && (
            <div className="px-6 py-2.5 border-t border-border-dark bg-bg-dark/40 flex flex-wrap gap-2.5">
              {attachedFiles.map(file => (
                <div 
                  key={file.id} 
                  className="flex items-center gap-2 bg-card-dark border border-border-dark rounded-xl px-3 py-1.5 text-xs text-text-primary"
                >
                  {file.status === 'uploading' || file.status === 'processing' ? (
                    <Loader2 size={13} className="text-primary animate-spin" />
                  ) : file.type.startsWith('image/') ? (
                    <ImageIcon size={13} className="text-primary" />
                  ) : (
                    <FileText size={13} className="text-primary" />
                  )}
                  
                  <div className="flex flex-col">
                    <span className="truncate max-w-[130px] font-semibold text-[11px]">{file.name}</span>
                    <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold">
                      {file.status === 'uploading' ? 'Uploading' : file.status === 'processing' ? 'Processing' : 'Ready'}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-0.5 rounded-full hover:bg-border-dark text-text-muted hover:text-red-500 transition cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Message Input Panel */}
          <form onSubmit={handleSend} className="p-4 border-t border-border-dark flex items-center gap-3 bg-sidebar-dark/20">
            <button
              type="button"
              onClick={triggerFileInput}
              className="p-3 bg-bg-dark border border-border-dark hover:border-text-secondary text-text-secondary hover:text-text-primary rounded-2xl transition cursor-pointer shrink-0"
            >
              <Paperclip size={18} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              multiple 
              accept=".pdf,.docx,.txt,.md,image/png,image/jpeg,image/jpg"
            />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your study documents, summarize assignments, or write code..."
              className="flex-1 bg-bg-dark border border-border-dark rounded-2xl px-5 py-3.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition"
            />

            <button
              type="submit"
              disabled={loading || (!input.trim() && attachedFiles.length === 0)}
              className="p-3.5 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:pointer-events-none text-white rounded-2xl transition shadow-lg shadow-primary-glow cursor-pointer shrink-0"
            >
              <Send size={18} />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
