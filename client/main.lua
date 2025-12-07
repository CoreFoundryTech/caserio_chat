-- Caserio Chat - Client Main
-- Handles NUI communication and chat state

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
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'TOGGLE_VISIBILITY', data = true })
end)

RegisterKeyMapping('openChat', 'Open Chat', 'keyboard', 'T')

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
    
    -- Play the sound (subtle volume)
    PlaySoundFrontend(-1, soundName, soundSet, true)
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
