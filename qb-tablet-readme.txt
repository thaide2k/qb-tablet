# QB-Tablet - Sistema Central de Eventos

Um sistema de tablet centralizado para servidores QBCore FiveM que funciona como hub principal para todos os eventos e missões no servidor.

## Características

- Interface de tablet interativa e responsiva
- Exibição de informações do jogador (nome, ID, etc.)
- Integração com o sistema de moedas personalizadas (qb-venices)
- Sistema de eventos e missões configuráveis
- Painel de controle para gerenciar atividades do servidor
- Animações e prop de tablet realistas

## Dependências

- [QBCore Framework](https://github.com/qbcore-framework/qb-core)
- [QB-Venices] (Sistema de moedas personalizadas)

## Instalação

1. Certifique-se de ter o qb-core e qb-venices instalados e funcionando
2. Coloque a pasta `qb-tablet` no diretório de resources do seu servidor
3. Adicione `ensure qb-tablet` ao seu server.cfg
4. Reinicie seu servidor

## Uso

Os jogadores podem acessar o tablet usando o comando `/tablet` ou pressionando a tecla `F3` (configurável).

## Configuração

Você pode configurar os eventos disponíveis no arquivo `config.lua`. Cada evento pode ter requisitos personalizados, recompensas e integrações com outros scripts.

### Exemplo de configuração de evento

```lua
['event_1'] = {
    name = "Entrega de Suprimentos",
    description = "Entregue suprimentos médicos para o hospital da cidade",
    icon = "fas fa-ambulance",
    script = "deliveries",
    data = { 
        type = "medical",
        reward = {
            kryon = 50,
            cash = 1000
        }
    },
    requirements = {
        venices = {
            vexel = 5
        }
    }
}
```

## Integração com outros scripts

Para integrar um novo evento ao sistema do tablet, adicione-o à configuração e crie os eventos correspondentes no seu script:

```lua
-- No seu script personalizado, por exemplo qb-deliveries
RegisterNetEvent('qb-deliveries:server:startEvent')
AddEventHandler('qb-deliveries:server:startEvent', function(playerId, eventData)
    -- Lógica para iniciar o evento
    -- eventData contém os dados específicos do evento da config
end)
```

## Desenvolvimento personalizado

Para adicionar novas funcionalidades ao tablet, você pode modificar os arquivos HTML/CSS/JS na pasta `html/` e expandir as funcionalidades do cliente/servidor conforme necessário.

## Contribuição

Sinta-se à vontade para contribuir com este projeto abrindo issues ou pull requests.

## Licença

Este projeto está licenciado sob a licença MIT.
