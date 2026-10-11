# Clima — Weather App

Aplicación web responsive para consultar el clima actual y el pronóstico de siete días de una ciudad.

## Tecnologías
- HTML5: estructura semántica y formulario de búsqueda.
- CSS3: diseño responsive, tarjetas y estados visuales.
- JavaScript: eventos, funciones, condicionales, iteración, `async/await`, `fetch`, manejo de errores y renderizado dinámico.
- API: Open-Meteo Geocoding API y Forecast API. No requiere API key.

## Ejecutar localmente
1. Descomprime el proyecto.
2. Abre la carpeta en Visual Studio Code.
3. Ejecuta `index.html` con la extensión Live Server, o publica los archivos estáticos en cualquier hosting.
4. Necesitas conexión a internet para Google Fonts y las API.

## Publicar gratis con GitHub Pages
1. Crea un repositorio público en GitHub, por ejemplo `weather-app`.
2. Sube `index.html`, `styles.css`, `app.js` y `README.md` a la raíz del repositorio.
3. Abre **Settings → Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**, selecciona `main` y `/ (root)`, y guarda.
5. Espera a que finalice la publicación. La URL normalmente será `https://TU-USUARIO.github.io/weather-app/`.
6. Sustituye los campos pendientes del PDF por la URL real y el enlace del repositorio.

## API utilizadas
- Geocodificación: `https://geocoding-api.open-meteo.com/v1/search?name=...`
- Pronóstico: `https://api.open-meteo.com/v1/forecast?...`
La primera API transforma el nombre de una ciudad en coordenadas. Con ellas, la segunda API devuelve condiciones actuales y datos diarios.

## Limitaciones
Los datos dependen de la disponibilidad de Open-Meteo y de la conexión a internet. Los resultados de búsqueda de ciudades pueden ser ambiguos si existen varias localidades con el mismo nombre.
