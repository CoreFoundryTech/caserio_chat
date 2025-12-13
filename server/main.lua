-- Caserio Chat - Server Main
-- Handles commands, broadcasting, and permissions

-- Load locales
local Locales = {}
local CurrentLocale = GetConvar('chat_locale', 'es') -- Default Spanish

function LoadLocale(locale)
    local file = LoadResourceFile(GetCurrentResourceName(), 'locales/' .. locale .. '.json')
    if file then
        Locales[locale] = json.decode(file)
        print('^2[Caserio Chat]^7 Loaded locale: ' .. locale)
    else
        print('^1[Caserio Chat]^7 Failed to load locale: ' .. locale)
    end
end

LoadLocale('en')
LoadLocale('es')

-- ✅ FIX CRÍTICO: Hacer T() global para que filters.lua pueda usarla
function T(key)
    local keys = {}
    for k in string.gmatch(key, "[^.]+") do
        table.insert(keys, k)
    end
    
    local value = Locales[CurrentLocale]
    for _, k in ipairs(keys) do
        if value then
            value = value[k]
        end
    end
    
    return value or key
end

-- ✅ SEGURIDAD: Inicializar seed de aleatoriedad con mayor entropía
math.randomseed(os.time())

-- ✅ SEGURIDAD: Sistema de generación de IDs seguro (previene colisiones)
local messageCounter = 0
function GenerateMessageID(source)
    messageCounter = messageCounter + 1
    return string.format("%d-%d-%d", os.time(), source or 0, messageCounter)
end

-- ✅ CRÍTICO: Función centralizada para broadcast con filtrado
local function SafeBroadcast(source, messageType, channel, author, message, tags, recipients)
    local resourceName = GetCurrentResourceName()
    
    -- Verificar filtro de palabras prohibidas
    if exports[resourceName]:ContainsBlacklistedWord(message) then
        TriggerClientEvent('chat:addMessage', source, {
            args = { 'system', 'Sistema', 'ERROR: ' .. T('errors.blacklisted_word') },
            tags = {'ERROR'}
        })
        return false
    end
    
    -- Enviar mensaje
    local messageData = {
        id = GenerateMessageID(source),
        type = messageType,
        channel = channel,
        author = author,
        message = message,
        timestamp = os.time() * 1000,
        tags = tags or {}
    }
    
    if recipients then
        -- Envío selectivo (ej: solo policía)
        for _, playerId in ipairs(recipients) do
            TriggerClientEvent('chat:addMessage', playerId, messageData)
        end
    else
        -- Broadcast global
        TriggerClientEvent('chat:addMessage', -1, messageData)
    end
    
    return true
end

-- Broadcast Event
RegisterNetEvent('chat:server:Broadcast')
AddEventHandler('chat:server:Broadcast', function(msg)
    local src = source
    local name = GetPlayerName(src)
    
    -- ✅ ROBUSTEZ: Validar tipo antes de procesar
    if type(msg) ~= 'string' then
        print('^1[Caserio Chat]^7 Invalid message type from player ' .. src)
        return
    end
    
    -- ✅ SEGURIDAD: Validar longitud del mensaje
    if string.len(msg) > 255 then
        TriggerClientEvent('chat:addMessage', src, {
            args = { 'system', 'Sistema', 'Mensaje demasiado largo (máximo 255 caracteres)' },
            tags = {'ERROR'}
        })
        return
    end
    
    TriggerClientEvent('chat:addMessage', -1, {
        args = { 'system', name, msg },
        tags = { 'ID: '..src }
    })
end)

-- /me command (roleplay action)
RegisterCommand('me', function(source, args)
    -- ✅ SEGURIDAD: Validar que args sea una tabla
    if type(args) ~= 'table' then
        print('^1[Caserio Chat]^7 Invalid args type from player ' .. source)
        return
    end
    
    local message = table.concat(args, ' ')
    local playerName = GetPlayerName(source)
    
    if #args == 0 then
        TriggerClientEvent('chat:addMessage', source, {
            args = { 'system', 'Sistema', T('commands.me.usage') },
            tags = {'INFO'}
        })
        return
    end
    
    -- ✅ Usar SafeBroadcast para filtrado
    SafeBroadcast(source, 'me', 'system', playerName, '* ' .. message, {'RP'})
end)

-- /do command (roleplay description)
RegisterCommand('do', function(source, args)
    -- ✅ SEGURIDAD: Validar que args sea una tabla
    if type(args) ~= 'table' then
        print('^1[Caserio Chat]^7 Invalid args type from player ' .. source)
        return
    end
    
    local message = table.concat(args, ' ')
    local playerName = GetPlayerName(source)
    
    if #args == 0 then
        TriggerClientEvent('chat:addMessage', source, {
            args = { 'system', 'Sistema', T('commands.do.usage') },
            tags = {'INFO'}
        })
        return
    end
    
    -- ✅ Usar SafeBroadcast para filtrado
    SafeBroadcast(source, 'do', 'system', playerName, '** ' .. message .. ' **', {'RP'})
end)

-- /ooc command (out of character)
RegisterCommand('ooc', function(source, args)
    local message = table.concat(args, ' ')
    local playerName = GetPlayerName(source)
    
    if #args == 0 then
        TriggerClientEvent('chat:addMessage', source, {
            args = { 'system', 'Sistema', T('commands.ooc.usage') },
            tags = {'INFO'}
        })
        return
    end
    
    -- ✅ Usar SafeBroadcast para filtrado
    SafeBroadcast(source, 'system', 'ooc', playerName, message, {})
end)

-- /police command (police channel)
RegisterCommand('police', function(source, args)
    -- ✅ FRAMEWORK INTEGRATION: Check permissions via bridge (ESX/QB jobs + ACE fallback)
    if not IsPlayerPolice(source) then
        TriggerClientEvent('chat:addMessage', source, {
            args = { 'system', 'Sistema', T('errors.no_permission_channel') },
            tags = {'ERROR'}
        })
        return
    end
    
    local message = table.concat(args, ' ')
    local playerName = GetPlayerName(source)
    
    if #args == 0 then
        TriggerClientEvent('chat:addMessage', source, {
            args = { 'system', 'Sistema', T('commands.police.usage') },
            tags = {'INFO'}
        })
        return
    end
    
    -- ✅ SEGURIDAD: Validar longitud del mensaje
    if string.len(message) > 255 then
        TriggerClientEvent('chat:addMessage', source, {
            args = { 'system', 'Sistema', 'Mensaje demasiado largo (máximo 255 caracteres)' },
            tags = {'ERROR'}
        })
        return
    end
    
    -- Obtener lista de policías
    local policeRecipients = {}
    local players = GetPlayers()
    for _, playerId in ipairs(players) do
        if IsPlayerPolice(tonumber(playerId)) then
            table.insert(policeRecipients, playerId)
        end
    end
    
    -- ✅ Usar SafeBroadcast con recipients selectivos
    SafeBroadcast(source, 'police', 'police', playerName, message, {'POLICE'}, policeRecipients)
end)

print('^2[Caserio Chat]^7 Server script loaded successfully')

RegisterCommand("*", function(source, args, raw)
    TriggerEvent('chat:server:Broadcast', table.concat(args, ' '))
end)
