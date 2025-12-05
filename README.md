# Caserio Chat - Next-Gen FiveM Chat System

Sistema de chat standalone de alto rendimiento para FiveM con interfaz moderna estilo "Origen Network".

## 🚀 Características

- **UI Moderna**: Ventana flotante y arrastrable con estética glassmorphism
- **Sistema de Canales**: Organización por tabs (Sistema, OOC, Radio, Trabajo, Policía, EMS)
- **i18n**: Soporte completo para Inglés y Español
- **Altamente Personalizable**: Opacidad, tamaño de fuente, modo streamer
- **Alto Rendimiento**: React 18 + TypeScript + Zustand
- **Optimizado para CEF**: Build específico para el navegador embebido de FiveM
- **🔒 Seguridad XSS**: Protección contra inyección de código malicioso
- **🔊 Notificaciones de Audio**: Sonidos contextuales para menciones y mensajes importantes
- **🎨 Códigos de Color FiveM**: Soporte para ^0-9 con sanitización segura
- **🔤 Font Fallbacks**: Compatibilidad garantizada en cualquier PC custom

## 📦 Instalación

1. **Descarga o clona el repositorio** en tu carpeta de recursos de FiveM:
   ```bash
   cd resources/[local]/
   git clone <tu-repositorio> caserio_chat
   ```

2. **Agrega el recurso** a tu `server.cfg`:
   ```cfg
   ensure caserio_chat
   ```

3. **(Opcional) Configuración recomendada** - Desactiva el chat nativo añadiendo en `server.cfg`:
   ```cfg
   setr chat_disable true
   setr chat_locale es
   ```

4. **Reinicia el servidor** o ejecuta:
   ```
   refresh
   ensure caserio_chat
   ```

## ⚙️ Configuración

### Convars (server.cfg)

| Convar | Valor por Defecto | Descripción |
|--------|-------------------|-------------|
| `chat_disable` | `false` | Desactiva el chat nativo de FiveM |
| `chat_locale` | `es` | Idioma por defecto (`en` o `es`) |
| `caserio_chat_framework` | `standalone` | Framework (`qbcore`, `esx`, `standalone`, `auto`) |

### Permisos (Ace Permissions)

Para usar canales restringidos, configura permisos ACE en `server.cfg`:

```cfg
# Dar acceso al canal de policía
add_ace group.police chat.police allow

# Dar acceso a un jugador específico
add_ace identifier.steam:STEAMID chat.police allow
```

## 🎮 Uso

### Controles

- **T** - Abrir chat
- **Enter** - Enviar mensaje
- **Escape** - Cerrar chat

### Comandos Disponibles

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `/me [acción]` | Describe una acción en roleplay | `/me se rasca la cabeza` |
| `/do [descripción]` | Describe el entorno en roleplay | `/do Hay una pistola en el suelo` |
| `/ooc [mensaje]` | Mensaje fuera de personaje | `/ooc gg buen roleplay` |
| `/police [mensaje]` | Canal policial (requiere permisos) | `/police 10-4, en camino` |

### Configuración del Chat

Haz clic en el ícono de engranaje (⚙️) en la esquina superior derecha para:

- Ajustar opacidad del fondo (0-100%)
- Cambiar tamaño de fuente (12-20px)
- Activar/desactivar modo streamer (oculta nombres)
- Cambiar idioma (English/Español)

## 🛠️ Desarrollo

### Requisitos

- Node.js 16+
- npm o yarn

### Desarrollo Local (Browser)

```bash
cd web
npm install
npm run dev
```

El chat se abrirá en `http://localhost:5173` con datos de prueba automáticos.

### Build para Producción

```bash
cd web
npm run build
```

Los archivos compilados se generarán en `web/dist/`.

### Estructura del Proyecto

```
caserio_chat/
├── web/                    # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes UI
│   │   ├── stores/        # Zustand stores
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utilidades
│   └── dist/              # Build de producción
├── client/                # Lua client-side
│   ├── main.lua          # NUI bridge
│   └── bridge.lua        # Framework adapter
├── server/                # Lua server-side
│   ├── main.lua          # Comandos y broadcast
│   └── filters.lua       # Anti-spam y filtros
├── locales/               # Archivos de traducción
│   ├── en.json
│   └── es.json
└── fxmanifest.lua
```

## 🌐 Agregar Nuevos Idiomas

1. Crea un nuevo archivo JSON en `locales/` (ej: `locales/fr.json`)
2. Copia la estructura de `en.json` y traduce los valores
3. Agrega soporte en `web/src/stores/useLocaleStore.ts`
4. Agrega el idioma al selector en `web/src/components/Settings.tsx`

## 🔒 Seguridad y Características Avanzadas

Para información detallada sobre:
- Protección XSS y códigos de color de FiveM
- Sistema de notificaciones de audio
- Configuración de fuentes y compatibilidad

Consulta [SECURITY.md](file:///Users/jarmijo/ProyectosP/Addons%20FIvem/caserio_chat/SECURITY.md)

## 🔧 Solución de Problemas

### El chat no se abre al presionar T

- Verifica que el recurso esté iniciado: `ensure caserio_chat`
- Revisa la consola F8 para errores
- Asegúrate de que `chat_disable` esté en `true`

### Los mensajes no aparecen

- Verifica que el servidor esté enviando eventos `chat:addMessage`
- Revisa la consola del servidor para errores de Lua
- Comprueba que el payload tenga la estructura correcta

### El build falla

```bash
cd web
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 Licencia

MIT

## 🤝 Créditos

Desarrollado por Caserio Development
