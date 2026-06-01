/* =========================
   CONFIG
========================= */

const API_URL =
"https://script.google.com/macros/s/AKfycbymRxB2E8milUuAtz7y3CokechuS1ghpA936N1kVCWD2WFF0-Df8HX7jo3H8Nv8okUy/exec";

let mediaData = [];
let popupWindow = null;

const TYPE_ORDER = [
  "Image",
  "Music",
  "Video",
  "Youtube",
  "YoutubeMusic"
];

/* =========================
   NORMALIZE
========================= */

function normalizeType(type) {
  return String(type || "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function displayType(type) {
  const clean = normalizeType(type);

  if (clean === "image") return "Image";
  if (clean === "music") return "Music";
  if (clean === "video") return "Video";
  if (clean === "youtube") return "Youtube";
  if (clean === "youtubemusic") return "YoutubeMusic";

  return "Other";
}

/* =========================
   INIT
========================= */

window.addEventListener("load", init);

async function init() {
  setupDropdown();

  document
    .getElementById("searchInput")
    .addEventListener("input", renderMedia);

  document
    .getElementById("typeFilter")
    .addEventListener("change", renderMedia);

  await loadMedia();
}

/* =========================
   DROPDOWN A-Z
========================= */

function setupDropdown() {
  const dropdown =
    document.getElementById("typeFilter");

  dropdown.innerHTML = `
    <option value="">All Type</option>
  `;

  TYPE_ORDER
    .slice()
    .sort()
    .forEach(type => {
      dropdown.innerHTML += `
        <option value="${normalizeType(type)}">
          ${type}
        </option>
      `;
    });
}

/* =========================
   LOAD DATA
========================= */

async function loadMedia() {
  try {
    const res = await fetch(API_URL);

    mediaData = await res.json();

    mediaData = mediaData
      .filter(item => item.name && item.type && item.url)
      .map(item => ({
        name: String(item.name).trim(),
        type: displayType(item.type),
        url: String(item.url).trim()
      }));

    renderMedia();

  } catch (err) {
    console.error(err);

    document.getElementById("mediaGridContainer").innerHTML = `
      <div class="error-box">
        Failed loading media.
      </div>
    `;
  }
}

/* =========================
   RENDER MEDIA
========================= */

function renderMedia() {
  const keyword =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase();

  const selectedType =
    normalizeType(
      document
        .getElementById("typeFilter")
        .value
    );

  const container =
    document.getElementById("mediaGridContainer");

  container.innerHTML = "";

  const filtered = mediaData.filter(item => {
    const name =
      item.name.toLowerCase();

    const type =
      normalizeType(item.type);

    const matchName =
      name.includes(keyword);

    const matchType =
      selectedType === "" || type === selectedType;

    return matchName && matchType;
  });

  const groups = {};

  filtered.forEach(item => {
    const type =
      displayType(item.type);

    if (!groups[type]) {
      groups[type] = [];
    }

    groups[type].push(item);
  });

  TYPE_ORDER
    .slice()
    .sort()
    .forEach(type => {
      if (groups[type]) {
        createGroup(type, groups[type]);
      }
    });
}

/* =========================
   CREATE GROUP
========================= */

function createGroup(title, items) {
  items.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const wrapper =
    document.createElement("div");

  wrapper.className = "company-group";

  wrapper.innerHTML = `
    <div class="company-header">
      <div class="company-label">
        ${title}
      </div>
    </div>

    <div class="gallery-container"></div>
  `;

  const gallery =
    wrapper.querySelector(".gallery-container");

  items.forEach(item => {
    gallery.appendChild(
      createCard(item)
    );
  });

  document
    .getElementById("mediaGridContainer")
    .appendChild(wrapper);
}

/* =========================
   CREATE CARD
========================= */

function createCard(item) {
  const card =
    document.createElement("div");

  card.className = "banner-card";

  card.innerHTML = `
    <div class="image-wrapper">
      ${getThumbnail(item)}
    </div>

    <div class="card-footer">
      <div class="emp-label-name">
        ${escapeHTML(item.name)}
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    selectMedia(item);
  });

  return card;
}

/* =========================
   THUMBNAIL
========================= */

function getThumbnail(item) {
  const type =
    normalizeType(item.type);

  if (type === "image") {
    return `
      <img
        src="${item.url}"
        alt="">
    `;
  }

  if (type === "youtube") {
    const id =
      extractYoutubeID(item.url);

    return `
      <img
        src="https://img.youtube.com/vi/${id}/hqdefault.jpg"
        alt="">
    `;
  }

  if (type === "youtubemusic") {
    return `
      <div class="media-icon">
        🎶
      </div>
    `;
  }

  if (type === "video") {
    return `
      <div class="media-icon">
        🎬
      </div>
    `;
  }

  return `
    <div class="media-icon">
      🎵
    </div>
  `;
}

/* =========================
   SELECT MEDIA
========================= */

function selectMedia(item) {
  updatePreview(item);

  const type = normalizeType(item.type);

  if (
    type === "image" ||
    type === "video" ||
    type === "youtube"
  ) {
    openPopup(item);
  }
}

/* =========================
   PREVIEW AREA
========================= */

function updatePreview(item) {
  const preview = document.getElementById("previewArea");
  const type = normalizeType(item.type);

  if (type === "image") {
    preview.innerHTML = `
      <img
        class="preview-image"
        src="${item.url}">
    `;
  }

  else if (type === "video") {
    preview.innerHTML = `
      <video
        controls
        preload="metadata"
        style="width:100%; height:100%; object-fit:contain;">
        <source src="${item.url}">
      </video>
    `;
  }

  else if (type === "youtube") {
    const id = extractYoutubeID(item.url);

    preview.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${id}?controls=1&rel=0"
        width="100%"
        height="100%"
        allowfullscreen>
      </iframe>
    `;
  }

  else if (type === "youtubemusic") {
    const id = extractYoutubeID(item.url);

    preview.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${id}?autoplay=1&controls=1&rel=0"
        width="100%"
        height="100%"
        allow="autoplay; encrypted-media"
        allowfullscreen>
      </iframe>
    `;
  }

  else if (type === "music") {
    preview.innerHTML = `
      <audio
        controls
        autoplay
        style="width:90%;">
        <source src="${item.url}">
      </audio>
    `;
  }

  else {
    preview.innerHTML = `
      <div class="preview-video-icon">
        Unsupported Media
      </div>
    `;
  }
}
/* =========================
   POPUP IMAGE / VIDEO / YOUTUBE
========================= */

function openPopup(item) {
  if (!popupWindow || popupWindow.closed) {
    popupWindow = window.open(
      "",
      "MediaPopup",
      "width=1600,height=900,left=50,top=50,popup=yes"
    );
  }

  const type =
    normalizeType(item.type);

  let bodyContent = "";

  if (type === "image") {
    bodyContent = `
      <img
        src="${item.url}"
        style="
        width:100vw;
        height:100vh;
        object-fit:contain;">
    `;
  }

  if (type === "video") {
    bodyContent = `
      <video
        id="popupVideo"
        preload="metadata"
        style="
        width:100vw;
        height:100vh;
        object-fit:contain;">

        <source src="${item.url}">
      </video>

      <script>
        function toggleVideo(){
          const v =
            document.getElementById('popupVideo');

          if(v.paused){
            v.play();
          }else{
            v.pause();
          }
        }

        document.addEventListener('keydown', function(e){
          if(e.code === 'Space' || e.code === 'Enter'){
            e.preventDefault();
            toggleVideo();
          }
        });

        document.body.addEventListener('click', toggleVideo);
      <\/script>
    `;
  }

  if (type === "youtube") {
    const id =
      extractYoutubeID(item.url);

    bodyContent = `
      <div id="player"></div>

      <script src="https://www.youtube.com/iframe_api"><\/script>

      <script>
        let player;
        let playerReady = false;

        function onYouTubeIframeAPIReady(){
          player = new YT.Player('player', {
            width: '100%',
            height: '100%',
            videoId: '${id}',
            playerVars: {
              autoplay: 0,
              controls: 1,
              rel: 0,
              modestbranding: 1
            },
            events: {
              onReady: function(){
                playerReady = true;
              }
            }
          });
        }

        function toggleYoutube(){
          if(!playerReady) return;

          const state =
            player.getPlayerState();

          if(state === 1){
            player.pauseVideo();
          }else{
            player.playVideo();
          }
        }

        document.addEventListener('keydown', function(e){
          if(e.code === 'Space' || e.code === 'Enter'){
            e.preventDefault();
            toggleYoutube();
          }
        });

        document.body.addEventListener('click', toggleYoutube);
      <\/script>
    `;
  }

  popupWindow.document.open();

  popupWindow.document.write(`
    <html>
    <head>
      <title>Media Display</title>

      <style>
        html,
        body{
          margin:0;
          width:100%;
          height:100%;
          background:#000;
          overflow:hidden;
        }

        body{
          display:flex;
          justify-content:center;
          align-items:center;
        }

        iframe{
          border:none;
        }

        #player{
          width:100vw;
          height:100vh;
        }
      </style>
    </head>

    <body>
      ${bodyContent}

      <script>
        setTimeout(function(){
          if(document.documentElement.requestFullscreen){
            document.documentElement.requestFullscreen();
          }
        }, 300);
      <\/script>
    </body>
    </html>
  `);

  popupWindow.document.close();
  popupWindow.focus();
}

/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
