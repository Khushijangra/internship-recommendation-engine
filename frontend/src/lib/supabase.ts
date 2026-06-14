import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Supabase configuration — all values must come from environment variables.
// Copy frontend/.env.example → frontend/.env and fill in your values.
// NEVER add hardcoded credentials or placeholder strings here.
// ---------------------------------------------------------------------------

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[supabase.ts] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.\n' +
    'Copy frontend/.env.example to frontend/.env and fill in your Supabase project credentials.'
  );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Database types (will be generated from your schema)
export interface Application {
  id: string;
  user_id: string;
  internship_id: string;
  internship_title: string;
  organization: string;
  applied_at: string;
  status: 'applied' | 'under_review' | 'accepted' | 'rejected';
  notes?: string;
}

// Application management functions
export const applicationService = {
  // Get all applications for a user
  async getApplications(userId: string): Promise<Application[]> {
    try {
      const response = await fetch(`/applications/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Add a new application
  async addApplication(application: Omit<Application, 'id' | 'applied_at'>): Promise<Application> {
    try {
      const response = await fetch('/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(application),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding application:', error);
      throw error;
    }
  },

  // Update application status
  async updateApplicationStatus(id: string, status: Application['status']): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  },

  // Delete an application
  async deleteApplication(id: string): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  }
};
