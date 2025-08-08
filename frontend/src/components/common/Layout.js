import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Define pages that should have different layouts
  const noSidebarPages = ['/login', '/register', '/onboarding'];
  const showSidebar = !noSidebarPages.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {showSidebar && <Sidebar />}
      
      <div className={`${showSidebar ? 'ml-64' : ''} min-h-screen`}>
        {showSidebar && <Header />}
        
        <main className={`${showSidebar ? 'pt-16' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;