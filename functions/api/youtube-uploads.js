const API_ROOT = "https://www.googleapis.com/youtube/v3";

function json(body, status = 200, cacheControl = "no-store") {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": cacheControl
    }
  });
}

async function requestYouTube(resource, parameters, apiKey) {
  const url = new URL(`${API_ROOT}/${resource}`);

  for (const [name, value] of Object.entries(parameters)) {
    url.searchParams.set(name, value);
  }

  url.searchParams.set("key", apiKey);

  const response = await fetch(url, {
    headers: { accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`YouTube returned HTTP ${response.status}`);
  }

  return response.json();
}

export async function onRequestGet({ env }) {
  const apiKey = env.YOUTUBE_API_KEY;
  const channelId = env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return json({
      configured: false,
      items: []
    });
  }

  if (!/^UC[A-Za-z0-9_-]{20,30}$/.test(channelId)) {
    return json(
      {
        configured: true,
        error: "Invalid YouTube channel configuration"
      },
      500
    );
  }

  try {
    const channel = await requestYouTube(
      "channels",
      {
        part: "contentDetails",
        id: channelId
      },
      apiKey
    );

    const uploadsPlaylist =
      channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylist) {
      return json(
        {
          configured: true,
          items: []
        },
        200,
        "public, max-age=60"
      );
    }

    const uploads = await requestYouTube(
      "playlistItems",
      {
        part: "snippet,contentDetails",
        playlistId: uploadsPlaylist,
        maxResults: "12"
      },
      apiKey
    );

    const items = (uploads.items || []).flatMap((item) => {
      const videoId = item.contentDetails?.videoId;
      const snippet = item.snippet || {};

      if (!videoId) {
        return [];
      }

      return [
        {
          videoId,
          title: snippet.title || "GNAI TV program",
          publishedAt: snippet.publishedAt || null,
          thumbnail:
            snippet.thumbnails?.medium?.url ||
            snippet.thumbnails?.default?.url ||
            ""
        }
      ];
    });

    return json(
      {
        configured: true,
        items
      },
      200,
      "public, max-age=300, stale-while-revalidate=600"
    );
  } catch (error) {
    console.error(
      "youtube-uploads",
      error instanceof Error ? error.message : "Unknown error"
    );

    return json(
      {
        configured: true,
        error: "YouTube media is temporarily unavailable"
      },
      502
    );
  }
}