import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Layers, 
  Zap, 
  Shield, 
  Users, 
  BarChart3,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function Landing() {
  const features = [
    { title: 'Multi-Tenant Isolation', description: 'Enterprise-grade security ensuring your data stays within your workspace.', icon: Shield },
    { title: 'Real-Time Sync', description: 'Collaborate with your team instantly with live task updates and notifications.', icon: Zap },
    { title: 'Kanban Mastery', description: 'Advanced drag-and-drop boards to visualize and manage your workflow.', icon: Layers },
    { title: 'Team Insights', description: 'Deep-dive analytics and workload distribution to optimize performance.', icon: BarChart3 },
    { title: 'Role-Based Access', description: 'Granular permissions for Admins, Managers, and Team Members.', icon: Users },
    { title: 'Premium UI', description: 'A sleek, modern interface designed for focus and productivity.', icon: CheckCircle2 },
  ];

  const plans = [
    { 
      name: 'Free', 
      price: '0', 
      features: ['3 Projects', '5 Team Members', 'Real-time Sync', 'Standard Support'],
      cta: 'Start for Free',
      link: '/register'
    },
    { 
      name: 'Pro', 
      price: '19', 
      popular: true,
      features: ['Unlimited Projects', 'Unlimited Members', 'Advanced Analytics', 'Priority Support'],
      cta: 'Get Started',
      link: '/register'
    },
    { 
      name: 'Enterprise', 
      price: 'Custom', 
      features: ['SAML/SSO', 'Custom Domains', '24/7 Dedicated Support', 'Audit Logs'],
      cta: 'Contact Sales',
      link: '/contact'
    }
  ];

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-600">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-xl tracking-tight">SaaS PM</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link>
            <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-indigo-50/50 rounded-bl-[100px]" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-6">
              v1.0 is now live 🚀
            </span>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
              Manage your work <br />
              <span className="text-indigo-600">better together.</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-lg mb-10 leading-relaxed font-medium">
              The project management platform for modern teams. Secure, real-time, and beautifully simple. Built to scale with your organization.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/register" className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group">
                Start your workspace
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 border border-slate-200">
                How it works
              </a>
            </div>
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100" />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-500">Joined by 10,000+ organizations globaly</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-4 transform lg:rotate-2 hover:rotate-0 transition-transform duration-700 overflow-hidden">
               <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" alt="Dashboard Preview" className="rounded-xl" />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden md:block animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Plus size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold">New Project Created</p>
                  <p className="text-xs text-slate-400 font-medium">2 seconds ago</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Everything you need to ship.</h2>
            <p className="text-slate-500 font-medium">Powerful features that help your team perform at its best, while staying out of your way.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={f.title}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing.</h2>
          <p className="text-slate-500 font-medium mb-16">Choose the plan that fits your team's needs.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((p, i) => (
              <div 
                key={p.name}
                className={`p-10 rounded-[2.5rem] border flex flex-col items-center relative ${
                  p.popular ? 'border-indigo-600 bg-white ring-4 ring-indigo-50' : 'border-slate-100 bg-slate-50/50'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-4 bg-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-200">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-500 mb-4">{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-bold">$</span>
                  <span className="text-6xl font-black">{p.price}</span>
                  <span className="text-slate-400 font-bold">/mo</span>
                </div>
                <ul className="space-y-4 mb-10 w-full text-left">
                  {p.features.map(feat => (
                    <li key={feat} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link 
                  to={p.link}
                  className={`mt-auto w-full py-4 px-6 rounded-2xl font-bold transition-all ${
                    p.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Ready to boost your team's productivity?</h2>
              <p className="text-indigo-100 text-lg font-medium mb-12 max-w-xl mx-auto">
                Join thousands of teams that use SaaS PM to organize their work and ship faster. No credit card required.
              </p>
              <Link to="/register" className="inline-block bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black text-xl hover:bg-slate-50 transition-all shadow-2xl">
                Get started today — It's free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-bold text-slate-900">SaaS PM</span>
          </div>
          <div className="flex gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Twitter</a>
          </div>
          <p className="text-slate-400 text-sm font-medium">© 2026 SaaS PM. Built with ❤️ for the world.</p>
        </div>
      </footer>
    </div>
  );
}
