import ApiTest from './components/ApiTest'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Todo List Application
          </h1>
          
          <ApiTest />
        </div>
      </div>
    </div>
  )
}

export default App