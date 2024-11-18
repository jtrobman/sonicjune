# Sonic June

Audio transcription web application built with Angular, Supabase and OpenAI.

## Features

- User authentication
- Audio file upload and transcription using OpenAI Whisper
- Dashboard to view and manage transcriptions
- Admin portal for user management
- Profile management

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your:
   - Supabase URL and anon key
   - OpenAI API key

5. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

The following environment variables are required:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase project's anon/public key
- `OPENAI_API_KEY`: Your OpenAI API key

## Database Setup

Run the migrations in the `supabase/migrations` folder to set up the database schema and functions.

## Deployment

The project is configured for deployment on Netlify. The `netlify.toml` file contains the build configuration.