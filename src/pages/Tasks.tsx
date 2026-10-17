import { useState } from 'react';
import { CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';
import { Button, Input, Modal, PriorityBadge, Select } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Priority, Task, TaskStatus } from '../types';
import { formatDate } from '../utils/date';

export default function Tasks() {
  const { tasks, leads, addTask, updateTask, deleteTask } = useData();
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'All' | TaskStatus>('All');
  const [modalOpen, setModalOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [leadId, setLeadId] = useState('');

  const leadOptions = [
    { value: '', label: 'General Task (No lead)' },
    ...leads.map((l) => ({ value: l.id, label: l.company })),
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
      priority,
      status: 'To Do',
      leadId,
      assigneeId: user?.id || 'u_dinesh',
    });

    toast.success('Task created successfully');
    setModalOpen(false);
    setTitle('');
    setDescription('');
    setDueDate('');
    setLeadId('');
  };

  const handleToggleStatus = (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'Done' ? 'To Do' : 'Done';
    updateTask(task.id, { status: nextStatus });
    toast.info(`Task marked as ${nextStatus}`);
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'All') return true;
    return t.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-navy dark:text-white sm:text-2xl">My Tasks</h1>
          <p className="text-xs text-muted">
            Track action items, follow-up calls, and proposal deliverables.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Task
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-line pb-2">
        {(['All', 'To Do', 'In Progress', 'Done'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === tab
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
                : 'text-muted hover:text-ink'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card p-10 text-center text-xs text-muted">No tasks in this view.</div>
        ) : (
          filteredTasks.map((t) => {
            const isDone = t.status === 'Done';
            const relatedLead = leads.find((l) => l.id === t.leadId);

            return (
              <div
                key={t.id}
                className="card flex items-start justify-between gap-4 p-4 transition hover:border-brand-300"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(t)}
                    className="mt-0.5 text-muted hover:text-brand-600 focus:outline-none"
                    aria-label="Toggle task completion"
                  >
                    <CheckCircle2
                      className={`h-5 w-5 ${
                        isDone ? 'fill-emerald-500 text-white' : 'text-line hover:text-brand-500'
                      }`}
                    />
                  </button>

                  <div>
                    <h3
                      className={`text-sm font-bold text-ink ${
                        isDone ? 'line-through text-muted' : ''
                      }`}
                    >
                      {t.title}
                    </h3>
                    {t.description && (
                      <p className="mt-1 text-xs text-muted">{t.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                      {t.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Due {formatDate(t.dueDate)}
                        </span>
                      )}
                      {relatedLead && (
                        <span className="rounded bg-soft px-1.5 py-0.5 text-ink font-semibold">
                          {relatedLead.company}
                        </span>
                      )}
                      <PriorityBadge priority={t.priority} />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteTask(t.id)}
                  className="rounded-lg p-1.5 text-muted hover:bg-rose-50 hover:text-rose-500 transition"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Prepare deck for ABC Technologies"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label="Description"
            placeholder="Additional context or checklist items"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              options={['Low', 'Medium', 'High']}
            />
          </div>
          <Select
            label="Associated Lead"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            options={leadOptions}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
