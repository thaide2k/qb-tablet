local QBCore = exports['qb-core']:GetCoreObject()

-- Obter informações do jogador
QBCore.Functions.CreateCallback('qb-tablet:server:getPlayerInfo', function(source, cb)
    local Player = QBCore.Functions.GetPlayer(source)
    if Player then
        local citizenid = Player.PlayerData.citizenid
        local playerName = Player.PlayerData.charinfo.firstname .. ' ' .. Player.PlayerData.charinfo.lastname
        
        -- Obter saldo de venices diretamente do banco de dados
        MySQL.Async.fetchAll('SELECT * FROM player_venices WHERE citizenid = ?', {citizenid}, function(result)
            local venices = {
                kryon = 0,
                vexel = 0,
                zynther = 0
            }
            
            if result and result[1] then
                venices = {
                    kryon = tonumber(result[1].kryon) or 0,
                    vexel = tonumber(result[1].vexel) or 0,
                    zynther = tonumber(result[1].zynther) or 0
                }
            else
                -- Se não encontrar registro, cria um novo
                MySQL.Async.execute(
                    'INSERT IGNORE INTO player_venices (citizenid, kryon, vexel, zynther) VALUES (?, ?, ?, ?)',
                    {citizenid, Config.StartingValues.kryon or 0, Config.StartingValues.vexel or 0, Config.StartingValues.zynther or 0}
                )
            end
            
            -- Obter eventos disponíveis
            local events = GetAvailableEvents(Player, venices)
            
            cb({
                name = playerName,
                id = source,
                citizenid = citizenid,
                venices = venices,
                events = events
            })
        end)
    else
        cb(nil)
    end
end)

-- Iniciar evento ou missão
RegisterNetEvent('qb-tablet:server:startEvent')
AddEventHandler('qb-tablet:server:startEvent', function(eventId)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        -- Verificar se o evento existe e se o jogador pode iniciá-lo
        local event = Config.Events[eventId]
        if event then
            -- MODIFICADO: Removeu verificação de requisitos
            -- Iniciar o evento diretamente
            TriggerEvent('qb-' .. event.script .. ':server:startEvent', src, event.data)
            TriggerClientEvent('QBCore:Notify', src, 'Evento iniciado: ' .. event.name, 'success')
        else
            TriggerClientEvent('QBCore:Notify', src, 'Evento não encontrado!', 'error')
        end
    end
end)

-- Função para buscar eventos disponíveis
function GetAvailableEvents(Player, venices)
    local events = {}
    
    -- Adicionar eventos do config
    for id, event in pairs(Config.Events) do
        -- MODIFICADO: Todos eventos estão disponíveis para o jogador
        local isAvailable = true
        
        -- Adicionar à lista se disponível
        if isAvailable then
            table.insert(events, {
                id = id,
                name = event.name,
                description = event.description,
                icon = event.icon,
                requirements = event.requirements  -- Mantemos os requirements para exibição, mas não verificamos
            })
        end
    end
    
    return events
end

-- Registrar que um evento foi concluído (para ser chamado por outros recursos)
function MarkEventCompleted(source, eventId)
    local Player = QBCore.Functions.GetPlayer(source)
    if Player then
        -- Implementar lógica para marcar eventos como concluídos
        -- Isso pode ser útil para rastrear progresso, desbloquear novos eventos, etc.
        TriggerClientEvent('QBCore:Notify', source, 'Evento concluído!', 'success')
    end
end

exports('MarkEventCompleted', MarkEventCompleted)

-- Função para adicionar venices diretamente através do servidor
function AddVeniceToPlayer(source, veniceType, amount)
    return exports['qb-venices']:AddVenice(source, veniceType, amount)
end

exports('AddVeniceToPlayer', AddVeniceToPlayer)
