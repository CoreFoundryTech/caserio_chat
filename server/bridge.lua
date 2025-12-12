-- Caserio Chat - Server Bridge
-- Framework detection and helper functions for ESX/QBCore

local Framework = nil
local FrameworkType = GetConvar('caserio_chat_framework', 'auto')

-- Auto-detect framework
Citizen.CreateThread(function()
    if FrameworkType == 'auto' then
        if GetResourceState('qb-core') == 'started' then
            FrameworkType = 'qbcore'
            Framework = exports['qb-core']:GetCoreObject()
            print('^2[Caserio Chat]^7 Detected QBCore framework')
        elseif GetResourceState('es_extended') == 'started' then
            FrameworkType = 'esx'
            Framework = exports['es_extended']:getSharedObject()
            print('^2[Caserio Chat]^7 Detected ESX framework')
        else
            FrameworkType = 'standalone'
            print('^3[Caserio Chat]^7 No framework detected, using ACE permissions')
        end
    end
end)

-- Check if player has police job
function IsPlayerPolice(source)
    if FrameworkType == 'qbcore' and Framework then
        local Player = Framework.Functions.GetPlayer(source)
        if Player and Player.PlayerData and Player.PlayerData.job then
            return Player.PlayerData.job.name == 'police'
        end
    elseif FrameworkType == 'esx' and Framework then
        local xPlayer = Framework.GetPlayerFromId(source)
        if xPlayer and xPlayer.job then
            return xPlayer.job.name == 'police'
        end
    end
    
    -- Fallback to ACE permissions
    return IsPlayerAceAllowed(source, 'chat.police')
end

-- Check if player has EMS job
function IsPlayerEMS(source)
    if FrameworkType == 'qbcore' and Framework then
        local Player = Framework.Functions.GetPlayer(source)
        if Player and Player.PlayerData and Player.PlayerData.job then
            return Player.PlayerData.job.name == 'ambulance'
        end
    elseif FrameworkType == 'esx' and Framework then
        local xPlayer = Framework.GetPlayerFromId(source)
        if xPlayer and xPlayer.job then
            return xPlayer.job.name == 'ambulance'
        end
    end
    
    -- Fallback to ACE permissions
    return IsPlayerAceAllowed(source, 'chat.ems')
end

-- Generic job check
function HasJob(source, jobName)
    if FrameworkType == 'qbcore' and Framework then
        local Player = Framework.Functions.GetPlayer(source)
        if Player and Player.PlayerData and Player.PlayerData.job then
            return Player.PlayerData.job.name == jobName
        end
    elseif FrameworkType == 'esx' and Framework then
        local xPlayer = Framework.GetPlayerFromId(source)
        if xPlayer and xPlayer.job then
            return xPlayer.job.name == jobName
        end
    end
    
    return false
end
