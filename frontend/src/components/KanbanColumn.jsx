import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Plus } from 'lucide-react';
import SortableTaskCard from './SortableTaskCard';

export default function KanbanColumn({ board, tasks, onAddTask, onTaskClick }) {
  const { setNodeRef } = useDroppable({
    id: board._id,
  });

  return (
    <div className="kanban-column">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800">{board.title}</h3>
          <span className="bg-slate-200 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {tasks.length}
          </span>
        </div>
        <button className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 flex flex-col gap-3 min-h-[150px]">
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task._id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>

      <button 
        onClick={onAddTask}
        className="mt-4 flex items-center justify-center gap-2 w-full p-2.5 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
      >
        <Plus size={14} />
        Add Task
      </button>
    </div>
  );
}
