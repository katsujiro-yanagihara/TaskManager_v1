import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Plus, Trash2, Calendar, Check, GripVertical, Edit, LogOut } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import DateTimePicker from '../components/DateTimePicker';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';

const TaskManager = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDateTaskId, setEditingDateTaskId] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [loading, setLoading] = useState(true);

  // タスクの取得
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      alert('タスクの読み込みに失敗しました。ページを更新してください。');
    } finally {
      setLoading(false);
    }
  };

  // キーボードの表示/非表示を検知
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleVisualViewportResize = () => {
        const viewport = window.visualViewport;
        const height = viewport ? window.innerHeight - viewport.height : 0;
        setKeyboardHeight(height);
      };

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
    if (!dateTime || dateTime === 'Invalid Date') return '';
    const date = new Date(dateTime);
    
    const options = {
      locale: ja,
      timeZone: 'Asia/Tokyo'  // タイムゾーンを追加
    };
  
    const dateStr = format(date, 'yyyy年M月d日(E)', options);
    if (!hasTimeFlag) return dateStr;
    return format(date, 'yyyy年M月d日(E) HH:mm', options);
  };
  
  const addTask = async (e = null, dateTime = null, hasTime = false) => {
    if (e) e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const task = {
        title: newTask.trim(),
        due_date: dateTime || null,
        has_time: hasTime || false,
        completed: false
      };

      console.log('Creating task:', task); // デバッグ用

      const createdTask = await api.createTask(task);
      if (createdTask) {
        setTasks(prevTasks => [createdTask, ...prevTasks]);
        setNewTask('');
        setIsDatePickerOpen(false);
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('タスクの作成に失敗しました。もう一度お試しください。');
    }
  };

  const handleDateTimeSave = async (dateTime, useTime) => {
    try {
      if (editingDateTaskId) {
        // 既存タスクの期日更新
        const updatedTask = await api.updateTask(editingDateTaskId, {
          due_date: dateTime || null,
          has_time: useTime || false
        });
        if (updatedTask) {
          setTasks(prevTasks => prevTasks.map(task =>
            task.id === editingDateTaskId ? updatedTask : task
          ));
        }
      } else {
        // 新規タスク作成（期日付き）
        await addTask(null, dateTime, useTime);
      }
    } catch (error) {
      console.error('Failed to handle task:', error);
      alert('タスクの更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsDatePickerOpen(false);
      setEditingDateTaskId(null);
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };
  
  const saveEdit = async (taskId) => {
    if (!editingTitle.trim()) return;
    
    try {
      const updatedTask = await api.updateTask(taskId, { title: editingTitle.trim() });
      if (updatedTask) {
        setTasks(prevTasks => prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        ));
        setEditingTaskId(null);
        setEditingTitle('');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('タスクの更新に失敗しました。もう一度お試しください。');
    }
  };

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const updatedTask = await api.updateTask(taskId, { 
        completed: !task.completed 
      });
      if (updatedTask) {
        setTasks(prevTasks => prevTasks.map(t =>
          t.id === taskId ? updatedTask : t
        ));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('タスクの更新に失敗しました。もう一度お試しください。');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('タスクの削除に失敗しました。もう一度お試しください。');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Failed to logout:', error);
      alert('ログアウトに失敗しました。ページを更新してください。');
    }
  };

  useEffect(() => {
    // URLのクエリパラメータからエラーを確認
    const error = router.query.error;
    if (error === 'auth_callback_error') {
      alert('認証に失敗しました。もう一度お試しください。');
    } else if (error === 'session_error') {
      alert('セッションの取得に失敗しました。もう一度ログインしてください。');
    }
  }, [router.query]);

  if (!user) {
    return (
      <>
        {router.query.email_confirmed === 'true' && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-lg shadow-lg">
              メールアドレスが確認されました。ログインしてください。
            </div>
          </div>
        )}
        <AuthForm />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm fixed top-0 left-0 right-0 z-10 border-b border-cyan-100">
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-cyan-900">タスク管理アプリ</h1>
          <button
            onClick={handleLogout}
            className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">ログアウト</span>
          </button>
        </div>
      </header>

      <main className="pt-16 pb-24">
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-cyan-600">読み込み中...</div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="px-4 space-y-2"
                >
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
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
                              {task.due_date && (
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
                                  {formatDateTime(task.due_date, task.has_time)}
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
        )}
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
              onClick={() => newTask.trim() && setIsDatePickerOpen(true)}
              className={`w-full px-4 py-2 text-left border border-cyan-200 rounded-lg flex items-center gap-2 
                ${newTask.trim() ? 'hover:bg-cyan-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                transition-colors`}
            >
              <Calendar className={`w-4 h-4 ${newTask.trim() ? 'text-cyan-900' : 'text-gray-400'}`} />
              <span className={`${newTask.trim() ? 'text-cyan-900' : 'text-gray-400'}`}>
                {'期日を設定'}
              </span>
            </button>
          </div>
        </form>
      </footer>

      {isDatePickerOpen && (
        <DateTimePicker
          initialDateTime={editingDateTaskId 
            ? tasks.find(t => t.id === editingDateTaskId)?.due_date
            : null}
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
