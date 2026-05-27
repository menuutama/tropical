async function loadHeader() {
  let res = await fetch("header.html");
  let data = await res.text();
  document.getElementById("header").innerHTML = data;
}

loadHeader();