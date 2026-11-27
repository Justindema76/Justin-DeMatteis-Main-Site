// Cookie consent + Meta Pixel (Shopify Studio portfolio, dataset "justindematteis.com").
// The Pixel only loads after the visitor clicks "Accept". The choice is kept in localStorage.
(function () {
  var PIXEL_ID = '1146763981685648';
  var KEY = 'jd-consent';

  function loadPixel() {
    if (window.fbq) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function choice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  function showBanner() {
    if (document.getElementById('jd-consent')) return;
    var css = document.createElement('style');
    css.textContent =
      '#jd-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:560px;margin:0 auto;' +
      'background:#0B1F33;color:#fff;font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;padding:16px 18px;' +
      'border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,.3);display:flex;flex-wrap:wrap;gap:12px;align-items:center}' +
      '#jd-consent p{margin:0;flex:1 1 260px}' +
      '#jd-consent a{color:#fff;text-decoration:underline}' +
      '#jd-consent .jd-btns{display:flex;gap:8px}' +
      '#jd-consent button{font:inherit;font-weight:700;cursor:pointer;padding:9px 16px;border-radius:4px;border:2px solid #fff}' +
      '#jd-consent .jd-yes{background:#fff;color:#0B1F33}' +
      '#jd-consent .jd-no{background:#24384C;color:#fff}';
    document.head.appendChild(css);

    var box = document.createElement('div');
    box.id = 'jd-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Cookie choice');
    box.innerHTML =
      '<p>We use cookies to see which ads and posts bring people here. Analytics always runs; ad cookies only if you say yes.</p>' +
      '<div class="jd-btns"><button type="button" class="jd-no">No thanks</button>' +
      '<button type="button" class="jd-yes">Accept</button></div>';
    box.querySelector('.jd-yes').onclick = function () { save('yes'); box.remove(); loadPixel(); };
    box.querySelector('.jd-no').onclick = function () { save('no'); box.remove(); };
    document.body.appendChild(box);
  }

  var current = choice();
  if (current === 'yes') loadPixel();
  else if (current !== 'no') {
    if (document.body) showBanner();
    else document.addEventListener('DOMContentLoaded', showBanner);
  }
})();
