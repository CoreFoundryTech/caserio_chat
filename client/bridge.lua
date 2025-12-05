-- Caserio Chat - Framework Bridge
-- Adapter for ESX/QBCore frameworks

local Framework = nil
local FrameworkType = GetConvar('caserio_chat_framework', 'standalone')

-- Auto-detect framework
if FrameworkType == 'auto' then
    if GetResourceState('qb-core') == 'started' then
        FrameworkType = 'qbcore'
    elseif GetResourceState('es_extended') == 'started' then
        FrameworkType = 'esx'
    else
        FrameworkType = 'standalone'
    end
end

-- Initialize framework
if FrameworkType == 'qbcore' then
    Framework = exports['qb-core']:GetCoreObject()
elseif FrameworkType == 'esx' then
    Framework = exports['es_extended']:getSharedObject()
end

-- Get player job
function GetPlayerJob()
    if not Framework then return 'unemployed' end
    
    if FrameworkType == 'qbcore' then
        local PlayerData = Framework.Functions.GetPlayerData()
        return PlayerData.job and PlayerData.job.name or 'unemployed'
    elseif FrameworkType == 'esx' then
        local PlayerData = Framework.GetPlayerData()
        return PlayerData.job and PlayerData.job.name or 'unemployed'
    end
    
    return 'unemployed'
end

-- Export for server-side use
exports('GetPlayerJob', GetPlayerJob)
exports('GetFrameworkType', function() return FrameworkType end)
