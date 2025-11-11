import { useState } from 'react';
import { useTodos, useCreateTodo, useCompleteTodo } from '../hooks/useTodos';
import { useLogin } from '../hooks/useAuth';

function QueryTest() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [todoTitle, setTodoTitle] = useState('');

  // Auth mutations
  const loginMutation = useLogin();

  // Todo queries and mutations
  const { data: todosData, isLoading, isError, error, refetch } = useTodos({
    page: 1,
    page_size: 5,
  });
  const createTodoMutation = useCreateTodo();
  const completeTodoMutation = useCompleteTodo();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ username, password });
      alert('Login successful!');
      // Refetch todos after login
      refetch();
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();
    if (!todoTitle.trim()) return;

    try {
      await createTodoMutation.mutateAsync({
        title: todoTitle,
        due_date: new Date().toISOString().split('T')[0],
      });
      setTodoTitle('');
      alert('Todo created!');
    } catch (error) {
      alert(`Failed to create todo: ${error.message}`);
    }
  };

  const handleCompleteTodo = async (id) => {
    if (confirm('Mark this todo as complete? It will be deleted.')) {
      try {
        await completeTodoMutation.mutateAsync(id);
        alert('Todo completed and deleted!');
      } catch (error) {
        alert(`Failed to complete todo: ${error.message}`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">React Query Test</h2>

      {/* Login Form */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">1. Login First</h3>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      {/* Create Todo Form */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">2. Create Todo</h3>
        <form onSubmit={handleCreateTodo} className="space-y-3">
          <input
            type="text"
            placeholder="Todo title"
            value={todoTitle}
            onChange={(e) => setTodoTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <button
            type="submit"
            disabled={createTodoMutation.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {createTodoMutation.isPending ? 'Creating...' : 'Create Todo'}
          </button>
        </form>
      </div>

      {/* Todos List */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">3. Your Todos</h3>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Refresh
          </button>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading todos...</p>}
        
        {isError && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            Error: {error.message}
          </div>
        )}

        {todosData && (
          <>
            <p className="text-sm text-muted-foreground mb-3">
              Total: {todosData.pagination.total} todos
            </p>
            
            {todosData.todos.length === 0 ? (
              <p className="text-muted-foreground">No todos yet. Create one above!</p>
            ) : (
              <ul className="space-y-2">
                {todosData.todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{todo.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {todo.due_date}
                        {todo.priority && ` • Priority: ${todo.priority}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCompleteTodo(todo.id)}
                      disabled={completeTodoMutation.isPending}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Complete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Query Status */}
      <div className="bg-card border rounded-lg p-4">
        <h4 className="font-semibold mb-2">Query Status:</h4>
        <div className="text-sm space-y-1">
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Error: {isError ? 'Yes' : 'No'}</p>
          <p>Has Data: {todosData ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}

export default QueryTest;