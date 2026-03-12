import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Globe, Building2, Save } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  const sections = [
    { title: 'Personal Information', icon: User, description: 'Update your profile details and avatar.' },
    { title: 'Organization', icon: Building2, description: 'Manage your workspace settings and team.' },
    { title: 'Security', icon: Shield, description: 'Manage passwords and authentication methods.' },
    { title: 'Notifications', icon: Bell, description: 'Configure how you receive updates.' },
  ];

  return (
    <Layout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account preferences and workspace configuration.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Navigation */}
          <div className="md:col-span-1 space-y-1">
            {sections.map((section, i) => (
              <button
                key={section.title}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  i === 0 ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <section.icon size={18} />
                {section.title}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="md:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8 border-none shadow-sm"
            >
              <h3 className="text-lg font-bold mb-6">Profile Details</h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold font-serif shadow-xl shadow-indigo-200">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                      Change Photo
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={user?.name}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={user?.email}
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Workspace</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    <Building2 className="text-slate-400" size={18} />
                    <span className="font-medium text-slate-700">{user?.organization?.name || 'My Workspace'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                <button className="btn-primary flex items-center gap-2 px-8">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </motion.div>

            <div className="glass-card p-8 border-none shadow-sm bg-rose-50/30">
              <h3 className="text-lg font-bold text-rose-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-slate-500 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="px-6 py-3 border-2 border-rose-200 text-rose-600 rounded-2xl text-sm font-bold hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
