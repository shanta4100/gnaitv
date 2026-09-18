const config = window.GNAITV_CONFIG || {};

const yearNode = document.querySelector('[data-current-year]');
if (yearNode) yearNode.textContent = new Date().getFullYear();

const statusNodes = document.querySelectorAll('[data-broadcast-status]');
statusNodes.forEach((node) => {
  node.textContent = config.broadcastStatus || 'Offline by design';
});

const featuredRoot = document.querySelector('[data-featured-video-root]');
if (featuredRoot) {
  if (config.featuredVideoId) {
    featuredRoot.innerHTML = `
      <div class="embed-shell">
        <iframe
          src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(config.featuredVideoId)}"
          title="Featured GNAI TV video"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>
      </div>`;
  } else {
    featuredRoot.innerHTML = '<div class="card alt"><h2>Recorded programming will appear here</h2><p class="muted">Add an approved public YouTube video ID in <code>config.js</code> when distribution rights and editorial approval are confirmed.</p></div>';
  }
}

const uploadsRoot = document.querySelector('[data-uploads-root]');
if (uploadsRoot) {
  fetch(config.uploadsEndpoint || '/api/youtube-uploads')
    .then((response) => response.json())
    .then((data) => {
      if (!data.configured) {
        uploadsRoot.innerHTML = '<div class="card alt"><h2>Uploads are not configured yet</h2><p class="muted">Set the required Cloudflare Production variables to enable the upload feed.</p></div>';
        return;
      }

      const items = Array.isArray(data.items) ? data.items : [];
      if (!items.length) {
        uploadsRoot.innerHTML = '<div class="card alt"><h2>No uploads found</h2><p class="muted">The API is configured, but no public uploads were returned yet.</p></div>';
        return;
      }

      uploadsRoot.innerHTML = items.map((item) => `
        <article class="card">
          <h3><a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a></h3>
          <p class="muted">${new Date(item.publishedAt).toLocaleString()}</p>
          ${item.thumbnail ? `<img src="${item.thumbnail}" alt="Thumbnail for ${item.title}">` : ''}
        </article>`).join('');
    })
    .catch(() => {
      uploadsRoot.innerHTML = '<div class="card alt"><h2>Uploads are temporarily unavailable</h2><p class="muted">The Cloudflare function could not be reached.</p></div>';
    });
}
