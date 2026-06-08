/* =========================
   PASSWORD LOGIN
========================= */ 

const ADMIN_PASSWORD = "Admin-dinner123";

const loginScreen = document.getElementById("loginScreen");
const adminSystem = document.getElementById("adminSystem");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

function showAdmin(){
  loginScreen.style.display = "none";
  adminSystem.style.display = "block";
}

function showLogin(){
  loginScreen.style.display = "flex";
  adminSystem.style.display = "none";
}

function login(){

  const password =
    passwordInput.value.trim();

  if(password === ADMIN_PASSWORD){

    sessionStorage.setItem(
      "adminLogin",
      "yes"
    );

    showAdmin();
    setTimeout(sendAdminAccessToFrame, 250);

  }else{

    loginError.textContent =
      "Wrong password.";

    passwordInput.value = "";
    passwordInput.focus();

  }
}

if(
  sessionStorage.getItem(
    "adminLogin"
  ) === "yes"
){
  showAdmin();
}else{
  showLogin();
}

loginBtn.addEventListener(
  "click",
  login
);

passwordInput.addEventListener(
  "keydown",
  function(e){

    if(e.key === "Enter"){
      login();
    }

  }
);

/* =========================
   ADMIN PANEL
========================= */

const mainFrame =
  document.getElementById(
    "mainFrame"
  );

const hamburgerBtn =
  document.getElementById(
    "hamburgerBtn"
  );

const sideMenu =
  document.getElementById(
    "sideMenu"
  );

const sideOverlay =
  document.getElementById(
    "sideOverlay"
  );

const sideClose =
  document.getElementById(
    "sideClose"
  );



/* =========================
   SEND ADMIN ACCESS TO IFRAME
========================= */

function sendAdminAccessToFrame(){

  if(
    sessionStorage.getItem("adminLogin") !== "yes" ||
    !mainFrame ||
    !mainFrame.contentWindow
  ) return;

  mainFrame.contentWindow.postMessage(
    { type:"TROPICAL_ADMIN_LOGIN_OK" },
    "*"
  );

}

window.addEventListener("message", function(e){

  if(!e.data || typeof e.data !== "object") return;

  if(e.data.type === "TROPICAL_WINNER_PAGE_READY"){
    sendAdminAccessToFrame();
  }

});

mainFrame?.addEventListener("load", function(){
  sendAdminAccessToFrame();
});

/* =========================
   SIDE MENU
========================= */

function openSideMenu(){

  sideMenu.classList.add(
    "show"
  );

  sideOverlay.classList.add(
    "show"
  );
}

function closeSideMenu(){

  sideMenu.classList.remove(
    "show"
  );

  sideOverlay.classList.remove(
    "show"
  );
}

hamburgerBtn?.addEventListener(
  "click",
  openSideMenu
);

sideClose?.addEventListener(
  "click",
  closeSideMenu
);

sideOverlay?.addEventListener(
  "click",
  closeSideMenu
);

/* =========================
   ACTIVE MENU
========================= */

function setActiveMenu(url){

  document
    .querySelectorAll(".nav-btn")
    .forEach(btn => {

      btn.classList.toggle(
        "active",
        btn.dataset.url === url
      );

    });

  document
    .querySelectorAll(".side-btn")
    .forEach(btn => {

      btn.classList.toggle(
        "active",
        btn.dataset.url === url
      );

    });
}

/* =========================
   LOAD PAGE
========================= */

function loadPage(url){

  closeSideMenu();

  setActiveMenu(url);

  if(
    url.startsWith(
      "http://localhost:3000"
    )
  ){

    mainFrame.src =
      `${url}?time=${Date.now()}`;

  }else{

    mainFrame.src = url;

  }
}

/* =========================
   BUTTON CLICK
========================= */

document
  .querySelectorAll(".nav-btn")
  .forEach(btn => {

    btn.addEventListener(
      "click",
      function(){

        loadPage(
          this.dataset.url
        );

      }
    );

  });

document
  .querySelectorAll(".side-btn")
  .forEach(btn => {

    btn.addEventListener(
      "click",
      function(){

        loadPage(
          this.dataset.url
        );

      }
    );

  });
