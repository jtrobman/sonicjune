export const environment = {
  production: true,
  supabaseUrl: process.env['NG_APP_SUPABASE_URL'] || '',
  supabaseKey: process.env['NG_APP_SUPABASE_KEY'] || '',
  openaiApiKey: process.env['NG_APP_OPENAI_API_KEY'] || ''
};
