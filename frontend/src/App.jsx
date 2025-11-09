import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Todo List Application
          </h1>
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <p className="text-muted-foreground">
              Frontend setup complete! Tailwind CSS and shadcn/ui ready.
            </p>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Primary Button
              </button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
                Secondary Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App