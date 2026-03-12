import { getAISuggestions } from '../services/aiService';
import { Sparkles, Loader2 } from 'lucide-react';

export default function TaskForm({ onSubmit, initialData = {}, loading }) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    priority: initialData.priority || 'medium',
    status: initialData.status || 'todo',
    dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
    subtasks: initialData.subtasks || []
  });

  const [aiLoading, setAiLoading] = useState(false);

  const handleAIHelp = async () => {
    if (!formData.title.trim()) return alert('Please enter a title first');
    setAiLoading(true);
    try {
      const res = await getAISuggestions(formData.title);
      const { description, subtasks } = res.data.data;
      setFormData(prev => ({
        ...prev,
        description: description || prev.description,
        subtasks: subtasks.map(s => typeof s === 'string' ? { title: s, isCompleted: false } : s)
      }));
    } catch (err) {
      console.error('AI Suggestion Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
          Task Title
        </label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Design System Audit"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all font-medium"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 ml-1">
          <label className="block text-sm font-bold text-slate-700">
            Description
          </label>
          <button
            type="button"
            onClick={handleAIHelp}
            disabled={aiLoading}
            className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-all"
          >
            {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI MAGIC
          </button>
        </div>
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          placeholder="What needs to be done?"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all font-medium"
        />
      </div>

      {formData.subtasks?.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">AI Suggested Subtasks</h4>
           <div className="space-y-2">
             {formData.subtasks.map((s, i) => (
               <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                 {s.title}
               </div>
             ))}
           </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all font-bold text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all font-bold text-sm"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-4 px-6 text-base font-bold shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {loading ? 'Processing...' : initialData._id ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
