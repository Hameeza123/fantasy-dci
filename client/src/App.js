import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leagues from './pages/Leagues';
import LeagueDetail from './pages/LeagueDetail';
import CreateLeague from './pages/CreateLeague';
import Draft from './pages/Draft';
import Corps from './pages/Corps';
import Profile from './pages/Profile';
import LoadingSpinner from './components/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/leagues" 
            element={
              <PrivateRoute>
                <Leagues />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/leagues/create" 
            element={
              <PrivateRoute>
                <CreateLeague />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/leagues/:leagueId" 
            element={
              <PrivateRoute>
                <LeagueDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/draft/:draftId" 
            element={
              <PrivateRoute>
                <Draft />
              </PrivateRoute>
            } 
          />
          <Route path="/corps" element={<Corps />} />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
};

export default App; 