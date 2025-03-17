import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Job } from '../types/job';
import type { Client } from '../types/client';

export const JobForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<Partial<Job>>({
    client_id: '',
    accepting_organization: '',
    work_location: '',
    category: '',
    position_count: 1,
    candidates_min_count: 1,
    interview_date: null,
    preferred_gender: 'no preference',
    min_age: null,
    max_age: null,
    status: 'open'
  });

  useEffect(() => {
    fetchClients();
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('company_name');

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    }
  };

  const fetchJob = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
      }
    } catch (err) {
      console.error('Error fetching job:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch job');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!formData.client_id || !formData.accepting_organization || !formData.work_location) {
        throw new Error('Please fill in all required fields');
      }

      if (id) {
        const { error } = await supabase
          .from('jobs')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('jobs')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      navigate('/jobs');
    } catch (err) {
      console.error('Error saving job:', err);
      setError(err instanceof Error ? err.message : 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'position_count' || name === 'min_age' || name === 'max_age' 
        ? value === '' ? null : parseInt(value) || null
        : value
    }));
  };

  if (loading && id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
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
          <Briefcase className="w-8 h-8 text-blue-500" />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {id ? 'Edit Job' : 'New Job'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client *
              </label>
              <select
                name="client_id"
                value={formData.client_id || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accepting Organization *
              </label>
              <input
                type="text"
                name="accepting_organization"
                value={formData.accepting_organization || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Location *
              </label>
              <input
                type="text"
                name="work_location"
                value={formData.work_location || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Category</option>
                <option value="介護">介護</option>
                <option value="宿泊">宿泊</option>
                <option value="外食">外食</option>
                <option value="建設">建設</option>
                <option value="農業">農業</option>
                <option value="ドライバー">ドライバー</option>
                <option value="ビルクリーニング">ビルクリーニング</option>
                <option value="グラウンドハンドリング">グラウンドハンドリング</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Date
              </label>
              <input
                type="date"
                name="interview_date"
                value={formData.interview_date || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Gender
              </label>
              <select
                name="preferred_gender"
                value={formData.preferred_gender || 'no preference'}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="no preference">No Preference</option>
                <option value="male only">Male Only</option>
                <option value="female only">Female Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Requirement
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Minimum Age
                  </label>
                  <input
                    type="number"
                    name="min_age"
                    value={formData.min_age || ''}
                    onChange={handleChange}
                    min="18"
                    max="65"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., 20"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Maximum Age
                  </label>
                  <input
                    type="number"
                    name="max_age"
                    value={formData.max_age || ''}
                    onChange={handleChange}
                    min="18"
                    max="65"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., 25"
                  />
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Leave both fields empty if there is no age requirement
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Positions
              </label>
              <input
                type="number"
                name="position_count"
                value={formData.position_count || 1}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Candidates Required
              </label>
              <input
                type="number"
                name="candidates_min_count"
                value={formData.candidates_min_count || 1}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="mt-1 text-sm text-gray-500 text-blue-600">
                Typically set to double the number of positions (e.g., 8 candidates for 4 positions)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status || 'open'}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="open">Open</option>
                <option value="filled">Filled</option>
                <option value="cancelled">Cancelled</option>
                <option value="on_hold">On Hold</option>
                <option value="candidates_selected">Candidates Selected</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Link
                to="/jobs"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-blue text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Saving...' : id ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};