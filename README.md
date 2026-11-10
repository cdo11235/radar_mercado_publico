# Radar de licitaciones

App estática en español para GitHub Pages, compatible con celular y escritorio. Consulta manualmente la API oficial de Mercado Público mediante JSONP sobre HTTPS, formato documentado por ChileCompra.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo `radar-licitaciones`.
2. Descomprime este paquete y sube `index.html`, `style.css`, `app.js` y `.nojekyll` a la raíz del repositorio. También puedes subir este README.
3. En Settings → Pages, selecciona Deploy from a branch, rama `main` y carpeta `/ (root)`. Guarda.
4. Abre la dirección que GitHub indique, normalmente `https://TU-USUARIO.github.io/radar-licitaciones/`.
5. Solicita tu ticket en https://api.mercadopublico.cl/ e ingrésalo en la aplicación. Presiona Actualizar licitaciones.

## Uso

La consulta inicial obtiene todas las licitaciones activas. También puedes consultar una fecha específica y filtrar sus estados. Cambiar el tipo de consulta o su fecha requiere pulsar Actualizar. Los filtros se aplican inmediatamente al listado ya descargado.

Las palabras clave iniciales son radioterapia, braquiterapia, dosimetría, acelerador lineal, física médica y fantoma. Puedes reemplazarlas o dejar el campo vacío para ver todos los resultados. Usa comas para separar frases. La búsqueda acepta coincidencias parciales y omite diferencias de tildes y mayúsculas. Las exclusiones eliminan cualquier título o código que contenga alguna de las frases indicadas.

Los filtros de cierre son inclusivos. Cuando hay un filtro de cierre, los registros sin fecha quedan fuera. El cierre se muestra tal como lo informa la API, sin reinterpretar su zona horaria. El enlace abre la ficha oficial en otra pestaña.

Los filtros persisten en el navegador. El ticket permanece solamente en memoria hasta cerrar o recargar la página. Cada visitante introduce su propio ticket. El código distribuido no contiene credenciales. El ticket se envía directamente al dominio oficial para efectuar las consultas.

## Alcance y verificación

Esta versión consulta licitaciones. Filtra títulos y códigos del listado, por lo que un término presente únicamente en la descripción, los productos o las bases no producirá una coincidencia. No incluye Compra Ágil ni órdenes de compra.

La app detecta errores de red, respuestas sin listado y consultas que exceden 30 segundos. Si una actualización falla, conserva el último listado y lo indica. Los resultados dependen de la disponibilidad y cobertura de la API oficial.

Se verificó la sintaxis JavaScript y se probaron filtros y generación de enlaces con datos simulados. La consulta autenticada en vivo y la presentación visual en navegador quedan pendientes de verificar. No se publicó en una cuenta GitHub desde esta sesión.

## Documentación oficial

- https://www.chilecompra.cl/api/
- https://ayuda.mercadopublico.cl/preguntasfrecuentes/article/KA-01985/es-es

No requiere instalación de dependencias ni proceso de compilación.
