(function () {
  const DELAY_MS = 5000;

  let insideFrame = false;
  try {
    insideFrame = window.self !== window.top;
  } catch {
    insideFrame = true;
  }

  if (insideFrame) return;

  const path = window.location.pathname;
  if (path === '/loading.html' || path === '/welcome.html') return;

  const NAV_HEADER_PATHS = new Set(['/apps.html', '/gms.html', '/settings.html']);

  const DESKTOP_UNIT = {
    key: '45a8c2f1517f61cbabc897106f47084b',
    width: 728,
    height: 90,
  };

  const MOBILE_UNIT = {
    key: '9fce6c42f0388b8e0dbd8388eb490ac7',
    width: 320,
    height: 50,
  };

  function injectStyles() {
    if (!document.head) return;
    if (document.getElementById('top-frame-styles')) return;

    const style = document.createElement('style');
    style.id = 'top-frame-styles';
    style.textContent = `
      .top-frame {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 106px;
        padding: 8px 0;
        box-sizing: border-box;
        pointer-events: none;
      }

      .top-frame--inline {
        margin: 8px auto 12px;
      }

      .top-frame--inside {
        width: 100%;
        min-height: 0;
        padding: 0;
        margin: 0;
        justify-content: flex-end;
      }

      #mytopnav.has-top-frame-nav {
        position: relative;
      }

      #mytopnav.has-top-frame-nav > :not(.top-frame--nav) {
        position: relative;
        z-index: 1;
      }

      #mytopnav.has-top-frame-nav .top-frame--nav {
        position: absolute;
        top: 50%;
        left: 260px;
        right: auto;
        width: 728px;
        min-height: 0;
        padding: 0;
        margin: 0;
        transform: translateY(-50%);
        justify-content: flex-start;
        z-index: 0;
      }

      .top-frame .panel {
        overflow: hidden;
        pointer-events: auto;
      }

      .top-frame .panel--desktop {
        width: 728px;
        height: 90px;
      }

      .top-frame .panel--mobile {
        display: none;
        width: 320px;
        height: 50px;
      }

      #urlBar.has-top-frame {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        padding: 8px !important;
        min-height: 0 !important;
        box-sizing: border-box;
      }

      #urlBar.has-top-frame .top-frame--urlbar {
        width: 100%;
        min-height: 98px;
        padding: 0;
        margin: 0;
        justify-content: center;
      }

      #urlBar.has-top-frame .urlbar-row {
        display: flex;
        align-items: center;
        width: 100%;
        min-width: 0;
      }

      #urlBar.has-top-frame .urlbar-row #searchBar {
        flex: 1 1 auto;
        width: auto !important;
        min-width: 0;
      }

      #urlBar.has-top-frame ~ #menu {
        margin-top: 136px;
      }

      #urlBar.has-top-frame ~ #sidebar {
        padding-top: 150px;
      }

      #urlBar.has-top-frame ~ .iframe-container iframe {
        height: calc(100% - 146px) !important;
      }

      @media (max-width: 767px) {
        .top-frame {
          min-height: 66px;
        }

        #mytopnav.has-top-frame-nav .top-frame--nav {
          left: 0;
          right: 0;
          width: auto;
          justify-content: center;
        }

        .top-frame .panel--desktop {
          display: none;
        }

        .top-frame .panel--mobile {
          display: block;
        }

        #urlBar.has-top-frame .top-frame--urlbar {
          min-height: 64px;
        }

        #urlBar.has-top-frame ~ #menu {
          margin-top: 102px;
        }

        #urlBar.has-top-frame ~ #sidebar {
          padding-top: 116px;
        }

        #urlBar.has-top-frame ~ .iframe-container iframe {
          height: calc(100% - 112px) !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function findAnchor() {
    const dedicatedTarget = document.getElementById('top-frame-target');
    if (dedicatedTarget) return { type: 'inside', element: dedicatedTarget };

    const nav = document.getElementById('mytopnav');
    if (nav) {
      return { type: NAV_HEADER_PATHS.has(path) ? 'nav' : 'before', element: nav };
    }

    const urlBar = document.getElementById('urlBar');
    if (urlBar) return { type: 'urlBar', element: urlBar };

    const topBarContainer = document.querySelector('.top-bar-container');
    if (topBarContainer) return { type: 'before', element: topBarContainer };

    const topBar = document.querySelector('.top-bar');
    if (topBar) return { type: 'before', element: topBar };

    return null;
  }

  function createMount(anchor) {
    if (!anchor || !anchor.element) return null;
    const existing = document.getElementById('top-frame');
    if (existing) return existing;

    const frame = document.createElement('div');
    frame.id = 'top-frame';
    frame.className = 'top-frame';

    const desktopPanel = document.createElement('div');
    desktopPanel.id = 'panel-desktop';
    desktopPanel.className = 'panel panel--desktop';

    const mobilePanel = document.createElement('div');
    mobilePanel.id = 'panel-mobile';
    mobilePanel.className = 'panel panel--mobile';

    frame.appendChild(desktopPanel);
    frame.appendChild(mobilePanel);

    if (anchor.type === 'urlBar') {
      frame.classList.add('top-frame--urlbar');
      anchor.element.classList.add('has-top-frame');

      const row = document.createElement('div');
      row.className = 'urlbar-row';

      while (anchor.element.firstChild) {
        row.appendChild(anchor.element.firstChild);
      }

      anchor.element.appendChild(frame);
      anchor.element.appendChild(row);
      return frame;
    }

    if (anchor.type === 'inside') {
      frame.classList.add('top-frame--inside');
      anchor.element.appendChild(frame);
      return frame;
    }

    if (anchor.type === 'nav') {
      frame.classList.add('top-frame--nav');
      anchor.element.classList.add('has-top-frame-nav');
      anchor.element.appendChild(frame);
      return frame;
    }

    frame.classList.add('top-frame--inline');
    anchor.element.parentNode.insertBefore(frame, anchor.element);
    return frame;
  }

  function loadUnitInto(panel, unit) {
    if (!panel || panel.dataset.loaded === '1') return;

    panel.dataset.loaded = '1';

    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.text = `
      atOptions = {
        'key': '${unit.key}',
        'format': 'iframe',
        'height': ${unit.height},
        'width': ${unit.width},
        'params': {}
      };
    `;

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `https://www.highperformanceformat.com/${unit.key}/invoke.js`;

    panel.appendChild(optionsScript);
    panel.appendChild(invokeScript);
  }

  function loadByViewport() {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    if (isMobile) {
      loadUnitInto(document.getElementById('panel-mobile'), MOBILE_UNIT);
      return;
    }

    loadUnitInto(document.getElementById('panel-desktop'), DESKTOP_UNIT);
  }

  function init() {
    injectStyles();

    const anchor = findAnchor();
    if (!anchor) return;

    createMount(anchor);
    window.setTimeout(loadByViewport, DELAY_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
