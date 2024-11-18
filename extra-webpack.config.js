const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = (config, options) => {
  const env = dotenv.config().parsed || {};

  // Fallback to empty string if env vars are not found
  const envKeys = {
    'process.env.NG_APP_SUPABASE_URL': JSON.stringify(env.NG_APP_SUPABASE_URL || ''),
    'process.env.NG_APP_SUPABASE_KEY': JSON.stringify(env.NG_APP_SUPABASE_KEY || ''),
    'process.env.NG_APP_OPENAI_API_KEY': JSON.stringify(env.NG_APP_OPENAI_API_KEY || '')
  };

  config.plugins.push(
    new webpack.DefinePlugin(envKeys)
  );

  return config;
};