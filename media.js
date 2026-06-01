/* =========================
   CONFIG
========================= */

const API_URL =
"https://script.google.com/macros/s/AKfycbymRxB2E8milUuAtz7y3CokechuS1ghpA936N1kVCWD2WFF0-Df8HX7jo3H8Nv8okUy/exec";

let mediaData = [];
let popupWindow = null;

/* =========================
   NORMALIZE TYPE
========================= */

function normalizeType(type){
  return String(type || "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

/* =========================
   LOAD
========================= */

window.addEventListener("load", init);

async function init(){

  await loadMedia();

  document
    .getElementById("searchInput")
    .addEventListener("input", renderMedia);

  document
    .getElementById("typeFilter")
    .addEventListener("change", renderMedia);

}

async function loadMedia(){

  try{

    const res = await fetch(API_URL);

    mediaData = await res.json();

    renderMedia();

  }catch(err){

    console.error(err);

    document
      .getElementById("mediaGridContainer")
      .innerHTML =
      `
      <div class="error-box">
        Failed loading media.
      </div>
      `;

  }

}

/* =========================
   RENDER
========================= */

function renderMedia(){

  const keyword =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase();

  const filter =
    normalizeType(
      document
        .getElementById("typeFilter")
        .value
    );

  const container =
    document.getElementById("mediaGridContainer");

  container.innerHTML = "";

  const filtered =
    mediaData.filter(item=>{

      const name =
        String(item.name || "")
          .toLowerCase();

      const type =
        normalizeType(item.type);

      const matchKeyword =
        name.includes(keyword);

      const matchType =
        filter === "" || type === filter;

      return matchKeyword && matchType;

    });

  const groups = {};

  filtered.forEach(item=>{

    const groupName =
      getDisplayType(item.type);

    if(!groups[groupName]){
      groups[groupName] = [];
    }

    groups[groupName].push(item);

  });

  Object.keys(groups).forEach(type=>{

    createGroup(type, groups[type]);

  });

}

/* =========================
   DISPLAY TYPE
========================= */

function getDisplayType(type){

  const clean =
    normalizeType(type);

  if(clean === "image") return "IMAGE";
  if(clean === "video") return "VIDEO";
  if(clean === "youtube") return "YOUTUBE";
  if(clean === "youtubemusic") return "YOUTUBE MUSIC";
  if(clean === "mp3") return "MP3";
  if(clean === "spotify") return "SPOTIFY";

  return String(type || "OTHER").toUpperCase();

}

/* =========================
   GROUP
========================= */

function createGroup(title, items){

  const wrapper =
    document.createElement("div");

  wrapper.className = "company-group";

  wrapper.innerHTML =
  `
  <div class="company-header">
    <div class="company-label">
      ${title}
    </div>
  </div>

  <div class="gallery-container"></div>
  `;

  const gallery =
    wrapper.querySelector(".gallery-container");

  items.forEach(item=>{

    gallery.appendChild(
      createCard(item)
    );

  });

  document
    .getElementById("mediaGridContainer")
    .appendChild(wrapper);

}

/* =========================
   CARD
========================= */

function createCard(item){

  const card =
    document.createElement("div");

  card.className = "banner-card";

  card.innerHTML =
  `
  <div class="image-wrapper">
    ${getThumbnail(item)}
  </div>

  <div class="card-footer">
    <div class="emp-label-name">
      ${item.name}
    </div>
  </div>
  `;

  card.addEventListener("click", ()=>{
    selectMedia(item);
  });

  return card;

}

/* =========================
   THUMBNAIL
========================= */

function getThumbnail(item){

  const type =
    normalizeType(item.type);

  if(type === "image"){

    return `
      <img
        src="${item.url}"
        alt="">
    `;

  }

  if(type === "youtube"){

    const id =
      extractYoutubeID(item.url);

    return `
      <img
        src="https://img.youtube.com/vi/${id}/hqdefault.jpg"
        alt="">
    `;

  }

  if(type === "youtubemusic"){

    return `
      <div class="media-icon">
        🎶
      </div>
    `;

  }

  if(type === "video"){

    return `
      <div class="media-icon">
        🎬
      </div>
    `;

  }

  if(type === "spotify"){

    return `
      <div class="media-icon">
        🎧
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

function selectMedia(item){

  updatePreview(item);

  const type =
    normalizeType(item.type);

  if(
    type === "image" ||
    type === "video" ||
    type === "youtube"
  ){

    openPopup(item);
    return;

  }

  if(
    type === "mp3" ||
    type === "youtubemusic" ||
    type === "spotify"
  ){

    playAudio(item);
    return;

  }

}

/* =========================
   PREVIEW AREA
========================= */

function updatePreview(item){

  const preview =
    document.getElementById("previewArea");

  const type =
    normalizeType(item.type);

  if(type === "image"){

    preview.innerHTML =
    `
    <img
      class="preview-image"
      src="${item.url}">
    `;

  }

  else if(type === "youtube"){

    const id =
      extractYoutubeID(item.url);

    preview.innerHTML =
    `
    <img
      class="preview-image"
      src="https://img.youtube.com/vi/${id}/maxresdefault.jpg">
    `;

  }

  else if(type === "video"){

    preview.innerHTML =
    `
    <div class="preview-video-icon">
      🎬 VIDEO READY
    </div>
    `;

  }

  else if(type === "youtubemusic"){

    preview.innerHTML =
/* =========================
   GROUP
========================= */

function createGroup(title, items){

  const wrapper =
    document.createElement("div");

  wrapper.className = "company-group";

  wrapper.innerHTML =
  `
  <div class="company-header">
    <div class="company-label">
      ${title}
    </div>
  </div>

  <div class="gallery-container"></div>
  `;

  const gallery =
    wrapper.querySelector(".gallery-container");

  items.forEach(item=>{

    gallery.appendChild(
      createCard(item)
    );

  });

  document
    .getElementById("mediaGridContainer")
    .appendChild(wrapper);

}

/* =========================
   CARD
========================= */

function createCard(item){

  const card =
    document.createElement("div");

  card.className = "banner-card";

  card.innerHTML =
  `
  <div class="image-wrapper">
    ${getThumbnail(item)}
  </div>

  <div class="card-footer">
    <div class="emp-label-name">
      ${item.name}
    </div>
  </div>
  `;

  card.addEventListener("click", ()=>{
    selectMedia(item);
  });

  return card;

}

/* =========================
   THUMBNAIL
========================= */

function getThumbnail(item){

  const type =
    normalizeType(item.type);

  if(type === "image"){

    return `
      <img
        src="${item.url}"
        alt="">
    `;

  }

  if(type === "youtube"){

    const id =
      extractYoutubeID(item.url);

    return `
      <img
        src="https://img.youtube.com/vi/${id}/hqdefault.jpg"
        alt="">
    `;

  }

  if(type === "youtubemusic"){

    return `
      <div class="media-icon">
        🎶
      </div>
    `;

  }

  if(type === "video"){

    return `
      <div class="media-icon">
        🎬
      </div>
    `;

  }

  if(type === "spotify"){

    return `
      <div class="media-icon">
        🎧
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

function selectMedia(item){

  updatePreview(item);

  const type =
    normalizeType(item.type);

  if(
    type === "image" ||
    type === "video" ||
    type === "youtube"
  ){

    openPopup(item);
    return;

  }

  if(
    type === "mp3" ||
    type === "youtubemusic" ||
    type === "spotify"
  ){

    playAudio(item);
    return;

  }

}

/* =========================
   PREVIEW AREA
========================= */

function updatePreview(item){

  const preview =
    document.getElementById("previewArea");

  const type =
    normalizeType(item.type);

  if(type === "image"){

    preview.innerHTML =
    `
    <img
      class="preview-image"
      src="${item.url}">
    `;

  }

  else if(type === "youtube"){

    const id =
      extractYoutubeID(item.url);

    preview.innerHTML =
    `
    <img
      class="preview-image"
      src="https://img.youtube.com/vi/${id}/maxresdefault.jpg">
    `;

  }

  else if(type === "video"){

    preview.innerHTML =
    `
    <div class="preview-video-icon">
      🎬 VIDEO READY
    </div>
    `;

  }

  else if(type === "youtubemusic"){

    preview.innerHTML =
