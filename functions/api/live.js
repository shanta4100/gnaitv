export async function onRequestGet({ env }) {
  const requestedLive = env.GNAITV_LIVE === "true";
  const videoId = String(env.YOUTUBE_LIVE_VIDEO_ID || "").trim();
  const validVideoId = /^[A-Za-z0-9_-]{6,20}$/.test(videoId);

  if (!requestedLive || !validVideoId) {
    return Response.json(
      { live: false },
      {
        headers: {
          "cache-control": "no-store"
        }
      }
    );
  }

  return Response.json(
    {
      live: true,
      videoId,
      title: env.GNAITV_LIVE_TITLE || "GNAI TV Live"
    },
    {
      headers: {
        "cache-control": "no-store"
      }
    }
  );
}