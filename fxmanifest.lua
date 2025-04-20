fx_version 'cerulean'
game 'gta5'

description 'QB Tablet - Sistema Central de Eventos'
version '1.0.0'

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server.lua'
}


ui_page 'html/index.html'

shared_scripts {
    'config.lua'
}

client_scripts {
    'client.lua'
}

server_scripts {
    'server.lua'
}

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/img/*.png'
}

dependencies {
    'qb-core',
    'qb-venices'
}
