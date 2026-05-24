# Travelsale Tracking Pixel — travelsale.com.co

Sistema de tracking de conversiones cross-domain para el evento Travelsale Colombia.
Captura compras realizadas en sitios de aliados atribuidas a tráfico de Travelsale.

## ¿Cómo funciona?
```
Campaña Travelsale → Usuario llega al aliado con UTM
                          ↓
             Tag 1 detecta UTM y guarda en localStorage
                          ↓
              Usuario compra → Thank you page
                          ↓
         Tag 2 lee localStorage → dispara a 3 destinos:
              Google Sheet · GA4 · Meta Pixel
```

## Destinos de datos

| Destino | Propósito | Confiabilidad |
|---|---|---|
| Google Sheet (Apps Script) | Fuente de verdad | ~85% |
| GA4 | Análisis en tiempo real | ~75% |
| Meta Pixel | Optimización de campañas | ~60% |

## Instalación por plataforma

| Plataforma | Tag 1 | Tag 2 | Guía |
|---|---|---|---|
| Shopify | theme.liquid | [ver](Pixels/Pixel%201-All%20pages.html) |
| Shopify | Customer Events | [ver](Pixels/Pixel%202%20Shopify-Customer%20events.js) |
| VTEX / Otros / GTM | All Pages | [ver](Pixels/Pixel%201-All%20pages.html) |
| VTEX / Otros / GTM | Confirmation page | [ver](Pixels/Pixel%202%20GTM%20-Confirm%20page.html) |

### Keywords de detección activas
```javascript
var TravelsaleKeywords = [
    'Travelsale', 'Travel_sale', 'Travel-sale', 'Travel.sale', 'Travelsale2026', 'Travelsale_2026', 'Travelsale-2026', 'ts2026', 'ts_2026', 'ts-2026', 'Travelsale_mar', 'Travelsale_marzo', 'Travelsalemarzo', 'Travelsale_oct', 'Travelsale_octubre', 'Travelsaleoct', 'Travelsaleco', 'Travelsale_co', 'Travelsalecolombia', 'ccce', 'ccceco', 'ccce2026', 'Travelsael', 'Travelslae', 'Travelsalee', 'epsilon'
  ];
```
### Keywords de exclusión de tráfico
 ```javascript
  var foreignKeywords = [
    'newsletter', 'crm', 'email', 'sms', 'push', 'push_notification', 'whatsapp', 'telegram', 'facebook', 'instagram', 'cpc', 'paid', 'always_on', 'brand_always_on', 'pago', 'pauta', 'tiktok', 'pinterest', 'fb', 'ig', 'social', 'ppc'
  ];
```
### Keywords de detección de referral Travelsale
```javascript
  var referrerDomains = [
    'Travelsale.com.co', 'www.Travelsale.com.co',
    'Travelsale.co',     'www.Travelsale.co'
  ];
```


# Modelo de Atribución — Travelsale Tracking Pixel:
┌─────────────────────────────────────────────────────────────────┐
│                    FUENTES DE TRÁFICO                           │
│         Meta Ads · Google Ads · Email · Orgánico               │
└──────────────────────┬──────────────────────────────────────────┘
                       │ UTM parameters
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TravelSALE.COM.CO                                │
│              (punto de entrada obligatorio)                     │
│         Todo el tráfico hacia aliados pasa por aquí            │
└──────────────────────┬──────────────────────────────────────────┘
                       │ redirect → referrer = Travelsale.com.co
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ALLY STORE                                   │
│                                                                 │
│   TAG 1 — theme.liquid / GTM All Pages                         │
│   ┌─────────────────────────────────────────────────────┐      │
│   │                                                     │      │
│   │   CONDITION B (primary)                             │      │
│   │   referrer === Travelsale.com.co?                      │      │
│   │          │                                          │      │
│   │          ├── YES → DETECTED ✅                      │      │
│   │          │         detection_signal: referrer_only  │      │
│   │          │         or referrer+utm                  │      │
│   │          │                                          │      │
│   │          └── NO (referrer dropped)                  │      │
│   │                    │                                │      │
│   │               CONDITION A                           │      │
│   │               UTM contains Travelsale keyword?         │      │
│   │                    │                                │      │
│   │                    ├── NO  → NOT DETECTED ❌        │      │
│   │                    │                                │      │
│   │                    └── YES                          │      │
│   │                          │                          │      │
│   │                     CONDITION C                     │      │
│   │                     Foreign keyword in              │      │
│   │                     source/medium?                  │      │
│   │                          │                          │      │
│   │                          ├── YES → NOT DETECTED ❌  │      │
│   │                          │        (ally's own       │      │
│   │                          │         campaign)        │      │
│   │                          │                          │      │
│   │                          └── NO  → DETECTED ✅      │      │
│   │                                   detection_signal: │      │
│   │                                   utm+no_foreign    │      │
│   │                                                     │      │
│   │   Stores in localStorage + sessionStorage:          │      │
│   │   utm_source · utm_medium · utm_campaign            │      │
│   │   store_domain · referrer · detection_signal        │      │
│   │   landed_at                                         │      │
│   └─────────────────────────────────────────────────────┘      │
│                       │                                         │
│                       │ usuario navega y compra                 │
│                       ▼                                         │
│   TAG 2 — Customer Events / GTM Thank You Page                 │
│   ┌─────────────────────────────────────────────────────┐      │
│   │ Reads localStorage → validates tsData exists        │      │
│   │ Reads order_id · order_value from dataLayer          │      │
│   └─────────────────────────────────────────────────────┘      │
└──────────────────────┬──────────────────────────────────────────┘
                       │ conversión confirmada
                       ▼
┌────────────────────────────────────────────────────────────────┐
│                  TRES DESTINOS EN PARALELO                     │
│                                                                │
│  ┌─────────────────┐ ┌──────────────┐ ┌─────────────────────┐  │
│  │  Google Sheet   │ │     GA4      │ │     Meta Pixel      │  │
│  │  (Apps Script)  │ │  (Travelsale)   │ │     (Travelsale)       │  │
│  │                 │ │              │ │                     │  │
│  │ • Fecha         │ │ • purchase   │ │ • Purchase event    │  │
│  │ • store_domain  │ │ • order_id   │ │ • value · currency  │  │
│  │ • detection_    │ │ • value      │ │ • store_domain      │  │
│  │   signal        │ │ • currency   │ │ • utm_source        │  │
│  │ • utm_source    │ │ • utm_source │ │ • utm_campaign      │  │
│  │ • utm_medium    │ │ • utm_medium │ │                     │  │
│  │ • utm_campaign  │ │ • campaign   │ │                     │  │
│  │ • referrer      │ │ • domain     │ │                     │  │
│  │ • order_id      │ │ • det_signal │ │                     │  │
│  │ • order_value   │ │              │ │                     │  │
│  │ • converted_at  │ │              │ │                     │  │
│  └────────┬────────┘ └──────┬───────┘ └──────────┬──────────┘  │
└───────────┼─────────────────┼────────────────────┼─────────────┘
            ▼                 ▼                    ▼
     Siempre llega      Llega si no          Llega si no
     zero infra         bloqueado            bloqueado
     dependence         por CSP/WAF          por iOS/adblock


Señal de atribución:
┌──────────────────────────────────────────────────────────────┐
│  TIPO: Last Touch — Session Scoped — Multi-Signal            │
│                                                              │
│  Señales en orden de prioridad:                              │
│                                                              │
│  1. REFERRER (B) — strongest                                 │
│     Prueba física de paso por Travelsale.com.co                 │
│     Confiabilidad: ~100% cuando está presente                │
│     Frecuencia: ~65% de sesiones                             │
│                                                              │
│  2. UTM + NO FOREIGN (A AND C) — fallback                    │
│     Keyword Travelsale en UTM + ausencia de señales del aliado  │
│     Confiabilidad: ~85% cuando está presente                 │
│     Frecuencia: ~20% adicional de sesiones                   │
│                                                              │
│  Gate: B OR (A AND C)                                        │
│                                                              │
│  Ventana de atribución: duración del localStorage            │
│  (persiste hasta compra o cierre de navegador incógnito)     │
└──────────────────────────────────────────────────────────────┘

LIMITACIONES:
✅ CAPTURA
   Usuario llega con UTM Travelsale → compra en la misma sesión
   Usuario llega → navega varias páginas → compra (misma sesión)
   Usuario llega por Meta Ad con UTM → compra (mismo dispositivo)

⚠️  CAPTURA PARCIALMENTE
   Usuario llega → cierra → vuelve días después
   (localStorage persiste pero sessionStorage no)

❌ NO CAPTURA
   Cross-device (ve en móvil, compra en desktop)
   Safari ITP agresivo (borra localStorage en 7 días)
   Checkout en subdominio sin acceso a localStorage del main domain
   Plataformas con WAF que bloquean el fetch al Apps Script


Jerarquía de Confiabilidad por Destino
SHEET (Apps Script)     ████████████████████  ~85% de conversiones reales
GA4                     ███████████████░░░░░  ~75% (bloqueado en algunos enterprise)
Meta Pixel              ████████████░░░░░░░░  ~60% (ad blockers + CSP + iOS)

## Contacto técnico

Dudas de implementación: sergio@upsellmarketing.co
