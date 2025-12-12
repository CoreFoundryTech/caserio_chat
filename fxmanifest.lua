fx_version 'cerulean'
game 'gta5'

author 'Caserio Development'
description 'Next-Gen Chat System - Origen Style'
version '1.0.0'

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/*.js',
    'web/dist/assets/*.css',
    'locales/*.json'
}

client_scripts {
    'client/config.lua',
    'client/main.lua',
    'client/bridge.lua'
}

server_scripts {
    'server/bridge.lua',  -- Must load before main.lua
    'server/filters.lua',
    'server/main.lua'
}
