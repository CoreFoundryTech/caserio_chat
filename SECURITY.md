# Security & UX Enhancements - Caserio Chat

## 🔒 Security Features

### XSS Protection with FiveM Color Codes

El sistema incluye protección completa contra ataques XSS (Cross-Site Scripting) mientras mantiene el soporte para códigos de color de FiveM.

#### Implementación: `web/src/utils/sanitize.ts`

**Funciones principales:**

1. **`sanitizeAndColorize(text)`** - Convierte códigos de color ^0-9 a HTML seguro
   - Escapa todos los caracteres HTML antes de procesar
   - Previene ejecución de `<script>`, `<iframe>`, `onclick`, etc.
   - Soporta 10 códigos de color de FiveM (^0 a ^9)
   
   ```typescript
   // Ejemplo de uso:
   sanitizeAndColorize("^1Hola ^2mundo") 
   // → <span style="color: #FF0000">Hola </span><span style="color: #00FF00">mundo</span>
   
   // Protección XSS:
   sanitizeAndColorize("<script>alert('hack')</script>")
   // → &lt;script&gt;alert('hack')&lt;/script&gt; (texto escapado)
   ```

2. **`escapeHtml(text)`** - Escapa entidades HTML peligrosas
   - Convierte `<` → `&lt;`, `>` → `&gt;`, etc.
   - Usa el DOM nativo para máxima seguridad

3. **`stripColorCodes(text)`** - Elimina códigos de color
   - Útil para búsquedas o logging sin formato

4. **`containsXSS(text)`** - Detecta intentos de XSS
   - Patrones: `<script>`, `javascript:`, `on*=`, `<iframe>`, etc.

#### Códigos de Color Soportados

| Código | Color | Hex |
|--------|-------|-----|
| ^0 | Negro | #000000 |
| ^1 | Rojo | #FF0000 |
| ^2 | Verde | #00FF00 |
| ^3 | Amarillo | #FFFF00 |
| ^4 | Azul | #0000FF |
| ^5 | Cyan | #00FFFF |
| ^6 | Magenta | #FF00FF |
| ^7 | Blanco (default) | #FFFFFF |
| ^8 | Naranja | #FF8800 |
| ^9 | Gris | #808080 |

#### Uso en Componentes

```tsx
// MessageList.tsx
const sanitizedMessage = sanitizeAndColorize(message.message);
const sanitizedAuthor = sanitizeAndColorize(message.author);

<span dangerouslySetInnerHTML={{ __html: sanitizedMessage }} />
```

> **⚠️ IMPORTANTE**: Nunca uses `dangerouslySetInnerHTML` sin sanitizar el contenido primero.

---

## 🔊 Sound Notifications

Sistema de notificaciones de audio contextual que reproduce sonidos sutiles según el tipo de mensaje.

### Implementación: `client/main.lua`

#### Tipos de Sonidos

| Tipo | Trigger | Sonido | Uso |
|------|---------|--------|-----|
| **Default** | Mensaje normal | `CLICK_BACK` | Mensajes del sistema/OOC |
| **Mention** | Contiene tu nombre | `Menu_Accept` | Menciones personales |
| **Important** | Canales police/ems | `Event_Start_Text` | Canales de trabajo |
| **Admin** | Tag ADMIN/IMPORTANT | `Beep_Red` | Mensajes administrativos |

#### Configuración

Edita `client/config.lua` para personalizar sonidos:

```lua
Config.Sounds = {
    enabled = true,  -- Activar/desactivar sonidos
    
    default = { name = 'CLICK_BACK', set = 'WEB_NAVIGATION_SOUNDS_PHONE' },
    mention = { name = 'Menu_Accept', set = 'Phone_SoundSet_Default' },
    important = { name = 'Event_Start_Text', set = 'GTAO_FM_Events_Soundset' },
    admin = { name = 'Beep_Red', set = 'DLC_HEIST_HACKING_SNAKE_SOUNDS' },
    
    -- Silenciar canales específicos
    mutedChannels = { 'system' }
}
```

#### Desactivar Sonidos

Para desactivar completamente los sonidos:

```lua
-- client/config.lua
Config.Sounds.enabled = false
```

O comentar la línea en `client/main.lua`:

```lua
-- PlaySoundFrontend(-1, soundName, soundSet, true)
```

---

## 🔤 Font Fallbacks

Sistema robusto de fuentes de respaldo para compatibilidad con PCs custom de FiveM.

### Implementación: `web/tailwind.config.js`

```javascript
fontFamily: {
    sans: [
        'Inter',              // Fuente preferida
        'system-ui',          // Fuente del sistema
        '-apple-system',      // macOS/iOS
        'BlinkMacSystemFont', // macOS
        'Segoe UI',           // Windows
        'Roboto',             // Android
        'Helvetica Neue',     // macOS fallback
        'Arial',              // Windows fallback
        'sans-serif',         // Generic fallback
        // Emoji support:
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol'
    ]
}
```

### Orden de Prioridad

1. **Inter** - Fuente moderna y legible (si está instalada)
2. **system-ui** - Fuente nativa del sistema operativo
3. **Segoe UI / Roboto** - Windows y Android respectivamente
4. **Arial / sans-serif** - Fallback universal garantizado

### Beneficios

✅ **Sin cuadrados**: Garantiza que siempre haya una fuente disponible  
✅ **Emojis**: Soporte para emojis en todos los sistemas  
✅ **Performance**: Usa fuentes ya instaladas (no requiere descarga)  
✅ **Consistencia**: Apariencia similar en diferentes PCs

---

## 🧪 Testing de Seguridad

### Test XSS Manual

1. Intenta enviar:
   ```
   /me <script>alert('XSS')</script>
   ```

2. Resultado esperado:
   - El texto aparece escapado: `<script>alert('XSS')</script>`
   - **NO** se ejecuta el script
   - Consola sin errores

3. Test con colores:
   ```
   /me ^1Texto rojo ^2texto verde
   ```

4. Resultado esperado:
   - "Texto rojo" en rojo (#FF0000)
   - "texto verde" en verde (#00FF00)
   - Sin ejecución de scripts

### Test de Sonidos

1. **Mensaje normal**:
   ```
   Hola a todos
   ```
   Sonido: Click suave

2. **Mención**:
   ```
   @TuNombre ven aquí
   ```
   Sonido: Beep aceptación

3. **Canal importante** (requiere permisos):
   ```
   /police código 3
   ```
   Sonido: Notificación de evento

4. **Admin** (con tag ADMIN):
   Sonido: Beep rojo de alerta

### Test de Fuentes

1. Abre DevTools (F12) en el chat
2. Inspecciona cualquier texto
3. Verifica en "Computed" → "font-family"
4. Debería mostrar una de las fuentes de la lista de fallback

---

## 📋 Checklist de Seguridad

- [x] **XSS Prevention**: `sanitizeAndColorize()` escapa HTML antes de procesar
- [x] **Input Validation**: Límite de 256 caracteres en InputBar
- [x] **Content Security**: `dangerouslySetInnerHTML` solo con contenido sanitizado
- [x] **Color Code Safety**: Conversión a CSS inline seguro
- [x] **Pattern Detection**: Función `containsXSS()` para monitoreo
- [x] **Font Fallbacks**: 9 niveles de fallback para compatibilidad
- [x] **Sound Control**: Configuración centralizada de notificaciones
- [x] **No External Assets**: Todo incluido en el bundle (no CDNs)

---

## 🚀 Performance Impact

### Build Size
- **Antes**: 227.09 KB (72.11 KB gzip)
- **Después**: 227.61 KB (72.35 KB gzip)
- **Incremento**: +0.52 KB (+0.24 KB gzip) ≈ 0.2%

### Runtime Impact
- Sanitización: ~0.1ms por mensaje
- Sound playback: Nativo de FiveM (sin overhead JS)
- Font fallback: Sin impacto (CSS nativo)

**Conclusión**: El impacto de performance es despreciable (<1%).

---

## 🔧 Troubleshooting

### "Los colores no se muestran"

Verifica que el mensaje incluya códigos de color FiveM:
```lua
TriggerClientEvent('chat:addMessage', source, {
    args = { 'system', 'Nombre', '^1Mensaje en rojo' }
})
```

### "Los sonidos no se reproducen"

1. Verifica `Config.Sounds.enabled = true` en `client/config.lua`
2. Comprueba que el canal no esté en `mutedChannels`
3. Revisa la consola F8 para errores de Lua

### "Se ven cuadrados en lugar de texto"

Esto ya no debería ocurrir con los fallbacks implementados. Si pasa:
1. Verifica que `tailwind.config.js` tenga la configuración de `fontFamily`
2. Ejecuta `npm run build` de nuevo
3. Reinicia el recurso: `restart caserio_chat`

---

## 📚 Recursos Adicionales

### FiveM Sound List
- [Native Audio List](https://altv.stuyk.com/docs/articles/tables/Play_Sounds.html)
- Lista completa de sonidos nativos de GTA V

### XSS Prevention Best Practices
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

### TailwindCSS Font Configuration
- [TailwindCSS Typography Docs](https://tailwindcss.com/docs/font-family)
