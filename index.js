const LOCALHOST_URL = "http://localhost:3000";
const VERSION_URL = "https://menuutama.github.io/tropical/version.json";
const LOCALHOST_PROTOCOL = "eventmedia://start";

const mainFrame = document.getElementById("mainFrame");

const hamburgerBtn = document.getElementById("hamburgerBtn");
const sideMenu = document.getElementById("sideMenu");
const sideOverlay = document.getElementById("sideOverlay");
const sideClose = document.getElementById("sideClose");

/* SIDE MENU */
function openSideMenu(){
  sideMenu.classList.add("show");
  sideOverlay.classList.add("show");
}

function closeSideMenu(){
  sideMenu.classList.remove("show");
  sideOverlay.classList.remove("show");
}

if(hamburgerBtn) hamburgerBtn.addEventListener("click", openSideMenu);
if(sideClose) sideClose.addEventListener("click", closeSideMenu);
if(sideOverlay) sideOverlay.addEventListener("click", closeSideMenu);

/* IFRAME MENU */
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

/* LOCALHOST UI */
function setLocalhostUI(isOnline){
  const toggle = document.getElementById("localhostToggle");
  const text = document.querySelector(".localhost-text");

  if(!toggle) return;

  if(isOnline){
    toggle.classList.remove("offline");
    toggle.classList.add("online");
    if(text) text.textContent = "LOCALHOST ON";
  }else{
    toggle.classList.remove("online");
    toggle.classList.add("offline");
    if(text) text.textContent = "LOCALHOST OFF";
  }
}

async function checkLocalhostStatus(){
  try{
    const res = await fetch(`${LOCALHOST_URL}/api/status?time=${Date.now()}`, {
      method:"GET",
      cache:"no-store"
    });

    if(res.ok){
      setLocalhostUI(true);
      return true;
    }
  }catch(e){}

  setLocalhostUI(false);
  return false;
}

/* OPEN EXE */
function openLocalhostExe(){
  window.location.href = LOCALHOST_PROTOCOL;
}

async function waitLocalhostOnline(maxTry = 15){
  for(let i = 0; i < maxTry; i++){
    const online = await checkLocalhostStatus();

    if(online){
      await checkUpdate();
      return true;
    }

    await new Promise(resolve=>setTimeout(resolve, 1000));
  }

  return false;
}

/* SHUTDOWN */
async function shutdownLocalhost(){
  try{
    await fetch(`${LOCALHOST_URL}/api/shutdown?time=${Date.now()}`, {
      method:"GET",
      cache:"no-store"
    });
  }catch(e){}

  setTimeout(async ()=>{
    await checkLocalhostStatus();
    hideUpdateButton();
  }, 1200);
}

/* VERSION COMPARE */
function compareVersion(localV, onlineV){
  const local = String(localV || "0.0.0").split(".").map(Number);
  const online = String(onlineV || "0.0.0").split(".").map(Number);

  for(let i = 0; i < Math.max(local.length, online.length); i++){
    const a = local[i] || 0;
    const b = online[i] || 0;

    if(b > a) return true;
    if(b < a) return false;
  }

  return false;
}

/* UPDATE BUTTON */
function hideUpdateButton(){
  const updateBtn = document.getElementById("updateBtn");

  if(!updateBtn) return;

  updateBtn.style.display = "none";
  updateBtn.classList.remove("has-update");
  updateBtn.onclick = null;
}

async function checkUpdate(){
  const updateBtn = document.getElementById("updateBtn");

  if(!updateBtn) return;

  hideUpdateButton();

  const isOnline = await checkLocalhostStatus();

  if(!isOnline) return;

  try{
    const onlineRes = await fetch(`${VERSION_URL}?time=${Date.now()}`, {
      cache:"no-store"
    });

    const onlineData = await onlineRes.json();

    const localRes = await fetch(`${LOCALHOST_URL}/api/version?time=${Date.now()}`, {
      cache:"no-store"
    });

    const localData = await localRes.json();

    const localVersion = localData.currentVersion;
    const latestVersion = onlineData.latestVersion;

    if(compareVersion(localVersion, latestVersion)){
      updateBtn.style.display = "flex";
      updateBtn.classList.add("has-update");

      updateBtn.onclick = function(e){
        e.preventDefault();

        const yes = confirm(
          `New update available!\n\nCurrent Version: ${localVersion}\nLatest Version: ${latestVersion}\n\nDownload update now?`
        );

        if(yes){
          window.open(
            onlineData.downloadUrl,
            "UpdateInstallerPopup",
            "width=700,height=600,left=300,top=120,resizable=yes,scrollbars=yes"
          );
        }
      };
    }

  }catch(e){
    hideUpdateButton();
  }
}

/* TOGGLE LOCALHOST FLOW */
document.addEventListener("DOMContentLoaded", function(){
  const btn = document.getElementById("localhostBtn");

  checkLocalhostStatus().then(isOnline=>{
    if(isOnline) checkUpdate();
    else hideUpdateButton();
  });

  setInterval(async ()=>{
    const online = await checkLocalhostStatus();

    if(online) checkUpdate();
    else hideUpdateButton();
  }, 5000);

  if(btn){
    btn.addEventListener("click", async function(e){
      e.preventDefault();

      const isOnline = await checkLocalhostStatus();

      if(isOnline){
        await shutdownLocalhost();
        return;
      }

      openLocalhostExe();

      const started = await waitLocalhostOnline(15);

      if(!started){
        const wantDownload = confirm(
          "LOCALHOST is OFF.\n\nIf already installed, click Cancel then allow browser to open EventMediaOffline.\n\nClick OK to download installer."
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
