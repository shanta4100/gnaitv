function json(body, init = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init.headers || {})
    }
  });
}

export async function onRequestGet({ env }) {
  return json({
    ok: true,
    project: 'gnaitv',
    environment: 'cloudflare-pages',
    configured: {
      youtubeUploads: Boolean(env.YOUTUBE_API_KEY && env.YOUTUBE_CHANNEL_ID),
      accessIntegration: Boolean(env.CF_ACCESS_AUD && env.CF_ACCESS_TEAM)
    },
    broadcast: {
      live: false,
      status: 'offline'
    }
  });
}
