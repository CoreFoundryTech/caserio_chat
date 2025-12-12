-- Caserio Chat - Filters
-- Anti-spam and blacklist filters

local messageTimestamps = {} -- { [source] = { lastMessage, count } }
local Config = {
    antiSpam = {
        enabled = true,
        maxMessages = 3,
        timeWindow = 5 -- seconds
    },
    blacklistedWords = {
        -- Add prohibited words here
        'palabra1',
        'palabra2',
    }
}

function IsSpamming(source)
    if not Config.antiSpam.enabled then return false end
    
    local now = os.time()
    local data = messageTimestamps[source]
    
    if not data then
        messageTimestamps[source] = { lastMessage = now, count = 1 }
        return false
    end
    
    -- More than maxMessages in timeWindow seconds = spam
    if (now - data.lastMessage) < Config.antiSpam.timeWindow then
        data.count = data.count + 1
        if data.count > Config.antiSpam.maxMessages then
            return true
        end
    else
        data.count = 1
    end
    
    data.lastMessage = now
    return false
end

function ContainsBlacklistedWord(message)
    local lowerMessage = string.lower(message)
    for _, word in ipairs(Config.blacklistedWords) do
        if string.find(lowerMessage, word) then
            return true
        end
    end
    return false
end

-- Hook into broadcast event to apply filters
AddEventHandler('chat:server:Broadcast', function(msg)
    local src = source
    
    -- Check spam
    if IsSpamming(src) then
        TriggerClientEvent('chat:addMessage', src, {
            args = { 'system', 'Sistema', 'ERROR: ' .. T('errors.spam_detected') },
            tags = {'ERROR'}
        })
        CancelEvent()
        return
    end
    
    -- Check blacklisted words
    if ContainsBlacklistedWord(msg) then
        TriggerClientEvent('chat:addMessage', src, {
            args = { 'system', 'Sistema', 'ERROR: ' .. T('errors.blacklisted_word') },
            tags = {'ERROR'}
        })
        CancelEvent()
        return
    end
end)

print('^2[Caserio Chat]^7 Filters loaded successfully')

-- ✅ CRÍTICO: Exportar funciones para usar en main.lua
exports('ContainsBlacklistedWord', ContainsBlacklistedWord)
exports('IsSpamming', IsSpamming)
