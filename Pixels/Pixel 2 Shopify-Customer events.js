analytics.subscribe('checkout_completed', (event) => {
  // ── CONFIG ──────────────────────────────────────────────
  var GA4_ID          = 'G-R4P7Q8LVWW';
  var META_PIXEL_ID   = '7036816923091269';
  var TIKTOK_PIXEL_ID = 'CP7QJJBC77U0P26EFT0G';
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxEoqkhqDz9CAr9wHRKf7H-XDBKxDqdYA2P6H1vbedZRd78i5IGP1wIvWnyyJhhQ9Fv/exec';
  // ────────────────────────────────────────────────────────

  // 1. RECOVER SESSION
  var tsData = null;
  try {
    var raw = sessionStorage.getItem('travelsale_data') || localStorage.getItem('travelsale_data');
    if (raw) tsData = JSON.parse(raw);
  } catch(e) {}
  if (!tsData) return;

  // 2. VALIDATE — must have at least one UTM to confirm travelsale session
  var utmSource   = tsData.utm_source   || '';
  var utmMedium   = tsData.utm_medium   || '';
  var utmCampaign = tsData.utm_campaign || '';
  var utmContent  = tsData.utm_content  || '';
  var utmTerm     = tsData.utm_term     || '';
  var utmId       = tsData.utm_id       || '';
  var storeDomain = tsData.store_domain || event.data.checkout.shop?.domain || '';
  var referrer = tsData.referrer;
  var arrivalTime = tsData.landed_at;

  if (!utmSource && !utmMedium && !utmCampaign && !utmContent && !utmTerm && !utmId) return;

  // 3. ORDER DATA — from Shopify Customer Events API
  var checkout   = event.data.checkout;
  var orderId    = checkout.order.id;
  var orderValue = parseFloat(checkout.totalPrice.amount);
  var currency   = checkout.totalPrice.currencyCode;

  // 4. APPS SCRIPT → GOOGLE SHEET
  try {
    fetch(APPS_SCRIPT_URL, {
      method:    'POST',
      body:      JSON.stringify({
        arrival_time: arrivalTime,
        store_domain: storeDomain,
        referrer:     referrer,
        utm_source:   utmSource,
        utm_medium:   utmMedium,
        utm_campaign: utmCampaign,
        utm_content:  utmContent,
        utm_term:     utmTerm,
        utm_id:       utmId,
        order_id:     orderId,
        order_value:  orderValue
      }),
      keepalive: true,
      mode:      'no-cors'
    }).then(function() {}).catch(function() {});
  } catch(e) {}

  // 5. GA4 — wait for script load before firing
  function fireGA4() {
    try {
      window.dataLayer = window.dataLayer || [];
      if (!window.gtag) {
        window.gtag = function() { window.dataLayer.push(arguments); };
      }
      window.gtag('config', GA4_ID, { send_page_view: false });
      window.gtag('event', 'purchase', {
        send_to:        GA4_ID,
        transaction_id: orderId,
        value:          orderValue,
        currency:       currency,
        utm_source:     utmSource,
        utm_medium:     utmMedium,
        utm_campaign:   utmCampaign,
        utm_content:    utmContent,
        utm_term:       utmTerm,
        utm_id:         utmId,
        store_domain:   storeDomain,
        page_referrer:  referrer
      });
    } catch(e) {}
  }

  if (!document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
    var gScript   = document.createElement('script');
    gScript.async = true;
    gScript.src   = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    gScript.onload = function() {
      window.gtag('js', new Date());
      fireGA4();
    };
    document.head.appendChild(gScript);
  } else {
    var ga4Tries = 0;
    var ga4Timer = setInterval(function() {
      if (typeof window.gtag === 'function') {
        clearInterval(ga4Timer);
        fireGA4();
      } else if (++ga4Tries > 20) {
        clearInterval(ga4Timer);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        fireGA4();
      }
    }, 100);
  }

  // 6. META PIXEL — full snippet + onload safety
  function fireMetaPixel() {
    try {
      fbq('init', META_PIXEL_ID);
      fbq('track', 'Purchase', {
        value:        orderValue,
        currency:     currency,
        content_type: 'product',
        order_id:     orderId,
        content_url:  storeDomain
      });
    } catch(e) {}
  }

  if (!window.fbq) {
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;
      n=f.fbq=function(){ n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments); };
      if(!f._fbq) f._fbq=n;
      n.push=n; n.loaded=!0; n.version='2.0'; n.queue=[];
      t=b.createElement(e); t.async=!0; t.src=v;
      t.onload = function() { fireMetaPixel(); };
      s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  } else {
    fireMetaPixel();
  }

      // 7. TIKTOK PIXEL
  function fireTikTok() {
    try {
      window.ttq.load(TIKTOK_PIXEL_ID);
      window.ttq.track('PlaceAnOrder', {
        value:        orderValue,
        currency:     currency,
        order_id:     orderId,
        content_type: 'product',
        description:  storeDomain
      });
    } catch(e) {}
  }

  if (!window.ttq) {
    var ttScript    = document.createElement('script');
    ttScript.async  = true;
    ttScript.src    = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    ttScript.onload = function() { fireTikTok(); };
    document.head.appendChild(ttScript);
  } else {
    fireTikTok();
  }

  // 8. CLEANUP
  try {
    localStorage.removeItem('travelsale_data');
    sessionStorage.removeItem('travelsale_data');
  } catch(e) {}
});