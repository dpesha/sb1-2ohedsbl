import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Briefcase, Building2, UserCog, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const studentMenuItems = [
  { icon: Users, label: 'Students', path: '/' },
];

const staffMenuItems = [
  { icon: Users, label: 'Students', path: '/' },
  { icon: Building2, label: 'Clients', path: '/clients' },
  { icon: Briefcase, label: 'Jobs', path: '/jobs' }
];

const adminMenuItems = [
  ...staffMenuItems,
  { icon: UserCog, label: 'Users', path: '/users' }
];

export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = React.useState<typeof staffMenuItems>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        if (!user) {
          setMenuItems(studentMenuItems);
          return;
        }

        // Check if user is admin
        const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
        if (isAdmin) {
          setMenuItems(adminMenuItems);
          return;
        }

        // Check if user is student
        const { data: isStudent, error: studentError } = await supabase.rpc('is_student');
        if (isStudent) {
          setMenuItems(studentMenuItems);
        } else {
          setMenuItems(staffMenuItems);
        }

        if (adminError || studentError) {
          console.error('Error checking user role:', adminError || studentError);
        }
      } catch (err) {
        console.error('Error in checkAdminStatus:', err);
        setMenuItems(studentMenuItems);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading) {
    return (
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  inline-flex items-center px-4 border-b-2 text-sm font-medium
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};