import { readFileSync, existsSync } from 'node:fs';

const requiredFiles = [
  'index.html',
  'watch.html',
  'channels.html',
  'youtube-media.html',
  'google-console.html',
  'assets/css/site.css',
  'assets/js/youtube-plugin.js',
  'config.js',
  '_headers',
  'robots.txt',
  'sitemap.xml',
  'wrangler.toml',
  'functions/api/health.js',
  'functions/api/live.js',
  'functions/api/youtube-uploads.js',
  '.github/workflows/validate.yml',
  '.github/workflows/stale.yml'
];

const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length) {
  throw new Error(`Missing required files:\n${missing.join('\n')}`);
}

const home = readFileSync('index.html', 'utf8');
const headers = readFileSync('_headers', 'utf8');
const uploads = readFileSync('functions/api/youtube-uploads.js', 'utf8');

if (!home.includes('Offline by design')) {
  throw new Error('index.html must state that broadcast status is offline by design.');
}

if (!headers.includes('Content-Security-Policy')) {
  throw new Error('_headers must define a Content-Security-Policy header.');
}

if (!uploads.includes('configured: false')) {
  throw new Error('/api/youtube-uploads must preserve the configured:false response path.');
}

console.log('Site validation passed.');
