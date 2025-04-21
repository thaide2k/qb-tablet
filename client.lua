local QBCore = exports['qb-core']:GetCoreObject()
local PlayerData = {}
local tabletOpen = false
local tabletObject = nil

-- Carregar dados do jogador
RegisterNetEvent('QBCore:Client:OnPlayerLoaded')
AddEventHandler('QBCore:Client:OnPlayerLoaded', function()
    PlayerData = QBCore.Functions.GetPlayerData()
end)

-- Atualizar dados do jogador quando mudar
RegisterNetEvent('QBCore:Client:OnPlayerDataUpdate')
AddEventHandler('QBCore:Client:OnPlayerDataUpdate', function(data)
    PlayerData = data
end)

-- Atualizar informações de venices
RegisterNetEvent('qb-tablet:client:updateVenices')
AddEventHandler('qb-tablet:client:updateVenices', function(venicesData)
    PlayerData.venices = venicesData
    if tabletOpen then
        SendNUIMessage({
            type = "updateVenices",
            venices = venicesData
        })
    end
end)

-- Abrir o tablet com comando
RegisterCommand('tablet', function()
    OpenTablet()
end, false)

-- Adicionar tecla de atalho para o tablet (F3)
RegisterKeyMapping('tablet', 'Abrir Tablet', 'keyboard', 'F3')

-- Função para abrir o tablet
function OpenTablet()
    if not tabletOpen then
        QBCore.Functions.TriggerCallback('qb-tablet:server:getPlayerInfo', function(playerInfo)
            if playerInfo then
                PlayerData.venices = playerInfo.venices
                tabletOpen = true
                
                -- Animar o jogador pegando o tablet
                loadAnimDict("amb@code_human_in_bus_passenger_idles@female@tablet@idle_a")
                TaskPlayAnim(PlayerPedId(), "amb@code_human_in_bus_passenger_idles@female@tablet@idle_a", "idle_a", 3.0, 3.0, -1, 49, 0, false, false, false)
                
                -- Criar prop do tablet
                local tabletModel = `prop_cs_tablet`
                RequestModel(tabletModel)
                while not HasModelLoaded(tabletModel) do
                    Citizen.Wait(10)
                end
                local tabletObj = CreateObject(tabletModel, 0.0, 0.0, 0.0, true, true, false)
                AttachEntityToEntity(tabletObj, PlayerPedId(), GetPedBoneIndex(PlayerPedId(), 60309), 0.03, 0.002, -0.0, 10.0, 160.0, 0.0, true, false, false, false, 2, true)
                
                -- Abrir a NUI
                SetNuiFocus(true, true)
                SendNUIMessage({
                    type = "openTablet",
                    player = {
                        name = playerInfo.name,
                        id = playerInfo.id,
                        citizenid = playerInfo.citizenid
                    },
                    venices = playerInfo.venices,
                    events = playerInfo.events
                })
                
                -- Guardar o objeto do tablet para removê-lo depois
                tabletObject = tabletObj
            else
                QBCore.Functions.Notify('Erro ao carregar seus dados', 'error')
            end
        end)
    end
end

-- Fechar o tablet (chamado pelo NUI)
RegisterNUICallback('closeTablet', function()
    CloseTablet()
end)

-- Função para fechar o tablet
function CloseTablet()
    if tabletOpen then
        tabletOpen = false
        
        -- Parar a animação
        StopAnimTask(PlayerPedId(), "amb@code_human_in_bus_passenger_idles@female@tablet@idle_a", "idle_a", 1.0)
        
        -- Remover o objeto do tablet
        if tabletObject then
            DeleteObject(tabletObject)
            tabletObject = nil
        end
        
        -- Fechar a NUI
        SetNuiFocus(false, false)
        SendNUIMessage({
            type = "closeTablet"
        })
    end
end

-- Iniciar evento/missão
RegisterNUICallback('startEvent', function(data, cb)
    TriggerServerEvent('qb-tablet:server:startEvent', data.eventId)
    cb({status = 'ok'})
end)

-- Callback para compra de itens na Blackmarket
RegisterNUICallback('buyMarketItem', function(data, cb)
    TriggerServerEvent('qb-tablet:server:buyMarketItem', data)
    cb({status = 'ok'})
end)

-- Funções auxiliares
function loadAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        RequestAnimDict(dict)
        Citizen.Wait(5)
    end
end
