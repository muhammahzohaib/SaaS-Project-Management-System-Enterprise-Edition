import { useState, useRef } from 'react';
import Modal from './Modal';
import { addComment, addSubtask, updateTask } from '../services/taskService';
import api from '../services/api';
import { 
  MessageSquare, 
  CheckSquare, 
  Plus, 
  User, 
  Clock, 
  Send,
  Loader2,
  MoreHorizontal,
  Paperclip,
  FileText,
  Play,
  Pause,
  Timer,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskDetailModal({ task, isOpen, onClose }) {
  const [commentText, setCommentText] = useState('');
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLogged, setTimeLogged] = useState(task.timeSpent || 0);
  const [attachments, setAttachments] = useState(task.attachments || []);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  if (!task) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/upload/task/${task._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAttachments(prev => [...prev, res.data.data]);
    } catch (err) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      await addComment(task._id, commentText);
      setCommentText('');
    } catch (err) {
      alert('Failed to add comment');
    } finally {
      setLoading(true); // Wait for socket update
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;
    try {
      await addSubtask(task._id, subtaskTitle);
      setSubtaskTitle('');
    } catch (err) {
      alert('Failed to add subtask');
    }
  };

  const toggleSubtask = async (subtaskId) => {
    const subtask = task.subtasks.find(s => s._id === subtaskId);
    if (!subtask) return;
    
    const updatedSubtasks = task.subtasks.map(s => 
      s._id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    
    try {
      await updateTask(task._id, { subtasks: updatedSubtasks });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Details & Subtasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <MoreHorizontal size={14} /> Description
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {task.description || 'No description provided for this task.'}
            </p>
          </div>

          {/* Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <CheckSquare size={14} /> Subtasks
              </h4>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {task.subtasks?.filter(s => s.isCompleted).length}/{task.subtasks?.length || 0}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {task.subtasks?.map(sub => (
                <div 
                  key={sub._id} 
                  className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 transition-all group"
                >
                  <input 
                    type="checkbox" 
                    checked={sub.isCompleted} 
                    onChange={() => toggleSubtask(sub._id)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className={`text-sm font-medium flex-1 ${sub.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Add a subtask..." 
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all">
                <Plus size={20} />
              </button>
            </form>
          </div>

          {/* Comments */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare size={14} /> Discussion
            </h4>
            
            <div className="space-y-6 mb-6">
              {task.comments?.map((comment, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
                    {comment.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{comment.user?.name}</span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="relative">
              <textarea 
                rows="2"
                placeholder="Write a comment..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none pr-12"
              />
              <button 
                type="submit"
                className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Meta Info */}
        <div className="space-y-6 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8">
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Assignee</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                    {task.assignee?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{task.assignee?.name || 'Unassigned'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{task.assignee?.email}</p>
                  </div>
                </div>
             </div>

             {/* Time Tracking Section */}
             <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Time Tracking</label>
                <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl shadow-slate-200">
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                         <Timer size={16} className="text-indigo-400" />
                         <span className="text-lg font-mono font-bold">
                            {Math.floor(timeLogged / 60)}h {timeLogged % 60}m
                         </span>
                      </div>
                      <button 
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isTimerRunning ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-500 hover:bg-indigo-600'
                        }`}
                      >
                         {isTimerRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                      </button>
                   </div>
                   <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((timeLogged / (task.timeEstimation || 60)) * 100)}%</span>
                   </div>
                   <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((timeLogged / (task.timeEstimation || 60)) * 100, 100)}%` }}
                        className="h-full bg-indigo-400" 
                      />
                   </div>
                </div>
             </div>

             <div className="pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl">
                   <Zap size={12} fill="currentColor" />
                   <span className="text-[9px] font-bold uppercase tracking-wider">Live Collaboration Active</span>
                </div>
             </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Priority</label>
                <div className={`flex items-center gap-2 p-3 rounded-2xl border ${
                  task.priority === 'critical' ? 'bg-rose-600 border-rose-700 text-white' :
                  task.priority === 'high' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                  task.priority === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                }`}>
                   <span className="text-sm font-bold capitalize">{task.priority} Priority</span>
                </div>
             </div>

             {/* Custom Fields Section */}
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complexity</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    task.complexity === 'hard' ? 'bg-rose-100 text-rose-700' : 
                    task.complexity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>{task.complexity || 'medium'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Story Points</span>
                  <span className="text-xs font-bold text-slate-700">{task.storyPoints || 0} pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget</span>
                  <span className="text-xs font-bold text-emerald-600">${task.budget || 0}</span>
                </div>
                {task.isMilestone && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Sparkles size={14} />
                      <span className="text-[10px] font-bold uppercase">Project Milestone</span>
                    </div>
                  </div>
                )}
             </div>

             <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Due Date</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600">
                  <Clock size={16} />
                  <span className="text-sm font-bold">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </span>
                </div>
             </div>

             <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attachments</label>
                  <button className="text-indigo-600 hover:text-indigo-700">
                    <Paperclip size={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  {task.attachments?.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 transition-all cursor-pointer group">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-500">
                         <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-700 truncate">{file.name}</p>
                        <p className="text-[9px] text-slate-500 uppercase">{file.type || 'FILE'}</p>
                      </div>
                    </div>
                  ))}
                  {(!task.attachments || task.attachments.length === 0) && (
                    <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No files</p>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
