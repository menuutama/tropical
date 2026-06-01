/* =========================
   CONFIG
========================= */

const API_URL =
"https://script.google.com/macros/s/AKfycbymRxB2E8milUuAtz7y3CokechuS1ghpA936N1kVCWD2WFF0-Df8HX7jo3H8Nv8okUy/exec";

let mediaData = [];
let popupWindow = null;

/* =========================
   LOAD
========================= */

window.addEventListener(
  "load",
  init
);

async function init(){

  await loadMedia();

  document
  .getElementById("searchInput")
  .addEventListener(
    "input",
    renderMedia
  );

  document
  .getElementById("typeFilter")
  .addEventListener(
    "change",
    renderMedia
  );

}

async function loadMedia(){

  try{

    const res =
    await fetch(API_URL);

    mediaData =
    await res.json();

    renderMedia();

  }catch(err){

    console.error(err);

    document
    .getElementById(
      "mediaGridContainer"
    )
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
  document
  .getElementById("typeFilter")
  .value
  .toLowerCase();

  const container =
  document
  .getElementById(
    "mediaGridContainer"
  );

  container.innerHTML = "";

  const filtered =
  mediaData.filter(item=>{

    const name =
    item.name.toLowerCase();

    const type =
    item.type.toLowerCase();

    const matchKeyword =
    name.includes(keyword);

    const matchType =
    filter === ""
    ||
    type === filter;

    return (
      matchKeyword
      &&
      matchType
    );

  });

  const groups = {};

  filtered.forEach(item=>{

    const type =
    item.type.toUpperCase();

    if(!groups[type]){

      groups[type] = [];

    }

    groups[type].push(item);

  });

  Object.keys(groups).forEach(type=>{

    createGroup(
      type,
      groups[type]
    );

  });

}

/* =========================
   GROUP
========================= */

function createGroup(
  title,
  items
){

  const wrapper =
  document.createElement("div");

  wrapper.className =
  "company-group";

  wrapper.innerHTML =
  `
  <div class="company-header">

    <div class="company-label">
      ${title}
    </div>

  </div>

  <div class="gallery-container">

  </div>
  `;

  const gallery =
  wrapper.querySelector(
    ".gallery-container"
  );

  items.forEach(item=>{

    gallery.appendChild(
      createCard(item)
    );

  });

  document
  .getElementById(
    "mediaGridContainer"
  )
  .appendChild(wrapper);

}

/* =========================
   CARD
========================= */

function createCard(item){

  const card =
  document.createElement("div");

  card.className =
  "banner-card";

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

  card.addEventListener(
    "click",
    ()=>{
      selectMedia(item);
    }
  );

  return card;

}

/* =========================
   THUMBNAIL
========================= */

function getThumbnail(item){

  const type =
  item.type.toLowerCase();

  if(type === "image"){

    return `
      <img
      src="${item.url}"
      alt="">
    `;

  }

  if(type === "youtube"){

    const id =
    extractYoutubeID(
      item.url
    );

    return `
      <img
      src="https://img.youtube.com/vi/${id}/hqdefault.jpg"
      alt="">
    `;

  }

  if(type === "video"){

    return `
      <div class="media-icon">
        🎬
      </div>
    `;

  }

if(type === "youtubemusic"){

  return `
    <div class="media-icon">
      🎵
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
  item.type.toLowerCase();

  if(
    type === "image"
    ||
    type === "video"
    ||
    type === "youtube"
  ){

    openPopup(item);

  }

  if(
    type === "mp3"
    ||
    type === "spotify"
  ){

    playAudio(item);

  }

}

/* =========================
   PREVIEW AREA
========================= */

function updatePreview(item){

  const preview =
  document.getElementById(
    "previewArea"
  );

  const type =
  item.type.toLowerCase();

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
    extractYoutubeID(
      item.url
    );

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

  else if(type === "spotify"){

    preview.innerHTML =
    `
    <div class="preview-video-icon">
      🎧 SPOTIFY
    </div>
    `;

  }

  else{

    preview.innerHTML =
    `
    <div class="preview-video-icon">
      🎵 MP3
    </div>
    `;

  }

}

/* =========================
   POPUP
========================= */

function openPopup(item){

  if(
    !popupWindow
    ||
    popupWindow.closed
  ){

    popupWindow =
    window.open(
      "",
      "MediaPopup",
      "width=1600,height=900"
    );

  }

  const type =
  item.type.toLowerCase();

  let bodyContent = "";

  /* IMAGE */

  if(type === "image"){

    bodyContent =
    `
    <img
    src="${item.url}"
    style="
    width:100vw;
    height:100vh;
    object-fit:contain;">
    `;

  }

  /* VIDEO */

  if(type === "video"){

    bodyContent =
    `
    <video
      id="popupVideo"
      style="
      width:100vw;
      height:100vh;
      object-fit:contain;">

      <source src="${item.url}">
    </video>

    <script>

    document.addEventListener(
      'keydown',
      function(e){

        if(
          e.code==='Space'
          ||
          e.code==='Enter'
        ){

          e.preventDefault();

          const v =
          document.getElementById(
          'popupVideo'
          );

          if(v.paused){

            v.play();

          }else{

            v.pause();

          }

        }

      }
    );

    <\/script>
    `;

  }

  /* YOUTUBE */

  if(type === "youtube"){

    const id =
    extractYoutubeID(
      item.url
    );

    bodyContent =
    `
    <div id="player"></div>

    <script src="https://www.youtube.com/iframe_api"><\/script>

    <script>

    let player;

    function onYouTubeIframeAPIReady(){

      player =
      new YT.Player(
        'player',
        {
          width:'100%',
          height:'100%',
          videoId:'${id}',
          playerVars:{
            autoplay:0,
            controls:1,
            rel:0
          }
        }
      );

    }

    document.addEventListener(
      'keydown',
      function(e){

        if(
          e.code==='Space'
          ||
          e.code==='Enter'
        ){

          e.preventDefault();

          const state =
          player.getPlayerState();

          if(state===1){

            player.pauseVideo();

          }else{

            player.playVideo();

          }

        }

      }
    );

    <\/script>
    `;

  }

  popupWindow.document.open();

  popupWindow.document.write(
  `
  <html>

  <head>

  <title>
    Media Display
  </title>

  <style>

  html,
  body{
    margin:0;
    width:100%;
    height:100%;
    background:#000;
    overflow:hidden;
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

  document.documentElement
  .requestFullscreen();

  <\/script>

  </body>

  </html>
  `
  );

  popupWindow.document.close();

}

/* =========================
   AUDIO
========================= */

function playAudio(item){

  const area =
  document.getElementById(
    "audioArea"
  );

  const type =
  item.type.toLowerCase();

  if(type === "spotify"){

    let embed =
    item.url.replace(
      "open.spotify.com/",
      "open.spotify.com/embed/"
    );

    area.innerHTML =
    `
    <iframe
      src="${embed}"
      width="100%"
      height="352"
      loading="lazy">
    </iframe>
    `;

  }else{

    area.innerHTML =
    `
    <audio
      controls
      autoplay
      style="width:100%;">

      <source
      src="${item.url}">
    </audio>
    `;

  }

}

/* =========================
   YOUTUBE ID
========================= */

function extractYoutubeID(url){

  const regExp =
  /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=))([^#&?]*).*/;

  const match =
  url.match(regExp);

  if(
    match
    &&
    match[7].length === 11
  ){

    return match[7];

  }

  return "";

}
