import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Calendar, MessageSquare, Paperclip, ChevronRight } from 'lucide-react';

export default function SortableTaskCard({ task, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={`kanban-card group ${isDragging ? 'border-2 border-indigo-500 ring-4 ring-indigo-500/10' : ''} active:scale-95 transition-transform`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          task.priority === 'high' ? 'bg-rose-100 text-rose-600' : 
          task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {task.priority}
        </span>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition-all">
          <MoreVertical size={14} className="text-slate-400" />
        </button>
      </div>

      <h4 className="font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h4>
      
      {task.description && (
        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-[11px] font-medium ${
              new Date(task.dueDate) < new Date() ? 'text-rose-500' : ''
            }`}>
              <Calendar size={12} />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          )}
          {(task.commentsCount > 0) && (
            <div className="flex items-center gap-1 text-[11px] font-medium">
              <MessageSquare size={12} />
              {task.commentsCount}
            </div>
          )}
        </div>
        
        {task.assignee && (
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold border-2 border-white">
            {task.assignee.name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
