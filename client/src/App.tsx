import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/ThemeProvider";

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);


//components/ThemeProvider.js
import React, { useState, createContext, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div className={darkMode ? 'dark-mode' : 'light-mode'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};

//components/DarkModeToggle.js
import React from 'react';
import { useTheme } from './ThemeProvider';

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button onClick={toggleDarkMode}>
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default DarkModeToggle;


// Update App.js to include the toggle
import { Switch, Route } from 'wouter';
import Dashboard from '@/pages/dashboard';
import WorkflowEditor from '@/pages/workflow-editor';
import ExecutionHistory from '@/pages/execution-history';
import Layout from '@/components/Layout';
import { Toaster } from '@/components/ui/toast';
import NotFound from '@/pages/not-found';

// DarkModeToggle component
const DarkModeToggle2 = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {theme === "dark" ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

// Main App component
function App() {
  return (
    <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/workflows/:id" component={WorkflowEditor} />
          <Route path="/workflows/new" component={WorkflowEditor} />
          <Route path="/history" component={ExecutionHistory} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
        <DarkModeToggle />
    </Layout>
  );
}

export default App;