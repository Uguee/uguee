import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from './AppSidebar'
import Navbar from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  console.log('Entro al dashboard layout');
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SidebarProvider>
        <div className="flex-1 flex">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <div className="p-4">
              <SidebarTrigger />
            </div>
            <div className="flex-1 px-6 pb-6">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
