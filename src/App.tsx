import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/dashboard';
import { OperationDetails } from './pages/operation-details';
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="red-team-theme">
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/operations/:id" element={<OperationDetails />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;