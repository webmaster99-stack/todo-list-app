import { useState } from 'react';
import { authAPI, todoAPI } from "../Lib/api"

function ApiTest() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [testResults, setTestResults] = useState([]);

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message }]);
  };

  const runTests = async () => {
    setStatus('running');
    setMessage('Running API tests...');
    setTestResults([]);

    try {
      // Test 1: Health check
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`);
        const data = await response.json();
        addResult('Health Check', true, `Status: ${data.status}`);
      } catch (error) {
        addResult('Health Check', false, error.message);
      }

      // Test 2: Register (will fail if user exists, that's ok)
      try {
        const testUsername = `test_${Date.now()}`;
        await authAPI.register(testUsername, 'TestPass123');
        addResult('Register', true, 'User registered successfully');
      } catch (error) {
        addResult('Register', false, error.message);
      }

      // Test 3: Login with invalid credentials
      try {
        await authAPI.login('nonexistent', 'wrongpass');
        addResult('Login (invalid)', false, 'Should have failed');
      } catch (error) {
        addResult('Login (invalid)', true, 'Correctly rejected invalid credentials');
      }

      setStatus('complete');
      setMessage('API tests complete!');
    } catch (error) {
      setStatus('error');
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">API Connection Test</h2>
      
      <div className="bg-card border rounded-lg p-4 mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          API Base URL: <code className="bg-muted px-2 py-1 rounded">{import.meta.env.VITE_API_BASE_URL}</code>
        </p>
        <button
          onClick={runTests}
          disabled={status === 'running'}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {status === 'running' ? 'Running Tests...' : 'Run API Tests'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          status === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-muted'
        }`}>
          {message}
        </div>
      )}

      {testResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-3 rounded-lg border ${
                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                {result.success ? '✓' : '✗'}
              </span>
              <div className="flex-1">
                <div className="font-medium">{result.test}</div>
                <div className="text-sm text-muted-foreground">{result.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ApiTest;