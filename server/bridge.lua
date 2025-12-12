-- Caserio Chat - Server Bridge (Optimized with Cache)
-- Framework detection and helper functions for ESX/QBCore

local Framework = nil
local FrameworkType = GetConvar('caserio_chat_framework', 'auto')
local PlayerJobs = {} -- 🚀 Caché en memoria (Job Name)

-- ✅ 1. Detección de Framework
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

-- ✅ 2. Helper para Actualizar Caché
local function UpdateCachedJob(source, jobName)
    PlayerJobs[source] = jobName
end

-- ✅ 3. Eventos del Framework (Listeners)
if FrameworkType == 'qbcore' then
    -- Al entrar
    RegisterNetEvent('QBCore:Server:PlayerLoaded', function(Player)
        local src = source
        local xPlayer = Framework.Functions.GetPlayer(src)
        if xPlayer and xPlayer.PlayerData and xPlayer.PlayerData.job then
            UpdateCachedJob(src, xPlayer.PlayerData.job.name)
        end
    end)
    
    -- Al cambiar de trabajo
    RegisterNetEvent('QBCore:Server:OnJobUpdate', function(source, job)
        if job and job.name then
            UpdateCachedJob(source, job.name)
        end
    end)

elseif FrameworkType == 'esx' then
    -- Al entrar
    RegisterNetEvent('esx:playerLoaded', function(playerId, xPlayer)
        if xPlayer and xPlayer.job then
            UpdateCachedJob(playerId, xPlayer.job.name)
        end
    end)

    -- Al cambiar de trabajo
    RegisterNetEvent('esx:setJob', function(playerId, job, lastJob)
        if job and job.name then
            UpdateCachedJob(playerId, job.name)
        end
    end)
end

-- ✅ 4. Limpieza de Caché (Universal)
AddEventHandler('playerDropped', function()
    PlayerJobs[source] = nil
end)

-- ✅ 5. CRÍTICO: Recuperación ante Reinicio del Script
-- Si reinicias el script con gente online, llenamos la caché inmediatamente
Citizen.CreateThread(function()
    Wait(1000) -- Esperar a que el framework esté listo
    
    if FrameworkType == 'qbcore' and Framework then
        local players = Framework.Functions.GetQBPlayers()
        local count = 0
        for _, pl in pairs(players) do
            if pl and pl.PlayerData and pl.PlayerData.job then
                UpdateCachedJob(pl.PlayerData.source, pl.PlayerData.job.name)
                count = count + 1
            end
        end
        if count > 0 then
            print(string.format('^2[Caserio Chat]^7 Cached jobs for %d online players (QBCore)', count))
        end
        
    elseif FrameworkType == 'esx' and Framework then
        local players = Framework.GetExtendedPlayers()
        local count = 0
        for _, xPlayer in pairs(players) do
            if xPlayer and xPlayer.source and xPlayer.job then
                UpdateCachedJob(xPlayer.source, xPlayer.job.name)
                count = count + 1
            end
        end
        if count > 0 then
            print(string.format('^2[Caserio Chat]^7 Cached jobs for %d online players (ESX)', count))
        end
    end
end)

-- ✅ 6. Funciones Públicas (Lectura desde Caché O(1))

function IsPlayerPolice(source)
    -- Primero intentamos caché rápida
    local job = PlayerJobs[source]
    if job == 'police' then return true end

    -- Fallback: ACE permissions (✅ FIX: usar nativa correcta)
    return IsPrincipalAceAllowed('player.' .. source, 'chat.police')
end

function IsPlayerEMS(source)
    local job = PlayerJobs[source]
    if job == 'ambulance' then return true end
    
    return IsPrincipalAceAllowed('player.' .. source, 'chat.ems')
end

function HasJob(source, jobName)
    return PlayerJobs[source] == jobName
end
