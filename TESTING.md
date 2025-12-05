# Guía de Testing Local (Navegador)

## 🧪 Modo Desarrollo

El chat está configurado para funcionar completamente en el navegador durante el desarrollo, sin necesidad de FiveM.

### Iniciar el Servidor de Desarrollo

```bash
cd web
npm run dev
```

Abre tu navegador en `http://localhost:5173`

## ✅ Features Activas en Dev Mode

### 1. **Chat Visible por Defecto**
- El chat aparece automáticamente (no necesitas presionar T)
- Puedes arrastrarlo, cambiar settings, etc.

### 2. **Mensajes Mock Automáticos**
- Cada 3 segundos se genera un mensaje de prueba
- Incluye diferentes canales, autores y tags
- Soporta códigos de color FiveM (^0-9)

### 3. **Consola con Logs**
Abre DevTools (F12) para ver:
```
[DEBUG MODE] Running in browser - mock data enabled
Chat will auto-populate with test messages every 3 seconds
[MOCK] Sent initial message
[MOCK] New message
```

## 🎮 Comandos de Testing Manual

Abre la consola del navegador (F12) y prueba:

### Enviar Mensaje Custom
```javascript
window.sendTestMessage("Hola mundo", "Tu Nombre", "system")
```

### Con Códigos de Color FiveM
```javascript
window.sendTestMessage("^1Rojo ^2Verde ^3Amarillo", "ColorTest", "ooc")
```

### Test de XSS Protection
```javascript
window.sendTestMessage("<script>alert('hack')</script>", "Hacker", "system")
// Resultado: el texto aparece escapado, el script NO se ejecuta
```

### Mensaje con Tags
```javascript
window.mockNuiMessage('ADD_MESSAGE', {
  id: Math.random().toString(36),
  author: 'Admin',
  message: 'Server restart',
  channel: 'system',
  timestamp: Date.now(),
  tags: ['ADMIN', 'IMPORTANT']
})
```

## 🧩 Test de Componentes

### Test de Channels
1. Haz clic en diferentes tabs (All, System, OOC, etc.)
2. Verifica que solo se muestran mensajes del canal activo
3. Observa el indicador de "nuevo mensaje" (punto rojo) en tabs inactivos

### Test de Settings
1. Haz clic en el ícono ⚙️ (esquina superior derecha)
2. Ajusta la opacidad → El fondo cambia en tiempo real
3. Ajusta el tamaño de fuente → El texto se redimensiona
4. Activa "Modo Streamer" → Los nombres se ocultan (muestran ***)
5. Cambia el idioma → Los labels se actualizan

### Test de Draggable
1. Arrastra el chat por el área "Drag to move"
2. Recarga la página (F5)
3. El chat debe aparecer en la última posición

### Test de Input
1. Haz clic en el input (abajo)
2. Escribe un mensaje
3. Presiona Enter → Aparece en DevTools como `fetchNui('sendMessage', ...)`
4. Presiona Escape → (En FiveM cerraría el chat, en navegador puede no hacer nada)

## 🎨 Test de Códigos de Color

Los siguientes mensajes deberían mostrar colores:

```javascript
window.sendTestMessage("^0Negro ^1Rojo ^2Verde ^3Amarillo", "ColorPalette")
window.sendTestMessage("^4Azul ^5Cyan ^6Magenta ^7Blanco", "ColorPalette")
window.sendTestMessage("^8Naranja ^9Gris", "ColorPalette")
```

## 🔊 Notas sobre Sonidos

Los sonidos **NO** funcionan en modo navegador ya que usan `PlaySoundFrontend` de FiveM. Para testear sonidos, debes probarlo en el juego.

## 🐛 Debugging Tips

### El chat no aparece
1. Verifica que `npm run dev` esté corriendo sin errores
2. Abre DevTools (F12) → Console
3. Busca el mensaje verde: `[DEBUG MODE] Running in browser`
4. Si no aparece, revisa errores en la consola

### Los mensajes no se generan
1. Verifica en consola si ves `[MOCK] New message` cada 3 segundos
2. Si no, revisa que `debugData.ts` esté importado en `App.tsx`
3. Verifica que `import.meta.env.DEV` sea `true` (debería serlo con Vite dev server)

### Los colores no se ven
1. Verifica que el mensaje tenga códigos ^0-9
2. Abre DevTools → Elements → Inspecciona el mensaje
3. Debería tener `<span style="color: #FF0000">` etc.

### Error de CORS
Si ves errores de CORS en la consola:
- Es normal, `fetchNui` intenta conectarse a FiveM
- En navegador, simplemente ignora estos errores
- En FiveM real, funcionarán correctamente

## 📊 Verificación Visual

Deberías ver:
- ✅ Ventana del chat con glassmorphism (fondo semi-transparente)
- ✅ 7 tabs en la parte superior
- ✅ Mensajes apareciendo automáticamente cada 3 segundos
- ✅ Scroll automático al último mensaje
- ✅ Colores en los nombres y mensajes (códigos ^)
- ✅ Tags con badges de colores (ADMIN rojo, POLICE azul, etc.)
- ✅ Timestamps en formato HH:MM:SS
- ✅ Input funcional en la parte inferior

## 🚀 Próximos Pasos

Una vez verificado en navegador:
1. Ejecuta `npm run build` para generar el bundle de producción
2. Copia el recurso a FiveM: `resources/[local]/caserio_chat`
3. Agrega `ensure caserio_chat` a `server.cfg`
4. Reinicia el servidor y prueba en el juego

## 🆘 Comandos Útiles en Consola

```javascript
// Ver el estado actual del chat
useChatStore.getState()

// Cambiar canal manualmente
useChatStore.getState().setActiveChannel('police')

// Toggle visibilidad
useChatStore.getState().toggleVisibility()

// Agregar mensaje masivo (stress test)
for(let i = 0; i < 50; i++) {
  window.sendTestMessage(`Mensaje de test #${i}`, `User${i}`, 'system')
}

// Limpiar mensajes (reiniciar estado)
useChatStore.setState({ messages: [] })
```
