// Preconnect to CDN
var preconnect = document.createElement("link");
preconnect.rel = "preconnect";
preconnect.href = "https://cdn.jsdelivr.net";
document.head.appendChild(preconnect);

// Preload Bootstrap icons CSS
var preload = document.createElement("link");
preload.rel = "preload";
preload.as = "style";
preload.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css";
document.head.appendChild(preload);

function loadScript(src, callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = src;
  script.defer = true;
  if (callback) script.onload = callback;
  document.head.appendChild(script);
}

function loadCSS(href, callback) {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  var supportsOnLoad = "onload" in link;
  if (supportsOnLoad) {
    link.onload = callback;
  } else {
    setTimeout(function() {
      callback();
    }, 1000);
  }
  document.head.appendChild(link);
}

loadCSS('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css', function() {});

if (window.location.pathname === "/index.html" || window.location.pathname === "/") {
  const options = ["Right-Click to access more features", "Set a custom background in settings.", "Tab Cloaking is highly recommended", "About:Blank Cloak is highly recommended", "This site was originally created for fun and educational purposes."];

  function getRandomOption() {
    const randomNumber = Math.floor(Math.random() * options.length);
    return options[randomNumber];
  }

  const placeholder = document.getElementById("placeholder");
  const bar = document.querySelector(".browse-input");
  const search = document.getElementById("search");

  function setRandomPlaceholder() {
    if (!placeholder) return;
    placeholder.textContent = getRandomOption();
  }

  setRandomPlaceholder();

  if (bar && search) {
    bar.addEventListener("focus", () => {
      search.style.marginLeft = "-367px";
    });

    bar.addEventListener("blur", () => {
      search.style.marginLeft = "-150px";
    });
  }
}

window.addEventListener("load", function() {
  // Register service worker for asset caching
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }

  loadScript("/worker.js");

  if (window.location.pathname === "/index.html" || window.location.pathname === "/") {
    location.href = "/mobile.html";
  }

  if (window.location.pathname === '/loading.html') {
    var rm = document.querySelector('.themesExcluded');
    if (rm) rm.style.display = 'none';
  }
});
