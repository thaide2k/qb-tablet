Config = {}

-- Valores iniciais para novos usuários (caso não exista no banco de dados)
Config.StartingValues = {
    kryon = 10,
    vexel = 0,
    zynther = 0
}

-- Lista de venices disponíveis
Config.Venices = {
    kryon = true,
    vexel = true,
    zynther = true
}

-- Configuração de eventos e missões disponíveis no tablet
Config.Events = {
    -- Modelo de evento
    ['event_1'] = {
        name = "Feira de Weed",
        description = "Monte sua barraca de venda e atenda clientes para ganhar kryon",
        icon = "fas fa-cannabis",
        script = "feira", -- O script que será chamado para iniciar o evento
        data = { -- Dados específicos que serão passados para o script
            reward = {
                kryon = 1  -- Recompensa por cliente
            }
        },
        requirements = {
            venices = {
                kryon = 1 -- Requer 5 kryon para iniciar
            },
            -- Outros requisitos podem ser adicionados aqui
        }
    },
    ['event_2'] = {
        name = "Caça ao Tesouro",
        description = "Encontre o tesouro escondido seguindo as pistas pela cidade",
        icon = "fas fa-map-marked-alt",
        script = "treasurehunt", 
        data = {
            difficulty = "medium",
            reward = {
                zynther = 3,
                items = {"rare_gem", "gold_bar"}
            }
        },
        requirements = {
            venices = {
                kryon = 10
            }
        }
    },
    ['event_3'] = {
        name = "Corrida Clandestina",
        description = "Participe de uma corrida ilegal pelas ruas da cidade",
        icon = "fas fa-flag-checkered",
        script = "racing",
        data = {
            track = "downtown",
            laps = 3,
            reward = {
                vexel = 15
            }
        },
        requirements = {
            venices = {
                kryon = 25
            }
        }
    },
    ['event_4'] = {
        name = "Assalto a Loja",
        description = "Planeje e execute um assalto a uma loja de conveniência",
        icon = "fas fa-mask",
        script = "heists",
        data = {
            target = "convenience_store",
            difficulty = "easy",
            reward = {
                kryon = 30
            }
        },
        requirements = {
            venices = {
                kryon = 30
            },
            --permission = "criminal" -- Apenas jogadores com job "criminal" podem ver/iniciar
        }
    }
}

-- Configurações de interface
Config.UI = {
    color = {
        primary = "#3498db",
        secondary = "#2ecc71",
        accent = "#9b59b6"
    }
}
