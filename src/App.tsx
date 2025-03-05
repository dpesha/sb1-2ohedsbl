import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { StudentList } from './pages/StudentList';
import { StudentForm } from './pages/StudentForm';
import { StudentDetails } from './pages/StudentDetails';
import { StudentCV } from './pages/StudentCV.tsx';
import { Auth } from './pages/Auth';
import { Clients } from './pages/Clients';
import { JobForm } from './pages/JobForm';
import { JobDetails } from './pages/JobDetails';
import { ClientForm } from './pages/ClientForm';
import { ClientDetails } from './pages/ClientDetails';
import { Users } from './pages/Users';
import { Jobs } from './pages/Jobs';
import { Interviews } from './pages/Interviews';
import { InterviewForm } from './pages/InterviewForm';
import { InterviewDetails } from './pages/InterviewDetails';
import { PrivateRoute } from './components/PrivateRoute';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <StudentList />
          </PrivateRoute>
        } />
        <Route path="/student/new" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <StudentForm />
          </PrivateRoute>
        } />
        <Route path="/student/:id" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <StudentDetails />
          </PrivateRoute>
        } />
        <Route path="/student/:id/cv" element={
          <PrivateRoute>
            <StudentCV />
          </PrivateRoute>
        } />
        <Route path="/student/:id/edit" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <StudentForm />
          </PrivateRoute>
        } />
        <Route path="/clients" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <Clients />
          </PrivateRoute>
        } />
        <Route path="/clients/new" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <ClientForm />
          </PrivateRoute>
        } />
        <Route path="/clients/:id" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <ClientDetails />
          </PrivateRoute>
        } />
        <Route path="/clients/:id/edit" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <ClientForm />
          </PrivateRoute>
        } />
        <Route path="/jobs" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <Jobs />
          </PrivateRoute>
        } />
        <Route path="/jobs/new" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <JobForm />
          </PrivateRoute>
        } />
        <Route path="/jobs/:id" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <JobDetails />
          </PrivateRoute>
        } />
        <Route path="/jobs/:id/edit" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <JobForm />
          </PrivateRoute>
        } />
        <Route path="/users" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <Users />
          </PrivateRoute>
        } />
        <Route path="/interviews" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <Interviews />
          </PrivateRoute>
        } />
        <Route path="/interviews/new" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <InterviewForm />
          </PrivateRoute>
        } />
        <Route path="/interviews/:id" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <InterviewDetails />
          </PrivateRoute>
        } />
        <Route path="/interviews/:id/edit" element={
          <PrivateRoute>
            <Header />
            <Navigation />
            <InterviewForm />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
};

export default App;