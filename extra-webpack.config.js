const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = (config, options) => {
  // Load .env file
  const env = dotenv.config().parsed || {};

  // Prioritize process.env over .env file
  const envKeys = {
    'process.env.NG_APP_SUPABASE_URL': JSON.stringify(process.env.NG_APP_SUPABASE_URL || env.NG_APP_SUPABASE_URL || ''),
    'process.env.NG_APP_SUPABASE_KEY': JSON.stringify(process.env.NG_APP_SUPABASE_KEY || env.NG_APP_SUPABASE_KEY || ''),
    'process.env.NG_APP_OPENAI_API_KEY': JSON.stringify(process.env.NG_APP_OPENAI_API_KEY || env.NG_APP_OPENAI_API_KEY || '')
  };

  // Add DefinePlugin to webpack config
  config.plugins.push(
    new webpack.DefinePlugin(envKeys)
  );

  return config;
};
