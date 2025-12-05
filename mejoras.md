🚀 Mejoras Específicas: Control de Scroll y Claridad de Rol

Este documento detalla únicamente los cambios necesarios para solucionar el problema de la "lista gigante de mensajes" y mejorar la distinción visual entre comandos de rol (/me, /do, Radio, etc.).

1. Frontend: Control de Altura y Scroll (MessageFeed.tsx)

Objetivo: Evitar que el chat cubra toda la pantalla y permitir leer el historial cómodamente.

Cambios en CSS/Tailwind

El contenedor principal de mensajes debe tener estas propiedades:

Límite de Altura: max-h-[50vh] (Máximo 50% de la altura de la pantalla).

Scroll Condicional:

Si el chat está ABIERTO (isInputVisible: true): overflow-y-auto y pointer-events-auto (Permite scroll con mouse).

Si el chat está CERRADO: overflow-hidden y pointer-events-none (No bloquea el juego).

Efecto "Fade Out" (Máscara): Para que los mensajes viejos no se corten de golpe arriba, usar una máscara CSS.

mask-image: linear-gradient(to bottom, transparent, black 15%)

Comportamiento del Scroll

Auto-Scroll: Al llegar un mensaje nuevo, bajar automáticamente al final.

Detección de Usuario: Si el usuario sube el scroll manualmente, pausar el auto-scroll para dejarle leer.

2. Frontend: Diseño de Burbuja con Cabecera (MessageBubble.tsx)

Objetivo: Que los usuarios distingan instantáneamente una acción (/me) de un entorno (/do) o un mensaje de radio.

Nuevo Layout de la Burbuja:
En lugar de solo texto, la burbuja ahora tiene dos filas:

Fila 1: Cabecera (Header)

Una línea pequeña y estilizada encima del mensaje con:
[ICONO] [TIPO DE MENSAJE] • [NOMBRE DEL JUGADOR]

Estilo: Texto pequeño (text-[10px]), negrita, uppercase, con opacidad reducida (opacity-80).

Configuración por Tipo:

Tipo

Icono (Lucide)

Texto Cabecera

Color Acento

me

User

ME

Blanco/Gris

do

Eye

ENTORNO

Rojo/Naranja

radio

Radio

FRECUENCIA X

Verde

police

Shield

POLICÍA

Azul

ems

Ambulance

EMS

Rojo

system

Terminal

SISTEMA

Gris

Fila 2: Cuerpo del Mensaje

El texto del mensaje (message.message), renderizado debajo de la cabecera.

3. Backend: Lógica Lua para Tipos de Rol

Objetivo: Asegurar que el frontend sepa qué icono pintar.

El script Lua (server/main.lua o client/main.lua) debe enviar explícitamente la propiedad type en el payload JSON.

Implementación de Comandos Nativos

-- server/main.lua

-- Comando /me
RegisterCommand('me', function(source, args, rawCommand)
    local text = table.concat(args, " ")
    local playerName = GetPlayerName(source)
    
    TriggerClientEvent('chat:addMessage', -1, {
        type = 'me', -- <--- CLAVE: Esto le dice a React que use el icono de User
        author = playerName,
        message = text,
        timestamp = os.time()
    })
end)

-- Comando /do
RegisterCommand('do', function(source, args, rawCommand)
    local text = table.concat(args, " ")
    local playerName = GetPlayerName(source)
    
    TriggerClientEvent('chat:addMessage', -1, {
        type = 'do', -- <--- CLAVE: Esto le dice a React que use el icono de Ojo
        author = playerName,
        message = text,
        timestamp = os.time()
    })
end)


Notas para el Builder

No borrar la lógica de sanitización XSS existente.

Asegurarse de que MessageBubble acepte message.type como prop para decidir colores e iconos.

El Scroll To Bottom debe ser suave (behavior: 'smooth').