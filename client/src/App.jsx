import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';

// Lazy loaded pages for optimal performance and fast scaling
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Screens = lazy(() => import('./pages/Screens'));
const Locations = lazy(() => import('./pages/Locations'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const Creatives = lazy(() => import('./pages/Creatives'));
const Clients = lazy(() => import('./pages/Clients'));
const Reports = lazy(() => import('./pages/Reports'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Billing = lazy(() => import('./pages/Billing'));
const Users = lazy(() => import('./pages/Users'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Support = lazy(() => import('./pages/Support'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-gray-400 font-medium tracking-wide">Loading module...</p>
    </div>
  </div>
);

export default function App() {
  // Check localStorage to keep user logged in on page refresh
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cms_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('cms_auth_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cms_auth_user');
  };

  // If user is not authenticated, render Login Page exclusively
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-[#0b0f19] text-gray-200 font-sans overflow-hidden">
        
        {/* Sidebar with Smooth Animation */}
        <Sidebar isOpen={isSidebarOpen} onLogout={handleLogout} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto transition-all duration-300">
          <Header onToggleSidebar={toggleSidebar} user={currentUser} onLogout={handleLogout} />
          
          <div className="p-8 flex-1 overflow-x-hidden">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/screens" element={<Screens />} />
                <Route path="/locations" element={<Locations />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/creatives" element={<Creatives />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/users" element={<Users />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/support" element={<Support />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </div>

      </div>
    </Router>
  );
}