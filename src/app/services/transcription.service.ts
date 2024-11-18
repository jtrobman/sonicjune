import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TranscriptionService {
  private supabase: SupabaseClient;
  private openai: OpenAI;
  private maxFileSize = 25 * 1024 * 1024; // 25MB limit for OpenAI

  constructor() {
    if (!environment.supabaseUrl || !environment.supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    if (!environment.openaiApiKey) {
      throw new Error('OpenAI API key is missing');
    }

    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.openai = new OpenAI({
      apiKey: environment.openaiApiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async uploadAudio(file: File, userId: string) {
    if (file.size > this.maxFileSize) {
      throw new Error('File size exceeds 25MB limit');
    }

    try {
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      const { data, error } = await this.supabase.storage
        .from('audio-files')
        .upload(fileName, file);
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error.message || 'Error uploading file');
    }
  }

  async transcribeAudio(file: File) {
    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
      });

      return transcription.text;
    } catch (error: any) {
      console.error('Transcription error:', error);
      
      if (error.error?.type === 'insufficient_quota') {
        throw new Error('Service temporarily unavailable. Please try again later.');
      } else if (error.error?.type === 'invalid_request_error') {
        throw new Error('Invalid audio file. Please try a different file.');
      }
      
      throw new Error(error.message || 'Error transcribing audio');
    }
  }

  async saveTranscription(userId: string, audioPath: string, transcription: string) {
    try {
      const { data, error } = await this.supabase
        .from('transcriptions')
        .insert([
          {
            user_id: userId,
            audio_path: audioPath,
            text_content: transcription
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Save transcription error:', error);
      throw new Error(error.message || 'Error saving transcription');
    }
  }

  async getUserTranscriptions(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('transcriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get transcriptions error:', error);
      throw new Error(error.message || 'Error loading transcriptions');
    }
  }

  async deleteTranscription(id: string) {
    try {
      const { error } = await this.supabase
        .from('transcriptions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Delete transcription error:', error);
      throw new Error(error.message || 'Error deleting transcription');
    }
  }
}