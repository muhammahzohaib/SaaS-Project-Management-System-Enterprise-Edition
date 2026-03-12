import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings, 
  LogOut, 
  Bell, 
  Menu,
  X,
  Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications } from '../services/activityService';
import { globalSearch } from '../services/aiService';
import io from 'socket.io-client';
import { Search as SearchIcon, Command } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Global Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      globalSearch(searchQuery).then(res => setSearchResults(res.data.data));
    } else {
      setSearchResults(null);
    }
  }, [searchQuery]);
  useEffect(() => {
    if (user) {
      getNotifications().then(res => {
        const data = res.data.data;
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      });

      const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
      socket.emit('join_org', user.organization._id || user.organization);

      socket.on('new_notification', (notif) => {
        setNotifications(prev => [notif, ...prev].slice(0, 10));
        setUnreadCount(c => c + 1);
      });

      return () => socket.disconnect();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed lg:relative z-50 w-64 h-screen glass-card !rounded-none border-r border-slate-200 flex flex-col"
          >
            <div className="p-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">SaaS PM</span>
              </Link>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-item ${
                    location.pathname.startsWith(item.path) 
                    ? 'bg-indigo-50 !text-indigo-600' 
                    : ''
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Workspace Status Card */}
            <div className="px-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-4 shadow-xl shadow-indigo-100 relative overflow-hidden group">
                <div className="absolute -right-2 -top-2 w-12 h-12 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-500" />
                <div className="relative z-10">
                  <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-3 opacity-80">Free Workspace</h4>
                  <div className="flex items-center justify-between text-white mb-2">
                    <span className="text-xs font-bold">Project Usage</span>
                    <span className="text-xs font-bold">3/5</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-white rounded-full" style={{ width: '60%' }} />
                  </div>
                  <button className="w-full py-2 bg-white text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-all shadow-sm">
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200">
              <div className="flex items-center gap-3 mb-6 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-slate-500 hover:text-rose-600 transition-colors w-full px-2"
              >
                <LogOut size={20} />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/50 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-bold text-slate-800 capitalize">
              {location.pathname.split('/').filter(Boolean)[0] || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
             <Link 
              to="/projects/new"
              className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-200"
            >
              <Plus size={18} />
              New Project
            </Link>
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setUnreadCount(0);
                }}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notifications</h4>
                        <span className="text-[10px] font-bold text-indigo-600">Mark all as read</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n._id} className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none cursor-pointer">
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                            <p className="text-[9px] text-slate-400 mt-2 font-medium">
                              {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <div className="py-10 text-center">
                            <p className="text-xs text-slate-400 italic">No new notifications</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1">
          {children}
        </main>
      </div>

      {/* Global Search Command Palette */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setIsSearchOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-200"
            >
              <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                <SearchIcon size={20} className="text-slate-400" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search projects, tasks, or team members..." 
                  className="bg-transparent border-none focus:ring-0 text-lg w-full placeholder-slate-400 text-slate-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                   <Command size={12} className="text-slate-400" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase">K</span>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
                {searchResults ? (
                  <>
                    {/* Projects */}
                    {searchResults.projects?.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Projects</h4>
                        <div className="space-y-1">
                          {searchResults.projects.map(p => (
                            <button 
                              key={p.id} 
                              onClick={() => { navigate(`/projects/${p.id}`); setIsSearchOpen(false); }}
                              className="w-full text-left px-3 py-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                            >
                              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <FolderKanban size={16} />
                              </div>
                              <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tasks */}
                    {searchResults.tasks?.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Tasks</h4>
                        <div className="space-y-1">
                          {searchResults.tasks.map(t => (
                            <button 
                              key={t.id} 
                              onClick={() => { navigate(`/projects/${t.projectId}`); setIsSearchOpen(false); }}
                              className="w-full text-left px-3 py-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                            >
                              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <LayoutDashboard size={16} />
                              </div>
                              <span className="text-sm font-semibold text-slate-700">{t.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Users */}
                    {searchResults.users?.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Team</h4>
                        <div className="space-y-1">
                          {searchResults.users.map(u => (
                            <div key={u.id} className="px-3 py-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-default">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                {u.name[0]}
                              </div>
                              <span className="text-sm font-semibold text-slate-700">{u.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                       <SearchIcon className="text-slate-300" size={20} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">Search for anything</p>
                    <p className="text-xs text-slate-500 mt-1">Start typing to see results across the workspace</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex gap-4">
                  <span>Enter to select</span>
                  <span>Esc to close</span>
                </div>
                <span>Help center</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
