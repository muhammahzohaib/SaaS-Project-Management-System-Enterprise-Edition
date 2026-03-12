import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Calendar, MessageSquare, Paperclip } from 'lucide-react';
import SortableTaskCard from './SortableTaskCard';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard({ boards, tasksByBoard, onTaskMove, onAddTask, onTaskClick }) {
  const [activeTask, setActiveTask] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = Object.values(tasksByBoard).flat().find(t => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      onTaskMove(activeId, overId);
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[calc(100vh-250px)] scrollbar-hide">
        {boards.map((board) => (
          <KanbanColumn 
            key={board._id} 
            board={board} 
            tasks={tasksByBoard[board._id] || []} 
            onAddTask={() => onAddTask(board._id)}
            onTaskClick={onTaskClick}
          />
        ))}

        {/* Add New List Button */}
        <button className="h-fit min-w-[320px] p-4 flex items-center gap-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all font-semibold">
          <Plus size={20} />
          Add Another List
        </button>
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeTask ? (
          <div className="kanban-card opacity-90 rotate-2 shadow-2xl border-indigo-500">
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                activeTask.priority === 'critical' ? 'bg-rose-600 text-white' :
                activeTask.priority === 'high' ? 'bg-rose-100 text-rose-600' : 
                activeTask.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {activeTask.priority}
              </span>
              <MoreVertical size={16} className="text-slate-400" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-snug">{activeTask.title}</h4>
            <div className="mt-4 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-3">
                 {activeTask.dueDate && (
                  <div className="flex items-center gap-1 text-[11px] font-medium">
                    <Calendar size={12} />
                    {new Date(activeTask.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                )}
                <div className="flex items-center gap-1 text-[11px] font-medium">
                  <MessageSquare size={12} />
                  {activeTask.commentsCount || 0}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
