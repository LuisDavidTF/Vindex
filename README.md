# Vindex 📦

**Vindex** es una aplicación moderna de gestión de inventarios sin conexión a internet (offline-first), diseñada especialmente para la gestión de productos, fechas de caducidad y organización física en cajas de almacenamiento.

---

## ✨ Características Principales

- **Gestión Completa de Productos**: Alta, edición, eliminación y visualización de productos.
- **Detección de Caducidad**: Alertas visuales inteligentes para productos por vencer (menos de 90 días) o ya vencidos.
- **Organización por Cajas**: Organización física asignando productos a "Cajas" (Boxes) específicas.
- **Búsqueda Avanzada Inmune a Acentos**: Buscador optimizado para buscar ignorando acentos (ej. buscar "acai" encuentra "acaí").
- **Filtros por Línea (Categoría)**: Chips dinámicos en la cabecera para filtrar instantáneamente el inventario por su línea de producto.
- **Importador de Datos (Excel / CSV / Copiar y Pegar)**:
  - Soporta la carga de archivos `.xlsx`, `.xls` y `.csv`.
  - **Detección Automática de Codificación**: Auto-detecta si el CSV está en UTF-8 o Windows-1252 (formato por defecto de Excel en español), evitando que los acentos se corrompan (`jabA3n` ➔ `jabón`).
  - **Copiar y Pegar**: Pestaña dedicada para copiar una tabla de Google Sheets o Excel y pegarla directamente como texto (TSV).
  - **Fusión Inteligente**: Permite elegir qué hacer con registros duplicados (sumar stock, sobreescribir o ignorar).
- **Formateo Completo**: Opción rápida y segura en el menú de ajustes para vaciar la base de datos por completo.
- **Optimización de Alto Rendimiento**: Diseñada para miles de registros con re-renderizado optimizado (`useCallback` + `React.memo`) y carga virtualizada de lista (`FlatList`).

---

## 🛠 Tecnologías Utilizadas

- **Entorno**: [Expo](https://expo.dev) / React Native
- **Lenguaje**: TypeScript
- **Base de Datos**: SQLite nativo con [Drizzle ORM](https://orm.drizzle.team)
- **Biblioteca UI**: [React Native Paper](https://reactnativepaper.com)
- **Gestor de Estado**: [Zustand](https://github.com/pmndrs/zustand)
- **Enrutador**: Expo Router

---

## 🚀 Instalación y Desarrollo Local

### Requisitos Previos
- Node.js instalado en tu ordenador.
- Expo Go instalado en tu dispositivo móvil (para pruebas rápidas en desarrollo).

### Pasos de Configuración

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo**:
   ```bash
   npx expo start
   ```
   Escanea el código QR con la cámara de tu móvil (iOS) o desde la app Expo Go (Android).

---

## 📦 Cómo Generar la App Standalone (Instalar Fijo sin Expo Go)

Para distribuir e instalar la app directamente en dispositivos de usuarios finales sin depender de la aplicación Expo Go, puedes generar un archivo instalador nativo (**APK** para Android o compilar para **iOS**).

Usaremos **EAS Build** (Expo Application Services), el servicio en la nube oficial de Expo.

### 1. Requisitos para la compilación
- Debes tener una cuenta gratuita en [Expo.dev](https://expo.dev).
- Instala la herramienta CLI de EAS de manera global en tu terminal:
  ```bash
  npm install -g eas-cli
  ```
- Inicia sesión con tu cuenta de Expo:
  ```bash
  eas login
  ```

### 2. Generar el APK instalable para Android (Recomendado para compartir fácilmente)
El perfil `preview` está configurado para compilar directamente un archivo **.apk** instalable en cualquier móvil Android.

Ejecuta el siguiente comando en la terminal de tu proyecto:
```bash
eas build --platform android --profile preview
```

**¿Qué pasará a continuación?**
1. EAS empaquetará el código y subirá el proyecto a los servidores de compilación de Expo.
2. Tras unos minutos, la terminal te proporcionará un **código QR** y un **enlace directo de descarga**.
3. Abre el enlace en el móvil donde quieras instalar la app, descarga el archivo `.apk` e instálalo. *(Es posible que Android te pida habilitar "Instalar aplicaciones de fuentes desconocidas" para tu navegador, lo cual es normal al instalar apps que no vienen directamente de Google Play).*

### 3. Generar la App para iOS (Apple)
Para compartir con usuarios de iPhone, Apple requiere un flujo diferente:
- **Opción de Desarrollo Interno (Ad-hoc)**:
  ```bash
  eas build --platform ios --profile preview
  ```
  *(Nota: Requiere una cuenta de desarrollador de Apple de pago para registrar los dispositivos UUIDs en los que se instalará).*
- **Distribución de Producción (TestFlight / App Store)**:
  ```bash
  eas build --platform ios --profile production
  ```
  Una vez completada la compilación, se puede enviar directamente a TestFlight para invitar a usuarios de prueba (testers) por correo electrónico a probar la aplicación en sus iPhones.

---

## 🤝 Lineamientos del Repositorio

Este proyecto sigue una arquitectura limpia (**Clean Architecture**):
- `src/domain`: Entidades y Reglas de Negocio puras (independientes de la base de datos y UI).
- `src/data`: Acceso a datos locales, esquemas de Drizzle, repositorios de SQLite y migraciones.
- `src/presentation`: Componentes, pantallas, estados globales de Zustand y estilos de la interfaz de usuario.
