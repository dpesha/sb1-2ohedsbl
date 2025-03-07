import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, Eye, Edit, Building2, MapPin, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Job } from '../types/job';
import type { Client } from '../types/client';
import { Link } from 'react-router-dom';

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

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<(Job & { client: Client })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateCounts, setCandidateCounts] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchCandidateCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('job_candidates')
          .select('job_id');

        if (error) throw error;

        const counts = (data || []).reduce((acc, candidate) => {
          acc[candidate.job_id] = (acc[candidate.job_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setCandidateCounts(counts);
      } catch (err) {
        console.error('Error fetching candidate counts:', err);
      }
    };

    fetchCandidateCounts();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:client_id (
            id,
            company_name,
            industry
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const searchLower = searchTerm.toLowerCase();
    return (
      job.accepting_organization.toLowerCase().includes(searchLower) ||
      job.work_location.toLowerCase().includes(searchLower) ||
      job.category.toLowerCase().includes(searchLower) ||
      job.client.company_name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          </div>
          <Link
            to="/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-blue text-white rounded-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add New Job
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading jobs...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {!loading && !error && filteredJobs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No jobs found</p>
              </div>
            )}

            {!loading && !error && filteredJobs.length > 0 && (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {job.accepting_organization}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div className="text-sm text-gray-500">
                            {job.interview_date && (
                              <>
                                <span>Interview: {new Date(job.interview_date).toLocaleDateString()}</span>
                                <span className="mx-1">•</span>
                              </>
                            )}
                            <span>{job.position_count} position{job.position_count !== 1 ? 's' : ''}</span>
                            <span className="mx-1">•</span>
                           <span>requires {job.candidates_min_count} candidate{job.candidates_min_count !== 1 ? 's' : ''}</span>
                            <span className="mx-1">•</span>
                            <span>{candidateCounts[job.id] || 0} candidate{(candidateCounts[job.id] || 0) !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {job.client.company_name}
                          </span>
                        </div>
                        {job.client.industry && (
                          <div className="text-sm text-gray-500 mt-1">
                            {job.client.industry}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {job.work_location}
                            {job.preferred_gender !== 'no preference' && (
                              <span className="text-gray-500 ml-2 capitalize">
                                • {job.preferred_gender}
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {job.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[job.status]
                        }`}>
                          {statusLabels[job.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-gray-400 hover:text-blue-500"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/jobs/${job.id}/edit`}
                            className="text-gray-400 hover:text-blue-500"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};