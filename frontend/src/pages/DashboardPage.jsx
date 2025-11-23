import { useState } from 'react';
import { Plus, Search, CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatsCard from '../components/todos/StatsCard';
import EmptyState from '../components/todos/EmptyState';

function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch todos
  const { data: todosData, isLoading, isError, error } = useTodos({
    page: 1,
    page_size: 20,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const todos = todosData?.todos || [];
  const totalCount = todosData?.pagination?.total || 0;

  // Calculate stats
  const stats = {
    total: totalCount,
    completed: 0, // All uncompleted todos are shown, so completed count is not available
    highPriority: todos.filter(t => t.priority === 'high').length,
    dueSoon: todos.filter(t => {
      const dueDate = new Date(t.due_date);
      const today = new Date();
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    }).length,
  };

  const handleCreateTodo = () => {
    setShowCreateModal(true);
    // Will implement create modal in next chunk
    console.log('Create todo clicked');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your tasks and stay productive
          </p>
        </div>
        <Button onClick={handleCreateTodo} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          New Todo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Todos"
          value={stats.total}
          icon={ListTodo}
          description="Active tasks"
        />
        <StatsCard
          title="High Priority"
          value={stats.highPriority}
          icon={AlertCircle}
          description="Needs attention"
          className="border-orange-200"
        />
        <StatsCard
          title="Due Soon"
          value={stats.dueSoon}
          icon={Clock}
          description="Next 3 days"
          className="border-blue-200"
        />
        <StatsCard
          title="Completed Today"
          value={0}
          icon={CheckCircle2}
          description="Great progress!"
          className="border-green-200"
        />
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            All
          </Button>
          <Button variant="ghost" size="sm">
            Today
          </Button>
          <Button variant="ghost" size="sm">
            Upcoming
          </Button>
        </div>
      </div>

      {/* Todos List / Empty State */}
      <div className="bg-card border rounded-lg">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-4">Loading todos...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-destructive font-medium">Failed to load todos</p>
            <p className="text-muted-foreground text-sm mt-1">{error?.message}</p>
          </div>
        ) : todos.length === 0 ? (
          <EmptyState onCreateClick={handleCreateTodo} />
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Your Todos ({totalCount})
              </h2>
              <div className="text-sm text-muted-foreground">
                Showing {todos.length} of {totalCount}
              </div>
            </div>
            
            {/* Placeholder for todo items - will implement in next chunk */}
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{todo.title}</h3>
                      {todo.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {todo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {new Date(todo.due_date).toLocaleDateString()}
                        </span>
                        {todo.priority && (
                          <span className={`px-2 py-0.5 rounded-full font-medium ${
                            todo.priority === 'high' ? 'bg-red-100 text-red-700' :
                            todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {todo.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;