import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';
import { getProject, deleteProject } from '../services/projectService';
import { getBoards } from '../services/boardService';
import { getTasks, updateTask, createTask } from '../services/taskService';
import KanbanBoard from '../components/KanbanBoard';
import { io } from 'socket.io-client';
import { 
  Settings, 
  Users, 
  Trash2, 
  ChevronLeft, 
  Search, 
  Filter,
  Share2,
  Sparkles,
  Loader2,
  Calendar as CalendarIcon,
  BarChartHorizontal,
  Table as TableIcon,
  Book,
  Flag,
  Layout as LayoutIcon,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskDetailModal from '../components/TaskDetailModal';
import { getAISuggestions } from '../services/aiService';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState([]);
  const [tasksByBoard, setTasksByBoard] = useState({});
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [view, setView] = useState('kanban'); // kanban, calendar, timeline
  const [activeTab, setActiveTab] = useState('board'); // board, roadmap, docs, settings

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const filteredTasks = useMemo(() => {
    const newMap = {};
    Object.keys(tasksByBoard).forEach(boardId => {
      newMap[boardId] = tasksByBoard[boardId].filter(t => {
        const matchesSearch = !searchTerm.trim() || 
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          t.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
        const matchesAssignee = filterAssignee === 'all' || t.assignee?._id === filterAssignee;
        return matchesSearch && matchesPriority && matchesAssignee;
      });
    });
  }, [tasksByBoard, searchTerm, filterPriority, filterAssignee]);

  const fetchProjectData = useCallback(async () => {
    try {
      const pRes = await getProject(id);
      setProject(pRes.data);
      
      const bRes = await getBoards(id);
      const fetchedBoards = bRes.data || [];
      setBoards(fetchedBoards);

      const tasksMap = {};
      for (const board of fetchedBoards) {
        const tRes = await getTasks(board._id);
        tasksMap[board._id] = tRes.data || [];
      }
      setTasksByBoard(tasksMap);
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // Socket.io initialization
  useEffect(() => {
    const newSocket = io(SOCKET_URL, { withCredentials: true });
    setSocket(newSocket);

    if (project?.organization) {
      const orgId = typeof project.organization === 'object' ? project.organization._id : project.organization;
      newSocket.emit('join_org', orgId);
    }

    // Real-time Update Handler
    newSocket.on('task_updated', (updatedTask) => {
      setTasksByBoard((prev) => {
        const newMap = { ...prev };
        Object.keys(newMap).forEach(boardId => {
          newMap[boardId] = newMap[boardId].map(t => t._id === updatedTask._id ? { ...t, ...updatedTask } : t);
        });
        return newMap;
      });
      // Also update selected task if open
      setSelectedTask(prev => prev?._id === updatedTask._id ? updatedTask : prev);
    });

    // Real-time Creation Handler
    newSocket.on('task_created', (newTask) => {
      setTasksByBoard((prev) => {
        const boardTasks = prev[newTask.board] || [];
        if (boardTasks.find(t => t._id === newTask._id)) return prev; // Avoid duplicates
        return {
          ...prev,
          [newTask.board]: [...boardTasks, newTask]
        };
      });
    });

    return () => newSocket.close();
  }, [project?.organization]);

  const handleTaskMove = async (taskId, overId) => {
    const task = Object.values(tasksByBoard).flat().find(t => t._id === taskId);
    if (!task) return;

    let targetBoardId = overId;
    const overTask = Object.values(tasksByBoard).flat().find(t => t._id === overId);
    if (overTask) targetBoardId = overTask.board;

    if (task.board === targetBoardId) return;

    try {
      // Optimistic Update
      setTasksByBoard(prev => {
        const newMap = { ...prev };
        newMap[task.board] = newMap[task.board].filter(t => t._id !== taskId);
        newMap[targetBoardId] = [...(newMap[targetBoardId] || []), { ...task, board: targetBoardId }];
        return newMap;
      });

      await updateTask(taskId, { board: targetBoardId });
    } catch (err) {
      console.error(err);
      fetchProjectData(); // Rollback on error
    }
  };

  const handleCreateTask = async (formData) => {
    setFormLoading(true);
    try {
      const res = await createTask({ ...formData, board: currentBoardId });
      // Note: socket will handle updating the UI for everyone, but we close modal immediately
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to create task');
    } finally {
      setFormLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    deleteProject(id).then(() => navigate('/dashboard')).catch(err => console.error(err));
  };

  const handleAISummary = async () => {
    setAiSummaryLoading(true);
    try {
      // For demo, we summarize based on task counts
      const total = Object.values(tasksByBoard).flat().length;
      const done = Object.values(tasksByBoard).flat().filter(t => t.status === 'done').length;
      const msg = `This project (${project.name}) has ${total} tasks currently. ${done} are completed. Team visibility is high, but priority should be given to the pending tasks in the In Progress column to maintain velocity. AI predicts completion within the next 5 business days if current pace continues.`;
      setAiSummary(msg);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/share/project/${project.shareToken || project._id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Public share link copied to clipboard!');
    });
  };

  if (loading || !project) return <Layout><div className="flex items-center justify-center h-full">Loading Project...</div></Layout>;

  return (
    <Layout>
      <div className="h-full flex flex-col space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <ChevronLeft size={20} />
              </Link>
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <span>Projects</span>
                  <span className="text-slate-300">/</span>
                  <span>{project.name}</span>
                </div>
                <h1 className="text-2xl font-bold mt-1 text-slate-900">{project.name}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 mr-4">
                {project.members?.slice(0, 3).map((m, i) => (
                  <div key={m._id || i} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-600" title={m.name}>
                    {m.name?.[0]?.toUpperCase()}
                  </div>
                ))}
                {project.members?.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                    +{project.members.length - 3}
                  </div>
                )}
              </div>
              <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Users size={20} />
              </button>
              <button 
                onClick={handleDelete}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* Project Tabs */}
          <div className="flex items-center gap-8 border-b border-slate-200 px-2">
             {[
               { id: 'board', label: 'Tasks', icon: LayoutIcon },
               { id: 'roadmap', label: 'Roadmap', icon: Flag },
               { id: 'docs', label: 'Knowledge Base', icon: Book },
               { id: 'settings', label: 'Workflows', icon: SettingsIcon }
             ].map(tab => (
               <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all relative ${
                  activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
               >
                 <tab.icon size={16} />
                 {tab.label}
                 {activeTab === tab.id && (
                   <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                 )}
               </button>
             ))}
          </div>
        </div>
        
        {/* Task Board Tab */}
        {activeTab === 'board' && (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                {/* View Switcher */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl mr-2">
                   <button 
                    onClick={() => setView('kanban')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     <TableIcon size={14} />
                     Board
                   </button>
                   <button 
                    onClick={() => setView('calendar')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     <CalendarIcon size={14} />
                     Calendar
                   </button>
                   <button 
                    onClick={() => setView('timeline')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'timeline' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     <BarChartHorizontal size={14} />
                     Timeline
                   </button>
                </div>

                <div className="h-6 w-px bg-slate-200 mx-2" />
                
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none w-48"
                  />
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      showFilterPanel || filterPriority !== 'all' || filterAssignee !== 'all' 
                       ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Filter size={16} />
                    Filter
                    {(filterPriority !== 'all' || filterAssignee !== 'all') && (
                      <span className="w-4 h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">!</span>
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {showFilterPanel && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute left-0 top-12 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-30 min-w-[220px]"
                      >
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Priority</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {['all', 'low', 'medium', 'high', 'critical'].map(p => (
                            <button key={p} onClick={() => setFilterPriority(p)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                              filterPriority === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}>{p}</button>
                          ))}
                        </div>
                        <button 
                          onClick={() => { setFilterPriority('all'); setFilterAssignee('all'); setShowFilterPanel(false); }}
                          className="w-full py-2 text-[10px] font-bold uppercase text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          Clear all filters
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleAISummary}
                  disabled={aiSummaryLoading}
                  className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
                >
                  {aiSummaryLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  AI INTEL
                </button>
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-bold transition-all border border-slate-100"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>

            {/* AI Summary Overlay */}
            <AnimatePresence>
              {aiSummary && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-indigo-600 p-4 rounded-2xl shadow-xl shadow-indigo-100 relative group"
                >
                  <button 
                    onClick={() => setAiSummary('')}
                    className="absolute top-2 right-2 text-indigo-200 hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-1">AI Project Insight</h4>
                      <p className="text-indigo-50 text-sm leading-relaxed font-medium">{aiSummary}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dynamic View Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {view === 'kanban' && (
                <KanbanBoard 
                  boards={boards} 
                  tasksByBoard={filteredTasks} 
                  onTaskDrop={handleTaskMove}
                  onAddTask={(boardId) => {
                    setCurrentBoardId(boardId);
                    setIsModalOpen(true);
                  }}
                  onTaskClick={handleTaskClick} 
                />
              )}

              {view === 'calendar' && (
                <div className="h-full bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col p-8 items-center justify-center text-center">
                   <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                      <CalendarIcon size={32} />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900">Project Calendar</h3>
                   <p className="text-slate-500 max-w-sm mt-2">Visualizing {Object.values(tasksByBoard).flat().length} tasks across the current month schedule.</p>
                   <div className="mt-8 grid grid-cols-7 gap-4 w-full max-w-4xl opacity-50">
                      {Array.from({length: 31}).map((_, i) => (
                        <div key={i} className="aspect-square bg-slate-50 rounded-xl border border-slate-100 p-2 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>
                          {Math.random() > 0.8 && <div className="h-1 bg-indigo-400 rounded-full" />}
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {view === 'timeline' && (
                <div className="h-full bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col p-8 items-center justify-center text-center">
                   <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                      <BarChartHorizontal size={32} />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900">Project Timeline</h3>
                   <p className="text-slate-500 max-w-sm mt-2">Gantt-style visualization for planning task dependencies and project milestones.</p>
                   <div className="mt-8 w-full max-w-4xl space-y-4 opacity-50">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-8 bg-slate-50 rounded-lg relative overflow-hidden">
                           <div className="absolute h-full bg-emerald-400/20 rounded-lg" style={{left: `${i * 15}%`, width: '30%'}} />
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Strategic Roadmap</h3>
                <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                   {[
                     { q: 'Q1 2024', goal: 'Core Infrastructure & Auth', status: 'shipped' },
                     { q: 'Q2 2024', goal: 'AI Automation & Analytics', status: 'in-progress' },
                     { q: 'Q3 2024', goal: 'Mobile Application Beta', status: 'planned' }
                   ].map((item, i) => (
                     <div key={i} className="pl-10 relative">
                        <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
                          item.status === 'shipped' ? 'bg-emerald-500' : item.status === 'in-progress' ? 'bg-indigo-500' : 'bg-slate-300'
                        }`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.q}</span>
                        <h4 className="text-lg font-bold text-slate-800 mt-1">{item.goal}</h4>
                        <div className="mt-2 flex items-center gap-2">
                           <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                             item.status === 'shipped' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                           }`}>{item.status}</span>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
               <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-3xl shadow-xl shadow-indigo-100 text-white">
                  <h4 className="font-bold mb-2">Roadmap Summary</h4>
                  <p className="text-sm opacity-80 leading-relaxed">Your team is moving at 112% velocity compared to last quarter. Focus on Q3 mobile efforts.</p>
               </div>
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'docs' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <button className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                <Plus size={18} /> New Doc
              </button>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Recent Docs</h4>
                 <div className="space-y-1">
                    {['Product Requirements', 'API Documentation', 'Meeting Notes'].map(doc => (
                      <button key={doc} className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center gap-2">
                        <Book size={14} /> {doc}
                      </button>
                    ))}
                 </div>
              </div>
            </div>
            <div className="lg:col-span-3">
               <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm min-h-[60vh]">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Product Requirements</h2>
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                     <p>This document outlines the core functional requirements for the upcoming Q2 release. Focussing on AI-driven task estimation and team workload balancing.</p>
                     <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Key Objectives</h3>
                     <ul className="list-disc pl-5 space-y-2">
                        <li>AI Task suggestions powered by Gemini API</li>
                        <li>Real-time dashboard updates via WebSockets</li>
                        <li>Global search across projects and documents</li>
                     </ul>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Workflows / Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-8">
             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <SettingsIcon className="text-indigo-600" />
                  Workflow Automations
                </h3>
                <div className="space-y-4">
                   <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                      <div>
                         <p className="font-bold text-slate-800 text-sm">Auto-complete Milestone</p>
                         <p className="text-xs text-slate-500 mt-1">IF all tasks in board are 'Done' THEN mark project as 'Completed'</p>
                      </div>
                      <div className="w-12 h-6 bg-indigo-600 rounded-full relative p-1 cursor-pointer">
                         <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                      </div>
                   </div>
                   <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                      <div>
                         <p className="font-bold text-slate-800 text-sm">Assign Manager on High Priority</p>
                         <p className="text-xs text-slate-500 mt-1">IF task priority is 'High' THEN set assignee to Project Manager</p>
                      </div>
                      <div className="w-12 h-6 bg-indigo-600 rounded-full relative p-1 cursor-pointer">
                         <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                      </div>
                   </div>
                   <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2">
                     <Plus size={18} /> Add Automation Rule
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Task Creation Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title="Create New Task"
        >
          <TaskForm onSubmit={handleCreateTask} loading={formLoading} />
        </Modal>

        {/* Task Detail Modal */}
        <TaskDetailModal 
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          task={selectedTask}
        />
      </div>
    </Layout>
  );
}
