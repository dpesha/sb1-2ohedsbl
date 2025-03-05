import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Edit, Building2, MapPin, Clock, Video, Users2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { InterviewWithDetails } from '../types/interview';

const typeColors = {
  online: 'bg-green-100 text-green-800',
  offline: 'bg-blue-100 text-blue-800',
  hybrid: 'bg-purple-100 text-purple-800'
};

const statusColors = {
  scheduled: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export const InterviewDetails: React.FC = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState<InterviewWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInterview();
  }, [id]);

  const fetchInterview = async () => {
    try {
      if (!id) return;

      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          job:job_id (
            id,
            accepting_organization,
            category,
            client:client_id (
              id,
              company_name
            )
          ),
          candidates:job_candidates (
            id,
            student:student_id (
              id,
              personal_info,
              resume
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setInterview(data);
    } catch (err) {
      console.error('Error fetching interview:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch interview');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Not Found</h2>
          <Link to="/interviews" className="text-blue-500 hover:underline">
            Return to Interviews List
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
              to="/interviews"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Interviews
            </Link>
          </div>
          <Link
            to={`/interviews/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-blue text-white rounded-md hover:opacity-90 transition-opacity"
          >
            <Edit className="w-5 h-5" />
            Edit Interview
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <Calendar className="w-16 h-16 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {interview.job.accepting_organization}
                    </h1>
                    <div className="text-gray-500">
                      {interview.job.client.company_name}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[interview.status]
                  }`}>
                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(interview.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(interview.time)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{interview.location}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    typeColors[interview.type]
                  }`}>
                    <Video className="w-3 h-3" />
                    {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Candidates</h2>
              <div className="space-y-4">
                {interview.candidates.map(candidate => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {candidate.student.personal_info.firstName} {candidate.student.personal_info.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {candidate.student.resume.firstNameKana} {candidate.student.resume.lastNameKana}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {candidate.student.personal_info.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {interview.notes && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{interview.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};