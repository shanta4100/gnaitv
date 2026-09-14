const programGrid = document.querySelector("#program-grid");
const statusLabel = document.querySelector("#status-label");
const statusDetail = document.querySelector("#status-detail");
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getUTCFullYear();
}

async function loadBroadcastStatus() {
  try {
    const response = await fetch("/api/live", {
      headers: { accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error("Status request failed");
    }

    const data = await response.json();

    if (data.live === true && data.videoId) {
      statusLabel.textContent = "Live now";
      statusDetail.textContent =
        "An authorized and configured GNAI TV broadcast is available.";
    } else {
      statusLabel.textContent = "Live broadcast offline";
      statusDetail.textContent =
        "Recorded programming remains available. No verified live broadcast is active.";
    }
  } catch {
    statusLabel.textContent = "Status unavailable";
    statusDetail.textContent =
      "The live status could not be verified, so no live claim is displayed.";
  }
}

function createProgramCard(program) {
  const article = document.createElement("article");
  article.className = "card media-card";

  const image = document.createElement("img");
  image.src = program.thumbnail;
  image.alt = "";
  image.loading = "lazy";

  const heading = document.createElement("h3");
  heading.textContent = program.title;

  const link = document.createElement("a");
  link.href = `https://www.youtube.com/watch?v=${encodeURIComponent(
    program.videoId
  )}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Watch on YouTube";

  article.append(image, heading, link);
  return article;
}

async function loadPrograms() {
  try {
    const response = await fetch("/api/youtube-uploads", {
      headers: { accept: "application/json" }
    });

    const data = await response.json();

    programGrid.replaceChildren();

    if (!response.ok) {
      throw new Error(data.error || "Media request failed");
    }

    if (!data.configured) {
      programGrid.innerHTML = `
        <article class="card">
          <h3>Channel connection pending</h3>
          <p>Add the approved Cloudflare YouTube variables to display programs.</p>
        </article>
      `;
      return;
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      programGrid.innerHTML = `
        <article class="card">
          <h3>No recent programs</h3>
          <p>The configured channel returned no public uploads.</p>
        </article>
      `;
      return;
    }

    for (const program of data.items) {
      programGrid.append(createProgramCard(program));
    }
  } catch {
    programGrid.innerHTML = `
      <article class="card">
        <h3>Media temporarily unavailable</h3>
        <p>Please try again later.</p>
      </article>
    `;
  }
}

loadBroadcastStatus();
loadPrograms();