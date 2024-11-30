import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/security/login';
import Dashboard from './components/routes/dashboard';
import ProtectedRoute from './components/security/protectedRoute';
import ProjectTasks from './components/routes/ProjectTasks';
import ManageEpics from './components/routes/manageEpics';
import ManageUsers from './components/routes/manageUsers';
import ManageProjects from './components/routes/manageProjects';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects/:projectId/tasks" element={<ProjectTasks />} />
          <Route path="/manage-epics" element={<ManageEpics />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/manage-projects" element={<ManageProjects />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;