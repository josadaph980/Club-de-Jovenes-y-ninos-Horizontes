# Sitio web de la Fundación Club de Jóvenes y Niños Horizontes (CJNH)

Sitio estático de una sola página: HTML, CSS y JavaScript nativos. Sin servidor, sin base de datos, sin librerías y sin costo de alojamiento. Se publicará más adelante en GitHub Pages (hoy **no está publicado**).

Versión de este paquete: `vista-previa-cjnh_23` (octubre 2026), separada en archivos para poder editarla y publicarla.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura y textos fijos de la página, incluidos los dos carruseles de fotos y el formulario de Donorbox. |
| `styles.css` | Colores y diseño (tema claro y oscuro). Las variables de color están al inicio. |
| `siteData.js` | **Datos editables**: contacto, horario, cifras, junta directiva, aliados, Donorbox, logo y redes sociales. |
| `script.js` | Llena la página con `siteData.js`, menú, tema, carruseles, tarjetas de la junta, cifras animadas y contacto. |
| `redes.js` | Muestra la franja de redes sociales solo si hay URLs válidas en `siteData.js` → `socials`. |
| `assets/logo-cjnh.png` | Logo de la fundación. |
| `assets/fotos/` | Fotos de los carruseles (Nuestra historia y Cómo trabajamos) y de Donaciones. |
| `assets/campamentos/` | Fotos de la sección Campamentos. |
| `assets/galeria/` | Fotos de la sección Momentos que compartimos. |
| `assets/junta/` | (No existe por ahora.) Cuando lleguen los retratos de los directivos, crear esta carpeta y guardarlos ahí. |
| `THIRD_PARTY_NOTICES.md` | Registro de material y servicios de terceros. |

## Probar en su computadora

**Opción A:** doble clic en `index.html`.

**Opción B (igual a como se verá publicado):** abrir una terminal dentro de la carpeta y ejecutar `python3 -m http.server 8000`; luego abrir http://localhost:8000. Para detener, `Ctrl + C`. Tras cada cambio, recargar (`Ctrl + F5`).

## Cómo actualizar la información

### Contacto, horario, ubicación y cifras
En `siteData.js`. Las cifras se muestran como "más de …" y **no se suman entre sí**; cada una indica su período.

### Directores (cinco tarjetas; antes "Junta directiva", cambio pedido por la jefatura)
En `siteData.js` → `board.members`. Hoy hay tres personas con nombre y cargo publicados (tarjetas 1, 3 y 4), **sin retrato** (se retiraron en oct. 2026 porque no se veían bien; quedan pendientes), y dos tarjetas en "Información próximamente" (2 y 5). Para mostrar un retrato: guardar la foto en `assets/junta/`, escribir su ruta en `photo` y poner `photoAuthorized: true`. Para activar una tarjeta nueva hay que completar `name`, `role` y, si se quiere retrato, `photo` y `photoAuthorized: true`. Opcionales: `area` y `career`. Al tocar o pulsar una tarjeta se ve su detalle.

### Campamentos y galería de fotos
Sección "Campamentos": `siteData.js` → `camps.items` (fotos en `assets/campamentos/`). Sección "Momentos que compartimos": `siteData.js` → `gallery.items` (fotos en `assets/galeria/`). **Una foto no se repite en ninguna parte de la página.** Para la galería:  Para agregar una foto: guardarla en `assets/fotos/` (sin nombres ni GPS), y añadir al final de la lista `{ src, alt, caption }` (descripción de la escena, sin nombres). Se ven en mosaico y se amplían al tocarlas; se muestran 9 al inicio y el resto con "Ver más fotos" (`pageSize`).

### Fotos de los carruseles
Están escritas directamente en `index.html` (secciones "Nuestra historia" y "Cómo trabajamos"), con su texto alternativo y pie de foto. Para cambiar una, reemplazar el archivo en `assets/fotos/` (mismo nombre) o cambiar su `src`. Los carruseles avanzan cada 5 s, se pausan con el botón, y funcionan con flechas, puntos y teclado.

### Redes sociales
Abrir `siteData.js`, buscar `socials` y pegar la URL oficial de cada perfil entre las comillas de `url` (Instagram, Facebook, TikTok). Las redes sin URL no aparecen y, si ninguna tiene, la franja "La comunidad también crece contigo" (antes de Contacto) permanece oculta. Solo se aceptan enlaces `https://` del dominio de cada red.

### Logo, aliados y textos
- Logo: `assets/logo-cjnh.png` (ruta en `siteData.js` → `logo`).
- Aliados: la sección está oculta hasta que `allies.confirmed` sea `true` y haya aliados con autorización.
- Misión, visión, historia, grupos, actividades y "por qué lo hacemos": directamente en `index.html`.

## Donaciones con Donorbox
El formulario es el código oficial de Donorbox, pegado en `index.html` (sección Donaciones). Si el navegador lo bloquea, hay un enlace alterno. Donorbox y su procesador de pagos gestionan el pago.

## Publicar gratis en GitHub Pages (pendiente)
> **Versión de prueba:** `index.html` tiene `<meta name="robots" content="noindex, nofollow">` para que Google no muestre la página. Cuando el sitio sea oficial, borrar esa línea (y su comentario) para que aparezca en Google.

1. Crear un repositorio **público** y subir el contenido de esta carpeta (sin documentos internos).
2. En *Settings → Pages*, elegir la rama `main` y la carpeta raíz.
3. La dirección será `https://USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.
4. Subdominio propio (opcional): crear un registro DNS `CNAME` del subdominio hacia `USUARIO.github.io` y configurarlo en *Pages → Custom domain*. No cambiar el DNS ni la página principal existentes sin acuerdo de la fundación.

## Reglas de protección de menores (importante)
- No publicar nombres, escuelas, edades exactas, direcciones, ubicaciones en tiempo real ni historias identificables de niñas, niños o jóvenes.
- No copiar al sitio ni al repositorio la lista nominal de beneficiarios del documento institucional.
- Las fotos son grupales y se publican con la autorización de los responsables que la fundación indicó contar. Sin nombres en `alt`, pies de foto ni nombres de archivo. Quitar la ubicación (GPS) de cada foto nueva.
- Si un responsable pide retirar una foto: borrar el archivo de `assets/fotos/`, su bloque en `index.html`, y volver a publicar.
- Las autorizaciones firmadas se guardan fuera del sitio y del repositorio (el repositorio es público).
- Voluntariado: 18 años o más; la única excepción es el TCC.
- No agregar formularios, comentarios ni analítica que recojan datos de menores.

## Modo oscuro y movimiento
- El botón sol/luna del encabezado alterna claro/oscuro; la elección se guarda solo en el navegador de la persona (`cjnh-theme`).
- Con "reducir movimiento" activado en el sistema, las animaciones se detienen y se muestran los valores finales.

## Pendiente por aportar la fundación
- [ ] Datos y retratos autorizados de los directivos 2 y 5.
- [ ] Redes sociales: enlaces, cuando se creen.
- [ ] Aliados: nombres, logos y autorización.
- [ ] Logos de los grupos MiniKids, Kids, Legión y Clan (no se inventan).
- [ ] Programas vigentes y validación de los textos ampliados.
- [ ] Logo transparente o vectorial para el modo oscuro, y colores oficiales del logo.
- [ ] Dominio, acceso al DNS, cuenta de GitHub y presupuesto.
- [ ] Confirmar la foto "gorro navideño" (primer plano de una persona participante) y que el texto de la junta ("Publicaremos sus nombres…") refleje que ya hay tres personas publicadas.
