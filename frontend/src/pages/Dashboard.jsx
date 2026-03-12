import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getProjects } from '../services/projectService';
import { getOrgStats } from '../services/analyticsService';
import { getTimeline } from '../services/activityService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  CheckCircle2, 
  Clock, 
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Activity,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProjects(), getOrgStats(), getTimeline()])
      .then(([projRes, statsRes, timelineRes]) => {
        setProjects(projRes.data || []);
        setStats(statsRes.data);
        setTimeline(timelineRes.data.data || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="flex items-center justify-center h-full">Loading...</div></Layout>;

  const statCards = [
    { name: 'Active Projects', value: stats?.projectCount || 0, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Tasks Completed', value: stats?.completedRecently || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Team Productivity', value: `${stats?.productivityTrend > 0 ? '+' : ''}${stats?.productivityTrend || 0}%`, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
    { name: 'Upcoming Deadlines', value: stats?.upcomingDeadlines || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const pieData = stats?.taskStats?.map(s => ({ name: s._id, value: s.count })) || [
    { name: 'To Do', value: 400 },
    { name: 'In Progress', value: 300 },
    { name: 'Done', value: 300 },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back!</h1>
            <p className="text-slate-500 mt-1">Here's what's happening in your workspace today.</p>
          </div>
          <Link to="/projects/new" className="btn-primary flex items-center gap-2 py-3 px-6 shadow-md shadow-indigo-100">
            <Plus size={20} />
            Create Project
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.name}
              className="glass-card p-6 border-none shadow-sm group hover:shadow-lg hover:shadow-indigo-50 transition-all bg-white"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <ArrowUpRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={20} />
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.name}</p>
                <h3 className="text-3xl font-bold mt-1 text-slate-900">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts & Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workload Distribution */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 border-none shadow-sm bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Workload Distribution</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <Activity size={12} />
                  Live Sync
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.workload || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="taskCount" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Workload Balancer (Silicon Valley Style) */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-all duration-700" />
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Sparkles size={20} />
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-white">AI Workload Balancer</h4>
                        <p className="text-sm text-indigo-300">Intelligent task redistribution engine</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Potential Overload</p>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">J</div>
                           <p className="text-sm font-bold text-white">James Wilson <span className="text-xs font-normal text-slate-400 font-mono">(9 tasks)</span></p>
                        </div>
                        <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all">
                           Auto-Redistribute
                        </button>
                     </div>
                     <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Healthy Balance</p>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">A</div>
                           <p className="text-sm font-bold text-white">Alisa Chen <span className="text-xs font-normal text-slate-400 font-mono">(3 tasks)</span></p>
                        </div>
                        <p className="mt-4 text-[11px] text-slate-400 italic">Recommended recipient for pending 'API Docs' task.</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Task Status */}
            <div className="glass-card p-8 border-none shadow-sm bg-white flex flex-col h-fit">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Task Breakdown</h3>
              <div className="h-64 relative mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">TOTAL</span>
                  <span className="text-2xl font-bold text-slate-900">{pieData.reduce((acc, curr) => acc + curr.value, 0)}</span>
                </div>
              </div>

              {/* Activity Timeline Section */}
              <div className="border-t border-slate-100 pt-6 flex-1">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Activity Feed</h4>
                    <Activity size={14} className="text-indigo-400" />
                 </div>
                 <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {timeline.map((act, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={act._id} 
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
                          {act.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{act.user?.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{act.details}</p>
                          <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">
                            {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {timeline.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-4">No recent activity</p>}
                 </div>
              </div>
            </div>

            {/* Sprint Velocity Card */}
            <div className="glass-card p-6 border-none shadow-sm bg-white">
               <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sprint Performance</h4>
                  <TrendingUp size={14} className="text-indigo-600" />
               </div>
               <div className="flex items-end gap-1 mb-4 h-12">
                  {[20, 35, 25, 45, 60, 50, 65].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.1 }}
                      className="flex-1 bg-indigo-100 rounded-t-sm group relative"
                    >
                      <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />
                    </motion.div>
                  ))}
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">14.2 pts/day</span>
                  <span className="text-[10px] font-bold text-emerald-600">+18.5%</span>
               </div>
            </div>
          </div>
        </div>

        {/* Recent Projects Table */}
        <div className="glass-card border-none shadow-sm overflow-hidden bg-white">
          <div className="p-8 pb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Recent Projects</h3>
            <Link to="/projects" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.slice(0, 5).map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors transition-all duration-200">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                          {p.name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{p.name}</p>
                          <p className="text-xs text-slate-500 truncate w-48 font-medium">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link 
                        to={`/projects/${p._id}`}
                        className="px-4 py-1.5 hover:bg-white rounded-xl shadow-sm transition-all text-xs font-bold text-slate-400 hover:text-indigo-600 border border-slate-100 hover:border-slate-200"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
