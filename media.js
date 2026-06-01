const API_URL = "https://script.google.com/macros/s/AKfycbw8TVGqTWkdddXa2C21rFt4cJzw1M5g_hfSijcyfp-A5S-dQ7o1MU2qrQ7x3y3m4y1T/exec";

let mediaData = [];

/*---------- LOAD MEDIA --------------*/
window.onload = async () => {

  const res =
  await fetch(API_URL);

  mediaData =
  await res.json();

  renderMedia();

};

/*-------------- REDER MEDIA --------------*/
function renderMedia() {

  const container =
  document.getElementById(
    "mediaGridContainer"
  );

  container.innerHTML = "";

  const groups = {};

  mediaData.forEach(item => {

    const type =
    item.type;

    if(!groups[type])
      groups[type] = [];

    groups[type].push(item);

  });

  Object.keys(groups).forEach(type => {

    const group =
    document.createElement("div");

    group.className =
    "company-group";

    group.innerHTML = `
      <div class="company-header">
        <div class="company-label">
          ${type}
        </div>
      </div>

      <div class="gallery-container">
      ${groups[type]
      .map(item=>`
        <div
        class="banner-card"
        onclick="openMedia(
        '${item.type}',
        '${item.url}'
        )">

          <div
          class="image-wrapper">

          <div
          style="
          font-size:70px;">
          ${getIcon(item.type)}
          </div>

          </div>

          <div
          class="card-footer">

            <div
            class="emp-label-name">
              ${item.name}
            </div>

          </div>

        </div>
      `).join("")}
      </div>
    `;

    container.appendChild(
      group
    );

  });

}

/*------------- ICON ------------------*/
function getIcon(type){

  switch(
    type.toLowerCase()
  ){

    case "image":
      return "🖼️";

    case "video":
      return "🎬";

    case "youtube":
      return "▶️";

    case "mp3":
      return "🎵";

    case "spotify":
      return "🎧";

    default:
      return "📁";

  }

}

/*---------------- POPUP FULLSCREEN -----------------------*/
function openMedia(
  type,
  url
){

  type =
  type.toLowerCase();

  if(
    type==="mp3" ||
    type==="spotify"
  ){

    playAudio(
      type,
      url
    );

    return;

  }

  const win =
  window.open(
    "",
    "_blank"
  );

  if(
    type==="image"
  ){

    win.document.write(`
      <html>
      <body style="
      margin:0;
      background:black;
      display:flex;
      justify-content:center;
      align-items:center;
      height:100vh;">
      <img
      src="${url}"
      style="
      max-width:100%;
      max-height:100%;">
      </body>
      </html>
    `);

  }

  else if(
    type==="video"
  ){

    win.document.write(`
      <html>
      <body style="
      margin:0;
      background:black;">

      <video
      id="v"
      src="${url}"
      style="
      width:100vw;
      height:100vh;
      object-fit:contain;">
      </video>

      <script>

      document.body.onclick=
      ()=>toggle();

      document.onkeydown=
      e=>{

        if(
          e.code==='Space' ||
          e.code==='Enter'
        ){

          e.preventDefault();

          toggle();

        }

      };

      function toggle(){

        const v=
        document.getElementById('v');

        if(v.paused)
          v.play();
        else
          v.pause();

      }

      document.documentElement
      .requestFullscreen();

      </script>

      </body>
      </html>
    `);

  }

  else if(
    type==="youtube"
  ){

    const id =
    extractYoutubeID(
      url
    );

    win.document.write(`
      <html>
      <body style="
      margin:0;
      background:black;">

      <iframe
      width="100%"
      height="100%"
      src="https://www.youtube.com/embed/${id}"
      frameborder="0"
      allowfullscreen
      style="
      position:fixed;
      inset:0;">
      </iframe>

      <script>
      document.documentElement
      .requestFullscreen();
      </script>

      </body>
      </html>
    `);

  }

}

/*------------------ YOUTUBE ID ----------------*/
function extractYoutubeID(
  url
){

  const reg =
  /(?:v=|\/)([0-9A-Za-z_-]{11})/;

  const match =
  url.match(reg);

  return match
    ? match[1]
    : "";

}

/*------------------ AUDIO PLAYER ----------------*/
function playAudio(
  type,
  url
){

  const area =
  document.getElementById(
    "audioArea"
  );

  if(
    type==="spotify"
  ){

    area.innerHTML = `
      <iframe
      src="${url.replace(
      'open.spotify.com/',
      'open.spotify.com/embed/'
      )}"
      width="100%"
      height="352"
      frameborder="0">
      </iframe>
    `;

  }else{

    area.innerHTML = `
      <audio
      controls
      autoplay
      style="width:100%;">
        <source
        src="${url}">
      </audio>
    `;

  }

}
