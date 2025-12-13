-- Caserio Chat - Client Main
-- Handles NUI communication and chat state

print('^2[Caserio Chat]^7 Client main.lua cargado correctamente')

-- ANTI-SPAM DE AUDIO
local lastSoundTime = 0
local SOUND_COOLDOWN = 200 -- ms (ajusta a tu gusto)

local chatDisabled = GetConvar('chat_disable', 'false') == 'true'

Citizen.CreateThread(function()
    if chatDisabled then 
        SetTextChatEnabled(false)
        print('^2[Caserio Chat]^7 Chat nativo desactivado via convar')
    else
        -- Check if native chat is running
        if GetResourceState('chat') == 'started' then
            print('^3[Caserio Chat]^7 ADVERTENCIA: El chat nativo está activo. Considera agregar "setr chat_disable true" en server.cfg')
        end
        SetTextChatEnabled(false) -- Disable anyway for this resource
    end
    SetNuiFocus(false, false)
end)

-- Command to open chat
RegisterCommand('openChat', function()
    print('^2[Caserio Chat]^7 Comando openChat ejecutado')
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'TOGGLE_VISIBILITY', data = true })
    print('^2[Caserio Chat]^7 NUI enviado para abrir chat')
end)

RegisterKeyMapping('openChat', 'Open Chat', 'keyboard', 'T')
-- Command to open chat via /chat
RegisterCommand('chat', function()
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'TOGGLE_VISIBILITY', data = true })
end)

-- Receive Message from Server
RegisterNetEvent('chat:addMessage')
AddEventHandler('chat:addMessage', function(data)
    local messageData = {}
    
    -- Formato 1: Mensaje directo del servidor (commands /me, /do, etc)
    if data.id and data.message then
        messageData = {
            id = data.id,
            type = data.type or 'system',
            channel = data.channel or 'system',
            author = data.author or 'System',
            message = data.message,
            timestamp = data.timestamp or GetGameTimer(),
            tags = data.tags or {}
        }
    -- Formato 2: args[] (broadcast normal)
    elseif data.args then
        messageData = {
            id = tostring(math.random(1000000, 9999999)),
            type = 'system',
            channel = data.args[1] or 'system',
            author = data.args[2] or 'System',
            message = data.args[3] or data.args[1] or '',
            timestamp = GetGameTimer(),
            tags = data.tags or {}
        }
    else
        -- Fallback: intentar usar data directamente
        messageData = {
            id = tostring(math.random(1000000, 9999999)),
            type = 'system',
            channel = 'system',
            author = 'System',
            message = tostring(data) or '',
            timestamp = GetGameTimer(),
            tags = {}
        }
    end
    
    -- DETECCIÓN DE MENCIÓN: Comprobar si el mensaje contiene el nombre del jugador
    local playerName = GetPlayerName(PlayerId())
    local isMention = false
    
    if messageData.message and playerName then
        -- Búsqueda case-insensitive
        if string.find(string.lower(messageData.message), string.lower(playerName)) then
            isMention = true
        end
    end
    
    -- Añadir propiedad isMention al messageData
    messageData.isMention = isMention
    
    SendNUIMessage({
        action = 'ADD_MESSAGE',
        data = messageData
    })
    
    -- Play sound notification based on message type
    local soundName = 'CLICK_BACK'
    local soundSet = 'WEB_NAVIGATION_SOUNDS_PHONE'
    
    -- Check if message is a mention (contains player name)
    local playerName = GetPlayerName(PlayerId())
    if messageData.message and string.find(string.lower(messageData.message), string.lower(playerName)) then
        soundName = 'Menu_Accept'
        soundSet = 'Phone_SoundSet_Default'
    end
    
    -- Check if it's a private/important channel
    if messageData.channel == 'police' or messageData.channel == 'ems' then
        soundName = 'Event_Start_Text'
        soundSet = 'GTAO_FM_Events_Soundset'
    end
    
    -- Check for tags indicating importance
    if messageData.tags then
        for _, tag in ipairs(messageData.tags) do
            if tag == 'ADMIN' or tag:find('IMPORTANT') then
                soundName = 'Beep_Red'
                soundSet = 'DLC_HEIST_HACKING_SNAKE_SOUNDS'
                break
            end
        end
    end
    
    -- Play the sound (CON PROTECCI\u00d3N ANTI-SPAM)
    local currentTime = GetGameTimer()
    if (currentTime - lastSoundTime) > SOUND_COOLDOWN then
        PlaySoundFrontend(-1, soundName, soundSet, true)
        lastSoundTime = currentTime
    end
end)

-- NUI Callbacks
RegisterNUICallback('sendMessage', function(data, cb)
    local msg = data.message
    if string.sub(msg, 1, 1) == "/" then
        ExecuteCommand(string.sub(msg, 2))
    else
        TriggerServerEvent('chat:server:Broadcast', msg)
    end
    cb('ok')
end)

RegisterNUICallback('close', function(data, cb)
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'TOGGLE_VISIBILITY', data = false })
    cb('ok')
end)

-- SISTEMA DE SUGERENCIAS DINÁMICAS

AddEventHandler('chat:addSuggestion', function(name, help, params)
    SendNUIMessage({
        action = 'ADD_SUGGESTION',
        data = {
            name = name,
            help = help,
            params = params or {}
        }
    })
end)

AddEventHandler('chat:removeSuggestion', function(name)
    SendNUIMessage({
        action = 'REMOVE_SUGGESTION',
        data = { name = name }
    })
end)

-- Solicitar sugerencias al iniciar (para scripts que cargaron antes que el chat)
Citizen.CreateThread(function()
    Wait(3000) -- Esperar 3 segundos para asegurar que la UI cargó y React hidrató
    TriggerEvent('chat:refreshSuggestions')
end)

-- ✅ COMANDO DEBUG: Forzar recarga de sugerencias si NUI falló al inicio
RegisterCommand('refreshchat', function()
    TriggerEvent('chat:refreshSuggestions')
    print('^2[Caserio Chat]^7 Sugerencias refrescadas manualmente.')
end, false)
