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

| Plataforma | Tag 1 | Tag 2 | Video guía |
|---|---|---|---|
| Shopify | theme.liquid | [ver](Pixels/Pixel%201-All%20pages.html) | [En Shopify](https://drive.google.com/file/d/17YOgVuAJz3q6U6BdjcLmB6UXIjxiCsnu/view?usp=sharing)
| Shopify | Customer Events | [ver](Pixels/Pixel%202%20Shopify-Customer%20events.js) | [En Shopify](https://drive.google.com/file/d/17YOgVuAJz3q6U6BdjcLmB6UXIjxiCsnu/view?usp=sharing)
| VTEX / Otros / GTM | All Pages | [ver](Pixels/Pixel%201-All%20pages.html) | [En Tag manager](https://drive.google.com/file/d/1GQyFn6_z0cLH0iPJPv-7b5kHQtCHOEeG/view?usp=sharing)
| VTEX / Otros / GTM | Confirmation page | [ver](Pixels/Pixel%202%20GTM%20-Confirm%20page.html) | [En Tag manager](https://drive.google.com/file/d/1GQyFn6_z0cLH0iPJPv-7b5kHQtCHOEeG/view?usp=sharing)

### Keywords de detección activas
```javascript
var TravelsaleKeywords = [
    'Travelsale', 'Travel_sale', 'Travel-sale', 'Travel.sale', 'Travelsale2026', 'Travelsale_2026', 'Travelsale-2026', 'ts2026', 'ts_2026', 'ts-2026', 'Travelsale_mar', 'Travelsale_marzo', 'Travelsalemarzo', 'Travelsale_oct', 'Travelsale_octubre', 'Travelsaleoct', 'Travelsaleco', 'Travelsale_co', 'Travelsalecolombia', 'ccce', 'ccceco', 'ccce2026', 'Travelsael', 'Travelslae', 'Travelsalee', 'epsilon'
  ];
```
### Keywords de exclusión de tráfico
 ```javascript
  var foreignKeywords = [
    'always_on', 'brand_always_on'
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
![Modelo de atribución](./analytics/attribution_model_travelsale.svg)

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
