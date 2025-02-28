# Selector de Acoplamientos Industriales

Una aplicación web progresiva (PWA) para la selección de acoplamientos industriales basada en parámetros técnicos.

## Estructura del Proyecto

- `index.html` - Archivo principal HTML
- `manifest.json` - Archivo de configuración PWA
- `service-worker.js` - Service worker para funcionamiento offline
- `src/` - Código fuente JavaScript
  - `main.js` - Archivo principal de JavaScript
  - `screens/` - Componentes de las pantallas de la aplicación
  - `utils/` - Utilidades y lógica de cálculo
  - `styles/` - Archivos CSS
- `data/` - Archivos JSON con datos de acoplamientos y factores de servicio
- `assets/` - Imágenes y recursos estáticos

## Despliegue en GitHub Pages

Este proyecto está configurado para funcionar con GitHub Pages. Para desplegarlo:

1. Asegúrate de que todos los archivos estén en la estructura correcta
2. Sube los archivos a tu repositorio de GitHub
3. Configura GitHub Pages para usar la rama principal

El sistema de rutas está optimizado para trabajar con la base URL `/Fundal-PWA/`.

## Problemas Conocidos en iOS

Si experimentas problemas al guardar la aplicación en la pantalla de inicio de un iPhone:

1. Asegúrate de que el `scope` en `manifest.json` esté configurado correctamente
2. Verifica que las rutas en el service worker incluyan todos los archivos necesarios
3. La redirección en `index.html` debe manejar correctamente la ruta basada en `/Fundal-PWA/`

## Funcionamiento

La aplicación sigue un flujo de tres pantallas:
1. Selección de aplicación o factor de servicio
2. Ingreso de parámetros (potencia, tamaños de ejes, RPM)
3. Visualización de recomendaciones de acoplamientos

## Modificación del Código

Si necesitas modificar el código:
1. Edita los archivos en la estructura actual
2. Prueba localmente antes de subir a GitHub
3. Asegúrate de que todas las rutas relativas sean correctas
