const LOCALHOST_URL = "http://localhost:3000";
const VERSION_URL = "https://menuutama.github.io/tropical/version.json";

const mainFrame = document.getElementById("mainFrame");

const hamburgerBtn = document.getElementById("hamburgerBtn");
const sideMenu = document.getElementById("sideMenu");
const sideOverlay = document.getElementById("sideOverlay");
const sideClose = document.getElementById("sideClose");

/* =========================
   SIDE MENU OPEN / CLOSE
========================= */

function openSideMenu(){
  sideMenu.classList.add("show");
  sideOverlay.classList.add("show");
}

function closeSideMenu(){
  sideMenu.classList.remove("show");
  sideOverlay.classList.remove("show");
}

if(hamburgerBtn){
  hamburgerBtn.addEventListener("click", openSideMenu);
}

if(sideClose){
  sideClose.addEventListener("click", closeSideMenu);
}

if(sideOverlay){
  sideOverlay.addEventListener("click", closeSideMenu);
}

/* =========================
   LOAD PAGE TO IFRAME
========================= */

function setActiveMenu(url){
  document.querySelectorAll(".nav-btn").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.url === url);
  });

  document.querySelectorAll(".side-btn").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.url === url);
  });
}

function loadPage(url){
  mainFrame.src = url;
  setActiveMenu(url);
  closeSideMenu();
}

document.querySelectorAll(".nav-btn").forEach(btn=>{
  btn.addEventListener("click", function(){
    loadPage(this.dataset.url);
  });
});

document.querySelectorAll(".side-btn").forEach(btn=>{
  btn.addEventListener("click", function(){
    loadPage(this.dataset.url);
  });
});

/* =========================
   LOCALHOST STATUS
========================= */

async function checkLocalhostStatus(){
  const toggle = document.getElementById("localhostToggle");

  if(!toggle) return false;

  try{
    const res = await fetch(`${LOCALHOST_URL}/api/status?time=${Date.now()}`, {
      method:"GET",
      cache:"no-store"
    });

    if(res.ok){
      toggle.classList.remove("offline");
      toggle.classList.add("online");
      return true;
    }
  }catch(e){}

  toggle.classList.remove("online");
  toggle.classList.add("offline");
  return false;
}

/* =========================
   VERSION COMPARE
========================= */

function compareVersion(localV, onlineV){
  const local = String(localV).split(".").map(Number);
  const online = String(onlineV).split(".").map(Number);

  for(let i = 0; i < Math.max(local.length, online.length); i++){
    const a = local[i] || 0;
    const b = online[i] || 0;

    if(b > a) return true;
    if(b < a) return false;
  }

  return false;
}

/* =========================
   CHECK UPDATE
========================= */

async function checkUpdate(){
  const updateBtn = document.getElementById("updateBtn");

  if(!updateBtn) return;

  updateBtn.style.display = "none";
  updateBtn.classList.remove("has-update");

  try{
    const onlineRes = await fetch(`${VERSION_URL}?time=${Date.now()}`, {
      cache:"no-store"
    });

    const onlineData = await onlineRes.json();

    const localRes = await fetch(`${LOCALHOST_URL}/api/version?time=${Date.now()}`, {
      cache:"no-store"
    });

    const localData = await localRes.json();

    const needUpdate = compareVersion(
      localData.currentVersion,
      onlineData.latestVersion
    );

    if(needUpdate){
      updateBtn.style.display = "flex";
      updateBtn.classList.add("has-update");

      updateBtn.onclick = function(e){
        e.preventDefault();

        const confirmUpdate = confirm(
          `New update available!\n\nCurrent Version: ${localData.currentVersion}\nLatest Version: ${onlineData.latestVersion}\n\nDownload update now?`
        );

        if(confirmUpdate){
          window.open(
            onlineData.downloadUrl,
            "UpdateInstallerPopup",
            "width=700,height=600,left=300,top=120,resizable=yes,scrollbars=yes"
          );
        }
      };
    }

  }catch(e){
    updateBtn.style.display = "none";
    updateBtn.classList.remove("has-update");
  }
}

/* =========================
   LOCALHOST BUTTON
========================= */

document.addEventListener("DOMContentLoaded", function(){
  const btn = document.getElementById("localhostBtn");

  checkLocalhostStatus();
  checkUpdate();

  setInterval(checkLocalhostStatus, 3000);
  setInterval(checkUpdate, 15000);

  if(btn){
    btn.addEventListener("click", async function(e){
      e.preventDefault();

      const isOnline = await checkLocalhostStatus();

      if(isOnline){
        const confirmOff = confirm("Turn OFF localhost?");

        if(confirmOff){
          try{
            await fetch(`${LOCALHOST_URL}/api/shutdown?time=${Date.now()}`, {
              method:"GET",
              cache:"no-store"
            });
          }catch(e){}

          setTimeout(checkLocalhostStatus, 1200);
        }

      }else{
        const wantDownload = confirm(
          "LOCALHOST is OFF.\n\nIf you already installed it, please open the shortcut: Tropical Dinner Localhost.\n\nClick OK to download installer.\nClick Cancel if already installed."
        );

        if(wantDownload){
          try{
            const res = await fetch(`${VERSION_URL}?time=${Date.now()}`, {
              cache:"no-store"
            });

            const data = await res.json();

            window.open(
              data.downloadUrl,
              "DownloadInstallerPopup",
              "width=700,height=600,left=300,top=120,resizable=yes,scrollbars=yes"
            );

          }catch(e){
            alert("Cannot get installer link. Please check internet connection.");
          }
        }
      }
    });
  }
});
