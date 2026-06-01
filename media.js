function tapisMedia(){

  const dropdown =
    document.getElementById(
      "mediaTypeDropdown"
    ).value;

  const keyword =
    document.getElementById(
      "mediaSearchInput"
    ).value.toLowerCase();

  const items =
    document.querySelectorAll(
      ".media-item"
    );

  items.forEach(item=>{

    const jenis =
      item.dataset.jenis;

    const nama =
      item.dataset.nama.toLowerCase();

    const matchJenis =
      dropdown==="all" ||
      jenis===dropdown;

    const matchNama =
      nama.includes(keyword);

    item.style.display =
      (matchJenis && matchNama)
      ? "block"
      : "none";

  });

}

function paparMedia(jenis,url){

  const image =
    document.getElementById(
      "outputImage"
    );

  const video =
    document.getElementById(
      "outputVideo"
    );

  const videoSource =
    document.getElementById(
      "videoSource"
    );

  const audio =
    document.getElementById(
      "outputAudio"
    );

  const audioSource =
    document.getElementById(
      "audioSource"
    );

  const audioBox =
    document.getElementById(
      "audioPlayerContainer"
    );

  const placeholder =
    document.getElementById(
      "placeholderText"
    );

  const display =
    document.getElementById(
      "mediaDisplayBox"
    );

  image.style.display="none";
  video.style.display="none";
  audioBox.style.display="none";

  video.pause();
  audio.pause();

  placeholder.style.display="none";

  if(jenis==="gambar"){

    image.src=url;
    image.style.display="block";

    mintaFullscreen(display);

  }

  else if(jenis==="video"){

    videoSource.src=url;

    video.load();

    video.style.display="block";

    video.play();

    mintaFullscreen(display);

  }

  else if(jenis==="lagu"){

    audioSource.src=url;

    audio.load();

    audioBox.style.display="block";

    audio.play();

  }

}

function mintaFullscreen(element){

  if(element.requestFullscreen){
    element.requestFullscreen();
  }
  else if(element.webkitRequestFullscreen){
    element.webkitRequestFullscreen();
  }
  else if(element.msRequestFullscreen){
    element.msRequestFullscreen();
  }

}

document.addEventListener(
  "fullscreenchange",
  keluarFullscreen
);

function keluarFullscreen(){

  if(!document.fullscreenElement){

    document
      .getElementById(
        "outputVideo"
      )
      .pause();

  }

}
