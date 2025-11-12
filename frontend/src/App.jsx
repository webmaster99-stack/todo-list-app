import ZustandTest from './components/ZustandTest'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Todo List Application
        </h1>
        
        <ZustandTest />
      </div>
    </div>
  )
}

export default App