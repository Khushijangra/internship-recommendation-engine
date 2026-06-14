import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { applicationService, Application } from '../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

interface ApplicationsContextType {
  applications: Application[];
  loading: boolean;
  addApplication: (application: Omit<Application, 'id' | 'applied_at'>) => Promise<void>;
  updateApplicationStatus: (id: string, status: Application['status']) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  refreshApplications: () => Promise<void>;
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshApplications = async () => {
    if (!user) {
      setApplications([]);
      return;
    }
    
    const userId = user.uid;
    
    setLoading(true);
    try {
      const apps = await applicationService.getApplications(userId);
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const addApplication = async (application: Omit<Application, 'id' | 'applied_at'>) => {
    if (!user) {
      toast.error('Please sign in to apply for internships');
      return;
    }

    try {
      const applicationWithUser = {
        ...application,
        user_id: user.uid
      };
      const newApplication = await applicationService.addApplication(applicationWithUser);
      setApplications(prev => [newApplication, ...prev]);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error adding application:', error);
      toast.error('Failed to submit application');
    }
  };

  const updateApplicationStatus = async (id: string, status: Application['status']) => {
    try {
      await applicationService.updateApplicationStatus(id, status);
      setApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, status } : app
        )
      );
      toast.success('Application status updated');
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      await applicationService.deleteApplication(id);
      setApplications(prev => prev.filter(app => app.id !== id));
      toast.success('Application deleted');
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    }
  };

  useEffect(() => {
    console.log('ApplicationsContext: User state changed:', user ? `User logged in: ${user.uid}` : 'User logged out');
    if (user) {
      refreshApplications();
    } else {
      // Clear applications when user logs out
      console.log('ApplicationsContext: Clearing applications due to logout');
      setApplications([]);
      setLoading(false);
    }
  }, [user]);

  const value = {
    applications,
    loading,
    addApplication,
    updateApplicationStatus,
    deleteApplication,
    refreshApplications
  };

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const context = useContext(ApplicationsContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationsProvider');
  }
  return context;
}
