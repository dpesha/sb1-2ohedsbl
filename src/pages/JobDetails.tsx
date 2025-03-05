import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Briefcase, ArrowLeft, Edit, Building2, MapPin, Users, Calendar, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Job } from '../types/job';
import type { Client } from '../types/client';
import type { JobCandidate, EligibleStudent } from '../types/jobCandidate';

const statusColors = {
  open: 'bg-green-100 text-green-800',
  filled: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  candidates_selected: 'bg-purple-100 text-purple-800',
  interview_scheduled: 'bg-indigo-100 text-indigo-800'
};

const statusLabels = {
  open: 'Open',
  filled: 'Filled',
  cancelled: 'Cancelled',
  on_hold: 'On Hold',
  candidates_selected: 'Candidates Selected',
  interview_scheduled: 'Interview Scheduled'
};

export const JobDetails: React.FC = () => {
  const { id } = useParams();
  const [job, setJob] = useState<(Job & { client: Client }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eligibleStudents, setEligibleStudents] = useState<EligibleStudent[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<EligibleStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewData, setInterviewData] = useState({
    date: '',
    time: '',
    location: '',
    type: 'online' as const,
    notes: ''
  });

  useEffect(() => {
    fetchJob();
    if (id) {
      fetchEligibleStudents();
      fetchSelectedStudents();
    }
  }, [id]);

  const fetchEligibleStudents = async () => {
    if (!id) return;
    
    try {
      setLoadingStudents(true);
      const { data, error } = await supabase
        .rpc('get_eligible_students', { p_job_id: id });

      if (error) throw error;
      setEligibleStudents(data || []);
    } catch (err) {
      console.error('Error fetching eligible students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchSelectedStudents = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('job_candidates')
        .select(`
          *,
          student:student_id (
            id,
            personal_info,
            resume
          )
        `)
        .eq('job_id', id);

      if (error) throw error;
      
      const selectedStudents = data?.map(candidate => ({
        id: candidate.student.id,
        personal_info: candidate.student.personal_info,
        resume: candidate.student.resume,
        enrollment: null
      })) || [];

      setSelectedStudents(selectedStudents);
    } catch (err) {
      console.error('Error fetching selected students:', err);
    }
  };

  const handleSelectStudent = async (student: EligibleStudent) => {
    try {
      const { error } = await supabase
        .from('job_candidates')
        .insert({
          job_id: id,
          student_id: student.id,
          status: 'pending'
        });

      if (error) throw error;

      // Refresh lists
      await Promise.all([
        fetchEligibleStudents(),
        fetchSelectedStudents()
      ]);
    } catch (err) {
      console.error('Error selecting student:', err);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('job_candidates')
        .delete()
        .eq('job_id', id)
        .eq('student_id', studentId);

      if (error) throw error;

      // Refresh lists
      await Promise.all([
        fetchEligibleStudents(),
        fetchSelectedStudents()
      ]);
    } catch (err) {
      console.error('Error removing student:', err);
    }
  };

  const fetchJob = async () => {
    try {
      if (!id) return;

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:client_id (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (err) {
      console.error('Error fetching job:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch job');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    try {
      if (!id || !interviewData.date || !interviewData.time || !interviewData.location) {
        throw new Error('Please fill in all required fields');
      }

      // Create the interview
      const { data: interview, error: interviewError } = await supabase
        .from('interviews')
        .insert([{
          job_id: id,
          date: interviewData.date,
          time: interviewData.time,
          location: interviewData.location,
          type: interviewData.type,
          status: 'scheduled',
          notes: interviewData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (interviewError) throw interviewError;

      // Update job candidates with interview_id
      const { error: updateError } = await supabase
        .from('job_candidates')
        .update({ interview_id: interview.id })
        .eq('job_id', id);

      if (updateError) throw updateError;

      // Update job status
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ 
          status: 'interview_scheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (jobError) throw jobError;

      // Reset form and refresh data
      setShowInterviewForm(false);
      setInterviewData({
        date: '',
        time: '',
        location: '',
        type: 'online',
        notes: ''
      });
      fetchJob();
    } catch (err) {
      console.error('Error scheduling interview:', err);
      setError(err instanceof Error ? err.message : 'Failed to schedule interview');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <Link to="/jobs" className="text-blue-500 hover:underline">
            Return to Jobs List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              to="/jobs"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Jobs
            </Link>
          </div>
          <Link
            to={`/jobs/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-blue text-white rounded-md hover:opacity-90 transition-opacity"
          >
            <Edit className="w-5 h-5" />
            Edit Job
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <Briefcase className="w-16 h-16 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {job.accepting_organization}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[job.status]
                  }`}>
                    {statusLabels[job.status]}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-gray-500">
                  <Users className="w-5 h-5" />
                  <span>{job.position_count} position{job.position_count !== 1 ? 's' : ''}</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">{job.work_location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Client Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <Link
                      to={`/clients/${job.client.id}`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {job.client.company_name}
                    </Link>
                  </div>
                  {job.client.industry && (
                    <div className="text-gray-600 ml-7">
                      {job.client.industry}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Job Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>Last Updated: {new Date(job.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Candidates Section */}
          <div className="p-6 border-t">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Candidates</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Eligible Students */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Eligible Students
                </h3>
                {loadingStudents ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : eligibleStudents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No eligible students found
                  </p>
                ) : (
                  <div className="space-y-2">
                    {eligibleStudents.map(student => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {student.personal_info.firstName} {student.personal_info.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.resume.firstNameKana} {student.resume.lastNameKana}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.enrollment.school}
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectStudent(student)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Students */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Selected Students
                </h3>
                {selectedStudents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No students selected yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedStudents.map(student => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {student.personal_info.firstName} {student.personal_info.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.resume.firstNameKana} {student.resume.lastNameKana}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(student.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interview Scheduling */}
              {selectedStudents.length > 0 && !showInterviewForm && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowInterviewForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-blue text-white rounded-md hover:opacity-90 transition-opacity"
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule Interview
                  </button>
                </div>
              )}

              {showInterviewForm && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Interview</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={interviewData.date}
                          onChange={(e) => setInterviewData(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time *
                        </label>
                        <input
                          type="time"
                          value={interviewData.time}
                          onChange={(e) => setInterviewData(prev => ({ ...prev, time: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={interviewData.location}
                        onChange={(e) => setInterviewData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Interview location or meeting link"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={interviewData.type}
                        onChange={(e) => setInterviewData(prev => ({ ...prev, type: e.target.value as 'online' | 'offline' | 'hybrid' }))}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={interviewData.notes}
                        onChange={(e) => setInterviewData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Additional notes about the interview..."
                      />
                    </div>

                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setShowInterviewForm(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleScheduleInterview}
                        className="px-6 py-2 bg-gradient-blue text-white rounded-md hover:opacity-90 transition-opacity"
                      >
                        Schedule Interview
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};