const API_URL = "https://script.google.com/macros/s/AKfycbw8TVGqTWkdddXa2C21rFt4cJzw1M5g_hfSijcyfp-A5S-dQ7o1MU2qrQ7x3y3m4y1T/exec";

let allMedia = [];
let popupWindow = null;

/* =========================
   LOAD DATA
========================= */

window.addEventListener("load", () => {

    loadMedia();

    document
    .getElementById("searchInput")
    .addEventListener("input", renderMedia);

    document
    .getElementById("typeFilter")
    .addEventListener("change", renderMedia);

});

async function loadMedia(){

    try{

        const response =
        await fetch(API_URL);

        allMedia =
        await response.json();

        renderMedia();

    }catch(err){

        console.error(err);

        document
        .getElementById("mediaGridContainer")
        .innerHTML =
        `
        <div class="error-box">
            Failed to load media data.
        </div>
        `;

    }

}

/* =========================
   RENDER
========================= */

function renderMedia(){

    const container =
    document.getElementById(
        "mediaGridContainer"
    );

    const keyword =
    document
    .getElementById("searchInput")
    .value
    .toLowerCase();

    const filterType =
    document
    .getElementById("typeFilter")
    .value
    .toLowerCase();

    container.innerHTML = "";

    const filtered =
    allMedia.filter(item=>{

        const name =
        item.name.toLowerCase();

        const type =
        item.type.toLowerCase();

        const matchName =
        name.includes(keyword);

        const matchType =
        filterType === ""
        ||
        type === filterType;

        return matchName && matchType;

    });

    const grouped = {};

    filtered.forEach(item=>{

        const type =
        item.type.toUpperCase();

        if(!grouped[type]){

            grouped[type] = [];

        }

        grouped[type].push(item);

    });

    Object.keys(grouped).forEach(type=>{

        const section =
        document.createElement("div");

        section.className =
        "company-group";

        section.innerHTML =
        `
        <div class="company-header">
            <div class="company-label">
                ${type}
            </div>
        </div>

        <div
            class="gallery-container"
            id="group-${type}">
        </div>
        `;

        container.appendChild(section);

        const groupContainer =
        section.querySelector(
            ".gallery-container"
        );

        grouped[type].forEach(item=>{

            const card =
            createCard(item);

            groupContainer
            .appendChild(card);

        });

    });

}

/* =========================
   CARD
========================= */

function createCard(item){

    const card =
    document.createElement("div");

    card.className =
    "banner-card";

    let preview =
    getPreview(item);

    card.innerHTML =
    `
    <div class="image-wrapper">

        ${preview}

    </div>

    <div class="card-footer">

        <div class="emp-label-name">

            ${item.name}

        </div>

    </div>
    `;

    card.onclick =
    ()=>selectMedia(item);

    return card;

}

/* =========================
   PREVIEW
========================= */

function getPreview(item){

    const type =
    item.type.toLowerCase();

    if(type === "image"){

        return `
        <img
        src="${item.url}"
        loading="lazy">
        `;

    }

    if(type === "youtube"){

        const id =
        extractYoutubeID(
            item.url
        );

        return `
        <img
        src="https://img.youtube.com/vi/${id}/hqdefault.jpg">
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
   SELECT
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
        src="${item.url}"
        class="preview-image">
        `;

    }

    else if(type === "youtube"){

        const id =
        extractYoutubeID(
            item.url
        );

        preview.innerHTML =
        `
        <iframe
        src="https://www.youtube.com/embed/${id}"
        allowfullscreen>
        </iframe>
        `;

    }

    else if(type === "video"){

        preview.innerHTML =
        `
        <video
        controls
        preload="metadata">

            <source
            src="${item.url}">

        </video>
        `;

    }

    else{

        preview.innerHTML =
        `
        <div class="preview-audio">

            ${item.name}

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

    let html = "";

    if(type === "image"){

        html =
        `
        <img
        src="${item.url}"
        style="
        width:100vw;
        height:100vh;
        object-fit:contain;">
        `;

    }

    else if(type === "youtube"){

        const id =
        extractYoutubeID(
            item.url
        );

        html =
        `
        <iframe
        src="https://www.youtube.com/embed/${id}"
        style="
        width:100vw;
        height:100vh;
        border:none;"
        allowfullscreen>
        </iframe>
        `;

    }

    else if(type === "video"){

        html =
        `
        <video
        id="popupVideo"
        style="
        width:100vw;
        height:100vh;
        object-fit:contain;">

            <source
            src="${item.url}">
        </video>

        <script>

        document
        .addEventListener(
            'keydown',
            function(e){

                if(
                    e.code === 'Space'
                    ||
                    e.code === 'Enter'
                ){

                    e.preventDefault();

                    const v =
                    document
                    .getElementById(
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

    popupWindow.document.open();

    popupWindow.document.write(
    `
    <html>

    <head>

    <title>
    Media Display
    </title>

    <style>

    body{
        margin:0;
        background:black;
        overflow:hidden;
        display:flex;
        justify-content:center;
        align-items:center;
    }

    iframe{
        border:none;
    }

    </style>

    </head>

    <body>

    ${html}

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

        const embedUrl =
        item.url.replace(
            "open.spotify.com/",
            "open.spotify.com/embed/"
        );

        area.innerHTML =
        `
        <iframe
        src="${embedUrl}"
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
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=))([^#\&\?]*).*/;

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
