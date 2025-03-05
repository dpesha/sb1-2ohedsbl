import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Mail, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

import type { User, Group } from '../types/user';
import { Shield, UserPlus, UserMinus } from 'lucide-react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [usersResult, groupsResult] = await Promise.all([
          supabase.rpc('get_users'),
          supabase.from('groups').select('*')
        ]);

        if (usersResult.error) throw usersResult.error;
        if (groupsResult.error) throw groupsResult.error;

        setUsers(usersResult.data || []);
        setGroups(groupsResult.data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddGroup = async () => {
    if (!selectedUser || !selectedGroup) return;

    try {
      const groupToAdd = groups.find(g => g.id === selectedGroup);
      if (!groupToAdd) return;

      const { error } = await supabase
        .from('user_groups')
        .insert({ user_id: selectedUser, group_id: selectedGroup });

      if (error) throw error;
      
      // Refresh users list
      const { data, error: usersError } = await supabase.rpc('get_users');
      if (usersError) throw usersError;
      setUsers(data || []);
    } catch (err) {
      console.error('Error updating user group:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user group');
    }
  };

  const handleRemoveGroup = async (userId: string, groupName: string) => {
    try {
      const { error } = await supabase.rpc('remove_user_from_group', { 
        p_user_id: userId, 
        p_group_name: groupName 
      });
      if (error) throw error;
      
      // Refresh users list
      const { data, error: usersError } = await supabase.rpc('get_users');
      if (usersError) throw usersError;
      setUsers(data || []);
    } catch (err) {
      console.error('Error removing user from group:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove user from group');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <UsersIcon className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No users found</p>
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Sign In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Groups
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {user.last_sign_in_at 
                            ? formatDate(user.last_sign_in_at)
                            : 'Never'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {user.groups?.map((group) => (
                            <div
                              key={group}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              <Shield className="w-3 h-3" />
                              {group === 'admin' ? 'Admin' : 
                               group === 'bsj' ? 'BSJ' : 
                               group === 'bsi' ? 'BSI' : 
                               group}
                              <button
                                onClick={() => handleRemoveGroup(user.id, group)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <UserMinus className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {selectedUser === user.id ? (
                            <>
                              <select
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                className="text-sm border rounded-md"
                              >
                                <option value="">Select group...</option>
                                {groups.map((group) => (
                                  <option key={group.id} value={group.id}>
                                    {group.name === 'admin' ? 'Admin' : 
                                     group.name === 'bsj' ? 'BSJ' : 
                                     group.name === 'bsi' ? 'BSI' : 
                                     group.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={handleAddGroup}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedUser(user.id)}
                              className="text-gray-400 hover:text-blue-500"
                            >
                              Add Group
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};