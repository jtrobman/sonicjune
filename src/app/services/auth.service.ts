import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    if (!environment.supabaseUrl || !environment.supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });

    // Initialize user state from session
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.userSubject.next(session?.user ?? null);
    });
    
    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        this.userSubject.next(null);
      } else {
        this.userSubject.next(session?.user ?? null);
      }
    });
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;

    // Create profile
    if (data.user) {
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert([{ id: data.user.id, email }]);
      
      if (profileError) throw profileError;
    }

    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProfile(profile: Partial<Profile>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data: updatedProfile, error: profileError } = await this.supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email
        })
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      if (profile.email && profile.email !== user.email) {
        const { error: emailError } = await this.supabase.rpc('update_user_email', {
          user_id: user.id,
          new_email: profile.email
        });

        if (emailError) throw emailError;
        await this.supabase.auth.refreshSession();
      }

      return updatedProfile;
    } catch (error: any) {
      throw new Error(error.message || 'Error updating profile');
    }
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error: signInError } = await this.supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    });

    if (signInError) throw new Error('Current password is incorrect');

    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  }

  async deleteAccount() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { error: deleteError } = await this.supabase.rpc('delete_user', {
        target_user_id: user.id
      });

      if (deleteError) throw deleteError;
      await this.signOut();
    } catch (error: any) {
      throw new Error(error.message || 'Error deleting account');
    }
  }

  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;
      
      const { data, error } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) return false;
      return data?.role === 'admin';
    } catch {
      return false;
    }
  }
}