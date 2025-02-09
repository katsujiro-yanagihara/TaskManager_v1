import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Check, GripVertical, Edit } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import DateTimePicker from '../components/DateTimePicker';
import { Clock } from 'lucide-react';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [hasTime, setHasTime] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDateTaskId, setEditingDateTaskId] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // キーボードの表示/非表示を検知
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // iOSの場合
      const handleVisualViewportResize = () => {
        const viewport = window.visualViewport;
        const height = viewport ? window.innerHeight - viewport.height : 0;
        setKeyboardHeight(height);
      };

      // Androidの場合
      const handleResize = () => {
        const height = window.innerHeight - document.documentElement.clientHeight;
        setKeyboardHeight(Math.max(0, height));
      };

      window.visualViewport?.addEventListener('resize', handleVisualViewportResize);
      window.addEventListener('resize', handleResize);

      return () => {
        window.visualViewport?.removeEventListener('resize', handleVisualViewportResize);
        window.addEventListener('resize', handleResize);
      };
    }
  }, []);

  const formatDateTime = (dateTime, hasTimeFlag) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const dateStr = format(date, 'yyyy年M月d日(E)', { locale: ja });
    if (!hasTimeFlag) return dateStr;
    return format(date, 'yyyy年M月d日(E) HH:mm', { locale: ja });
  };

  const addTask = (e, dateTime = selectedDateTime, useTime = hasTime) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task = {
      id: Date.now().toString(),
      title: newTask,
      dueDate: dateTime,
      hasTime: useTime,
      completed: false
    };

    setTasks([task, ...tasks]);
    setNewTask('');
    setIsDatePickerOpen(false);
    
    // タスク追加時に一番上にスクロール
    window.scrollTo({
      top: 0,
      behavior: 'smooth'  // スムーズスクロール
    });
  };

  const handleDateTimeSave = (dateTime, useTime) => {
    if (editingDateTaskId) {
      setTasks(tasks.map(task =>
        task.id === editingDateTaskId ? {
          ...task,
          dueDate: dateTime,
          hasTime: useTime
        } : task
      ));
      setEditingDateTaskId(null);
    } else {
      setSelectedDateTime(dateTime);
      setHasTime(useTime);
      const e = new Event('submit');
      e.preventDefault = () => {};
      addTask(e, dateTime, useTime);
    }
    setIsDatePickerOpen(false);
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };
  
  const saveEdit = (taskId) => {
    if (!editingTitle.trim()) return;
    
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, title: editingTitle }
        : task
    ));
    
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm fixed top-0 left-0 right-0 z-10 border-b border-cyan-100">
        <div className="p-4">
          <h1 className="text-xl font-bold text-cyan-900">タスク管理アプリ</h1>
        </div>
      </header>

      <main className="pt-16 pb-24">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="px-4 space-y-2"
              >
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-4 
                          ${snapshot.isDragging ? 'shadow-lg' : ''} 
                          ${task.completed ? 'opacity-75' : ''} 
                          border border-cyan-100`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            {...provided.dragHandleProps}
                            className="mt-1 text-cyan-400 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`mt-1 rounded-full p-1 ${
                              task.completed
                                ? 'bg-cyan-100 text-cyan-500'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <div className="flex-1 min-w-0">
                            {editingTaskId === task.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  className="w-full px-2 py-1 border rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => saveEdit(task.id)}
                                    className="px-2 py-1 text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600"
                                  >
                                    保存
                                  </button>
                                  <button
                                    onClick={() => setEditingTaskId(null)}
                                    className="px-2 py-1 text-sm text-cyan-600 hover:text-cyan-800"
                                  >
                                    キャンセル
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => !task.completed && startEditing(task)}
                                className={`text-cyan-900 ${
                                  task.completed ? 'line-through' : 'cursor-pointer'
                                }`}
                              >
                                {task.title}
                              </div>
                            )}
                            {task.dueDate && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!task.completed) {
                                    setEditingDateTaskId(task.id);
                                    setIsDatePickerOpen(true);
                                  }
                                }}
                                className="text-sm text-cyan-600 mt-1 flex items-center gap-1 cursor-pointer hover:text-cyan-700"
                              >
                                <Calendar className="w-4 h-4" />
                                {formatDateTime(task.dueDate, task.hasTime)}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      <footer 
        className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-lg border-t border-cyan-100"
        style={{ bottom: `${keyboardHeight}px` }}
      >
        <form onSubmit={addTask} className="p-4 pb-8">
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="新しいタスクを入力"
                className="flex-1 px-4 py-2 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-cyan-900"
                autoComplete="off"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg px-4 py-2 
                  hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 flex items-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              disabled={!newTask.trim()}
              className="w-full px-4 py-2 text-left border border-cyan-200 rounded-lg flex items-center gap-2 
                hover:bg-cyan-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar className={`w-4 h-4 ${newTask.trim() ? 'text-cyan-900' : 'text-gray-400'}`} />
              <span className={`${newTask.trim() ? 'text-cyan-900' : 'text-gray-400'}`}>
                {formatDateTime(selectedDateTime, hasTime) || '期日を設定'}
              </span>
            </button>
          </div>
        </form>
      </footer>

      {isDatePickerOpen && (
        <DateTimePicker
          initialDateTime={editingDateTaskId 
            ? tasks.find(t => t.id === editingDateTaskId)?.dueDate
            : selectedDateTime}
          onSave={handleDateTimeSave}
          onClose={() => {
            setIsDatePickerOpen(false);
            setEditingDateTaskId(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskManager;