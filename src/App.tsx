import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { StudentList } from './pages/StudentList';
import { StudentForm } from './pages/StudentForm';
import { StudentDetails } from './pages/StudentDetails';
import { Auth } from './pages/Auth';
import { PrivateRoute } from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<PrivateRoute><StudentList /></PrivateRoute>} />
      <Route path="/student/new" element={<PrivateRoute><StudentForm /></PrivateRoute>} />
      <Route path="/student/:id" element={<PrivateRoute><StudentDetails /></PrivateRoute>} />
      <Route path="/student/:id/edit" element={<PrivateRoute><StudentForm /></PrivateRoute>} />
    </Routes>
  );
}

export default App;