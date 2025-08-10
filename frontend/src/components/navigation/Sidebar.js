import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Play, 
  Beaker, 
  Eye, 
  HelpCircle,
  TrendingUp,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Star,
  Trophy,
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(['learning']);
  const { logout, user } = useAuth();

  const navigationItems = [
    {
      id: 'main',
      title: 'Main',
      items: [
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          icon: Home, 
          path: '/', 
          badge: null 
        },
        { 
          id: 'subjects', 
          label: 'Subjects', 
          icon: BookOpen, 
          path: '/subjects', 
          badge: null 
        },
        { 
          id: 'progress', 
          label: 'My Progress', 
          icon: TrendingUp, 
          path: '/progress', 
          badge: null 
        },
        { 
          id: 'leaderboards', 
          label: 'Leaderboards', 
          icon: Trophy, 
          path: '/leaderboards', 
          badge: null 
        }
      ]
    },
    {
      id: 'learning',
      title: 'Learning Content',
      items: [
        { 
          id: 'videos', 
          label: 'Videos', 
          icon: Play, 
          path: '/videos', 
          badge: 'New' 
        },
        { 
          id: 'experiments', 
          label: 'Experiments', 
          icon: Beaker, 
          path: '/experiments', 
          badge: null 
        },
        { 
          id: 'models', 
          label: '3D Models', 
          icon: Eye, 
          path: '/models', 
          badge: null 
        },
        { 
          id: 'simulations', 
          label: '2D Simulations', 
          icon: Target, 
          path: '/simulations', 
          badge: null 
        },
        { 
          id: 'questions', 
          label: 'Questions', 
          icon: HelpCircle, 
          path: '/questions', 
          badge: null 
        }
      ]
    },
    {
      id: 'account',
      title: 'Account',
      items: [
        { 
          id: 'profile', 
          label: 'Profile', 
          icon: User, 
          path: '/profile', 
          badge: null 
        }
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-lg flex flex-col">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-orange-400 flex-shrink-0">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Ekima</h1>
          <p className="text-xs opacity-90 uppercase tracking-wider">
            Interactive Learning Platform
          </p>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-orange-400 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            {user?.profilePic ? (
              <img 
                src={user.profilePic} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-white">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username || 'User'}</p>
            <p className="text-xs opacity-75">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Student'}</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>{user?.gems || 0} Gems</span>
          </div>
          <div className="flex items-center space-x-1">
            <Trophy className="w-3 h-3" />
            <span>Level {user?.level_number || 1}</span>
          </div>
          <div className="text-orange-200">
            {user?.streak || 0}-day streak 🔥
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
          <div className="px-2 space-y-1">
            {navigationItems.map((section) => (
              <div key={section.id} className="mb-4">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-orange-100 uppercase tracking-wider hover:text-white transition-colors"
                >
                  <span>{section.title}</span>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {/* Section Items */}
                {expandedSections.includes(section.id) && (
                  <div className="space-y-1 mt-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigation(item.path)}
                          className={`
                            w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${active 
                              ? 'bg-white bg-opacity-20 text-white shadow-sm' 
                              : 'text-orange-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="ml-2 px-2 py-1 bg-orange-300 text-orange-800 text-xs rounded-full font-bold">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-orange-400 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-orange-100 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 text-center border-t border-orange-400 flex-shrink-0">
          <p className="text-xs opacity-75">
            © 2025 Ekima Platform
          </p>
          <p className="text-xs opacity-60 mt-1">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;