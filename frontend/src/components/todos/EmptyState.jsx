import { FileText, Plus } from 'lucide-react';
import Button from '../ui/Button';

function EmptyState({ onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No todos yet
      </h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Get started by creating your first todo. Stay organized and track your tasks efficiently.
      </p>
      <Button onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        Create your first todo
      </Button>
    </div>
  );
}

export default EmptyState;