import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getAllUsers() {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get users error:', error);
      throw new Error(error.message || 'Error loading users');
    }
  }

  async updateUserRole(userId: string, role: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Update role error:', error);
      throw new Error(error.message || 'Error updating user role');
    }
  }

  async deleteUser(userId: string) {
    try {
      // First delete all user's transcriptions
      const { error: transcriptionsError } = await this.supabase
        .from('transcriptions')
        .delete()
        .eq('user_id', userId);
      
      if (transcriptionsError) throw transcriptionsError;

      // Then delete the user's profile
      const { error: profileError } = await this.supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) throw profileError;
    } catch (error: any) {
      console.error('Delete user error:', error);
      throw new Error(error.message || 'Error deleting user');
    }
  }

  async getAllTranscriptions() {
    try {
      const { data, error } = await this.supabase
        .from('transcriptions')
        .select(`
          *,
          profiles (
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get transcriptions error:', error);
      throw new Error(error.message || 'Error loading transcriptions');
    }
  }
}