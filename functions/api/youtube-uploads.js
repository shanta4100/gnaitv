const API_ROOT = 'https://www.googleapis.com/youtube/v3/playlistItems';

function json(body, init = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers || {})
    }
  });
}

function uploadsPlaylistId(channelId) {
  return channelId.startsWith('UC') ? `UU${channelId.slice(2)}` : null;
}

export async function onRequestGet(context) {
  const { env, request } = context;

  if (!env.YOUTUBE_API_KEY || !env.YOUTUBE_CHANNEL_ID) {
    return json({ configured: false }, { headers: { 'cache-control': 'no-store' } });
  }

  const playlistId = uploadsPlaylistId(env.YOUTUBE_CHANNEL_ID);
  if (!playlistId) {
    return json({ configured: true, error: 'invalid_channel_id' }, { status: 500, headers: { 'cache-control': 'no-store' } });
  }

  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/youtube-uploads', request.url).toString(), request);
  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  const apiUrl = new URL(API_ROOT);
  apiUrl.searchParams.set('part', 'snippet,contentDetails');
  apiUrl.searchParams.set('playlistId', playlistId);
  apiUrl.searchParams.set('maxResults', '12');
  apiUrl.searchParams.set('key', env.YOUTUBE_API_KEY);

  const response = await fetch(apiUrl, {
    headers: { accept: 'application/json' }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const reason = payload?.error?.errors?.[0]?.reason || 'youtube_api_error';
    const status = reason === 'quotaExceeded' ? 429 : 502;
    return json({ configured: true, error: reason }, { status, headers: { 'cache-control': 'no-store' } });
  }

  const items = Array.isArray(payload.items) ? payload.items.map((item) => ({
    videoId: item.contentDetails?.videoId || '',
    title: item.snippet?.title || 'Untitled upload',
    publishedAt: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt || null,
    thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
    url: item.contentDetails?.videoId ? `https://www.youtube.com/watch?v=${item.contentDetails.videoId}` : 'https://www.youtube.com/'
  })) : [];

  const result = json({ configured: true, items }, { headers: { 'cache-control': 'public, s-maxage=300' } });
  context.waitUntil(cache.put(cacheKey, result.clone()));
  return result;
}
