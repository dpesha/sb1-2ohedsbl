import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Briefcase, ArrowLeft, Edit, Building2, MapPin, Users, Calendar, Video, UserCheck } from 'lucide-react';
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

const JobDetails: React.FC = () => {
  const { id } = useParams();
  const [job, setJob] = useState<(Job & { client: Client }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eligibleStudents, setEligibleStudents] = useState<EligibleStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [activeTab, setActiveTab] = useState<'candidates' | 'results'>('candidates');
  const [candidates, setCandidates] = useState<(JobCandidate & { student: EligibleStudent })[]>([]);

  useEffect(() => {
    fetchJob();
    if (id) {
      fetchEligibleStudents();
      fetchCandidates();
    }
  }, [id]);

  const fetchCandidates = async () => {
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
      setCandidates(data || []);
      
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  };

  const handleUpdateCandidateStatus = async (candidateId: string, status: JobCandidate['status']) => {
    try {
      const { error } = await supabase
        .from('job_candidates')
        .update({ status })
        .eq('id', candidateId);

      if (error) throw error;
      await fetchCandidates();
    } catch (err) {
      console.error('Error updating candidate status:', err);
    }
  };

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

      // Refresh all necessary data
      await fetchEligibleStudents();
      await fetchCandidates();
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

      // Refresh all necessary data
      await fetchEligibleStudents();
      await fetchCandidates();
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
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {job.category}
                    </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[job.status]
                  }`}>
                    {statusLabels[job.status]}
                  </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-gray-500">
                  <Users className="w-5 h-5" />
                  <div>
                    <span>{job.position_count} position{job.position_count !== 1 ? 's' : ''}</span>
                    <span className="mx-1">•</span>
                    <span>requires {job.candidates_min_count} candidate{job.candidates_min_count !== 1 ? 's' : ''}</span>
                    <span className="mx-1">•</span>
                    <span>{candidates.length} candidate{candidates.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">{job.work_location}</span>
                  {job.preferred_gender !== 'no preference' && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-gray-600 capitalize">{job.preferred_gender}</span>
                    </>
                  )}
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
                  {job.interview_date && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>Interview Date: {new Date(job.interview_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab('candidates')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${
                      activeTab === 'candidates'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Candidates
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${
                      activeTab === 'results'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Interview Results
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {activeTab === 'candidates' && <div className="grid grid-cols-2 gap-6">
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
                            {student.resume.jobCategory}
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
                {candidates.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No students selected yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {candidates.map(candidate => (
                      <div
                        key={candidate.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {candidate.student.personal_info.firstName} {candidate.student.personal_info.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {candidate.student.resume.firstNameKana} {candidate.student.resume.lastNameKana}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(candidate.student.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>}

            {activeTab === 'results' && (
              <div className="space-y-4">
                {candidates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No candidates selected yet
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Candidate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Interview Result
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {candidates.map((candidate) => (
                          <tr key={candidate.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {candidate.student.personal_info.firstName} {candidate.student.personal_info.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {candidate.student.resume.firstNameKana} {candidate.student.resume.lastNameKana}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {candidate.student.resume.jobCategory}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateCandidateStatus(candidate.id, 'passed')}
                                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                                    candidate.status === 'passed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >Pass</button>
                                <button
                                  onClick={() => handleUpdateCandidateStatus(candidate.id, 'failed')}
                                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                                    candidate.status === 'failed' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >Fail</button>
                                <button
                                  onClick={() => handleUpdateCandidateStatus(candidate.id, 'didnot_participate')}
                                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                                    candidate.status === 'didnot_participate' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >No Show</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;