import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { StudentRegistration } from '../types/student'
import { useAuth } from './AuthContext';

type StudentContextType = {
  students: (StudentRegistration & { id: string })[];
  loading: boolean;
  error: string | null;
  refreshStudents: () => Promise<void>;
};

const StudentContext = createContext<StudentContextType>({
  students: [],
  loading: false,
  error: null,
  refreshStudents: async () => {},
});

export const useStudents = () => useContext(StudentContext);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<(StudentRegistration & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setStudents([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      if (!data) {
        setStudents([]);
        return;
      }

      const formattedStudents = data.map(student => {
        return {
          id: student.id,
          status: student.status,
          personalInfo: student.personal_info,
          familyMembers: student.family_members || [],
          identityDocument: student.identity_document || {},
          emergencyContact: student.emergency_contact || {},
          education: student.education || [],
          workExperience: student.work_experience || [],
          certificates: student.certificates || [],
          resume: student.resume || {},
          enrollment: student.enrollment || {}
        };
      });

      setStudents(formattedStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user?.id, user]); // Re-fetch when user changes

  useEffect(() => {
    const subscription = supabase
      .channel('students_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'students'
      }, () => {
        fetchStudents();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <StudentContext.Provider value={{ students, loading, error, refreshStudents: fetchStudents }}>
      {children}
    </StudentContext.Provider>
  );
};