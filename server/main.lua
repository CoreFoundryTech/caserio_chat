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

-- Broadcast Event
RegisterNetEvent('chat:server:Broadcast')
AddEventHandler('chat:server:Broadcast', function(msg)
    local src = source
    local name = GetPlayerName(src)
    
    TriggerClientEvent('chat:addMessage', -1, {
        args = { 'system', name, msg },
        tags = { 'ID: '..src }
    })
end)

-- /me command (roleplay action)
RegisterCommand('me', function(source, args)
    local message = table.concat(args, ' ')
    local playerName = GetPlayerName(source)
    
    if #args == 0 then
        TriggerClientEvent('chat:addMessage', source, {
            args = { 'system', 'Sistema', T('commands.me.usage') },
            tags = {'INFO'}
        })
        return
    end
    
    TriggerClientEvent('chat:addMessage', -1, {
        id = tostring(math.random(1000000, 9999999)),
        type = 'me',
        channel = 'system',
        author = playerName,
        message = '* ' .. message,
        timestamp = os.time() * 1000,
        tags = {'RP'}
    })
end)

-- /do command (roleplay description)
RegisterCommand('do', function(source, args)
    local message = table.concat(args, ' ')
    local playerName = GetPlayerName(source)
    
    if #args == 0 then
        TriggerClientEvent('chat:addMessage', source, {
            args = { 'system', 'Sistema', T('commands.do.usage') },
            tags = {'INFO'}
        })
        return
    end
    
    TriggerClientEvent('chat:addMessage', -1, {
        id = tostring(math.random(1000000, 9999999)),
        type = 'do',
        channel = 'system',
        author = playerName,
        message = '** ' .. message .. ' **',
        timestamp = os.time() * 1000,
        tags = {'RP'}
    })
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
    
    TriggerClientEvent('chat:addMessage', -1, {
        id = tostring(math.random(1000000, 9999999)),
        type = 'system',
        channel = 'ooc',
        author = playerName,
        message = message,
        timestamp = os.time() * 1000,
        tags = {}
    })
end)

-- /police command (police channel)
RegisterCommand('police', function(source, args)
    -- Check permissions (requires ace permission or police job)
    if not IsPlayerAceAllowed(source, 'chat.police') then
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
    
    -- Broadcast to all police
    local players = GetPlayers()
    for _, playerId in ipairs(players) do
        if IsPlayerAceAllowed(tonumber(playerId), 'chat.police') then
            TriggerClientEvent('chat:addMessage', playerId, {
                id = tostring(math.random(1000000, 9999999)),
                type = 'police',
                channel = 'police',
                author = playerName,
                message = message,
                timestamp = os.time() * 1000,
                tags = {'POLICE'}
            })
        end
    end
end)

print('^2[Caserio Chat]^7 Server script loaded successfully')
