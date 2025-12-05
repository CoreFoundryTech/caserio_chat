-- Caserio Chat - Sound Configuration
-- Configure notification sounds for different message types

Config = Config or {}

Config.Sounds = {
    enabled = true,
    
    -- Sound for regular messages
    default = {
        name = 'CLICK_BACK',
        set = 'WEB_NAVIGATION_SOUNDS_PHONE'
    },
    
    -- Sound for mentions (when player name is in message)
    mention = {
        name = 'Menu_Accept',
        set = 'Phone_SoundSet_Default'
    },
    
    -- Sound for important channels (police, ems)
    important = {
        name = 'Event_Start_Text',
        set = 'GTAO_FM_Events_Soundset'
    },
    
    -- Sound for admin messages
    admin = {
        name = 'Beep_Red',
        set = 'DLC_HEIST_HACKING_SNAKE_SOUNDS'
    },
    
    -- Disable sounds for specific channels
    mutedChannels = {
        -- 'system',
        -- 'ooc'
    }
}

-- Export for use in main.lua
return Config
