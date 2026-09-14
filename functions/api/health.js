export async function onRequestGet({ env }) {
  return Response.json(
    {
      ok: true,
      service: "gnaitv",
      youtubeConfigured: Boolean(
        env.YOUTUBE_API_KEY && env.YOUTUBE_CHANNEL_ID
      ),
      liveConfigured: Boolean(
        env.GNAITV_LIVE === "true" && env.YOUTUBE_LIVE_VIDEO_ID
      ),
      checkedAt: new Date().toISOString()
    },
    {
      headers: {
        "cache-control": "no-store"
      }
    }
  );
}