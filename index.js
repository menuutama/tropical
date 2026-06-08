/* =========================
   PASSWORD LOGIN
========================= */ 

const ADMIN_PASSWORD = "Admin-dinner123";

const loginScreen = document.getElementById("loginScreen");
const adminSystem = document.getElementById("adminSystem");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const mainFrame = document.getElementById("mainFrame");

/*
  PUNCA MASALAH LOGIN 3 KALI:
  iframe sebelum ni load index.html. Bila index.html tu ialah admin panel,
  dia masuk admin panel dalam admin panel, jadi nav/login jadi berlapis.
  Fix: iframe default sekarang load winner.html, bukan index.html.
*/

function showAdmin(){
  loginScreen.style.display = "none";
  adminSystem.style.display = "block";
  sendAdminStatusToIframe();
}

function showLogin(){
  loginScreen.style.display = "flex";
  adminSystem.style.display = "none";
}

function login(){
  const password = passwordInput.value.trim();

  if(password === ADMIN_PASSWORD){
    sessionStorage.setItem("adminLogin", "yes");
    loginError.textContent = "";
    showAdmin();
  }else{
    loginError.textContent = "Wrong password.";
    passwordInput.value = "";
    passwordInput.focus();
  }
}

if(sessionStorage.getItem("adminLogin") === "yes"){
  showAdmin();
}else{
  showLogin();
}

loginBtn?.addEventListener("click", login);

passwordInput?.addEventListener("keydown", function(e){
  if(e.key === "Enter"){
    login();
  }
});

/* =========================
   SEND ADMIN STATUS TO WINNER PAGE
========================= */

function sendAdminStatusToIframe(){
  if(sessionStorage.getItem("adminLogin") !== "yes"){
    return;
  }

  try{
    mainFrame?.contentWindow?.postMessage({
      type:"TROPICAL_ADMIN_STATUS",
      isAdmin:true
    }, "*");
  }catch(err){
    console.log(err);
  }
}

mainFrame?.addEventListener("load", function(){
  setTimeout(sendAdminStatusToIframe, 200);
  setTimeout(sendAdminStatusToIframe, 800);
});

window.addEventListener("message", function(event){
  const data = event.data || {};

  if(data.type === "TROPICAL_WINNER_PAGE_READY"){
    sendAdminStatusToIframe();
  }
});

/* =========================
   ADMIN PANEL MENU
========================= */

const hamburgerBtn = document.getElementById("hamburgerBtn");
const sideMenu = document.getElementById("sideMenu");
const sideOverlay = document.getElementById("sideOverlay");
const sideClose = document.getElementById("sideClose");

function openSideMenu(){
  sideMenu?.classList.add("show");
  sideOverlay?.classList.add("show");
}

function closeSideMenu(){
  sideMenu?.classList.remove("show");
  sideOverlay?.classList.remove("show");
}

hamburgerBtn?.addEventListener("click", openSideMenu);
sideClose?.addEventListener("click", closeSideMenu);
sideOverlay?.addEventListener("click", closeSideMenu);

function setActiveMenu(url){
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.url === url);
  });

  document.querySelectorAll(".side-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.url === url);
  });
}

function cacheBustUrl(url){
  const joiner = url.includes("?") ? "&" : "?";
  return `${url}${joiner}time=${Date.now()}`;
}

function loadPage(url){
  closeSideMenu();
  setActiveMenu(url);

  // Localhost media perlu fresh reload.
  if(url.startsWith("http://localhost:3000")){
    mainFrame.src = cacheBustUrl(url);
    return;
  }

  // Page dalaman seperti winner.html jangan load index.html semula.
  mainFrame.src = url;
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", function(){
    loadPage(this.dataset.url);
  });
});

document.querySelectorAll(".side-btn").forEach(btn => {
  btn.addEventListener("click", function(){
    loadPage(this.dataset.url);
  });
});

// Pastikan active menu betul untuk default iframe.
setActiveMenu("winner.html");
