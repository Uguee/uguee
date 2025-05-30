import React from 'react';
import Navbar from './Navbar';

interface InstitutionalLayoutProps {
  children: React.ReactNode;
}

const InstitutionalLayout: React.FC<InstitutionalLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default InstitutionalLayout; 