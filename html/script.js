// Global variables to store player and event data
let playerData = null;
let eventsData = [];
let activeTab = 'home';
let currentItemData = null;
let clockInterval = null;

$(document).ready(function() {
    // Listen for NUI messages from the game client
    window.addEventListener('message', function(event) {
        const data = event.data;
        
        if (data.type === 'openTablet') {
            // Store player data
            playerData = data.player;
            eventsData = data.events;
            
            // Update player info
            $('#player-name').text(playerData.name);
            $('#player-id').text('ID: ' + playerData.id);
            
            // Update venices info
            updateVenicesDisplay(data.venices);
            
            // Setup events list
            setupEventsList(eventsData);
            
            // Set featured event
            setFeaturedEvent();
            
            // Update stats
            $('#available-events').text(eventsData.length);
            $('#total-venices').text(calculateTotalVenices(data.venices));
            
            // Show tablet UI
            $('#tablet').removeClass('hidden');
            
            // Start time update
            updateClock();
            clockInterval = setInterval(updateClock, 1000);
        } else if (data.type === 'closeTablet') {
            closeTablet();
        } else if (data.type === 'updateVenices') {
            updateVenicesDisplay(data.venices);
        } else if (data.type === 'purchaseResult') {
            if (data.success) {
                showNotification('Item comprado com sucesso!', 'success');
                // Atualizar saldo do jogador
                updateVenicesDisplay(data.venices);
            } else {
                showNotification(data.message, 'error');
            }
        }
    });
    
    // Close button click handler
    $('#close-button').click(function() {
        closeTablet();
    });
    
    // Tab navigation
    $('.menu-item').click(function() {
        const tabId = $(this).data('tab');
        
        // Update active menu item
        $('.menu-item').removeClass('active');
        $(this).addClass('active');
        
        // Show the selected tab
        $('.tab-content').removeClass('active');
        $('#' + tabId).addClass('active');
        
        activeTab = tabId;
    });
    
    // Start event button click handler for featured event
    $(document).on('click', '.start-event-button', function() {
        const eventId = $(this).data('event');
        startEvent(eventId);
    });
    
    // Search events functionality
    $('#event-search').on('input', function() {
        filterEvents();
    });
    
    // Filter events dropdown change
    $('#event-filter').change(function() {
        filterEvents();
    });
    
    // Close tablet when ESC key is pressed
    $(document).keyup(function(e) {
        if (e.key === "Escape") {
            closeTablet();
        }
    });
    
    // Blackmarket Functionality
    
    // Filtrar itens da Blackmarket
    $('#item-search').on('input', function() {
        filterMarketItems();
    });
    
    // Filtrar por categoria
    $('#category-filter').change(function() {
        filterMarketItems();
    });
    
    // Abrir modal ao clicar em comprar
    $(document).on('click', '.buy-item-btn', function() {
        const itemName = $(this).closest('.market-item').find('h3').text();
        const itemId = $(this).data('item');
        const price = $(this).data('price');
        const currency = $(this).data('currency');
        
        // Armazenar dados do item atual
        currentItemData = {
            id: itemId,
            name: itemName,
            price: price,
            currency: currency
        };
        
        // Atualizar o modal com informações do item
        $('#modal-item-name').text(itemName);
        
        // Definir o ícone da moeda com base na currency
        let currencyIcon = '';
        if (currency === 'kryon') {
            currencyIcon = '<i class="fas fa-gem" style="color: #3498db;"></i>';
        } else if (currency === 'vexel') {
            currencyIcon = '<i class="fas fa-bolt" style="color: #2ecc71;"></i>';
        } else if (currency === 'zynther') {
            currencyIcon = '<i class="fas fa-fire" style="color: #e74c3c;"></i>';
        }
        
        $('#modal-item-price').html(`${currencyIcon} ${price} ${currency.charAt(0).toUpperCase() + currency.slice(1)}`);
        
        // Exibir o modal
        $('#purchase-modal').css('display', 'flex');
    });
    
    // Fechar modal
    $('.close-modal, #cancel-purchase').click(function() {
        $('#purchase-modal').css('display', 'none');
    });
    
    // Confirmar compra
    $('#confirm-purchase').click(function() {
        if (currentItemData) {
            // Verificar se o jogador tem saldo suficiente
            const playerCurrency = getPlayerVeniceAmount(currentItemData.currency);
            
            if (playerCurrency >= currentItemData.price) {
                // Enviar para o servidor a requisição de compra
                $.post('https://qb-tablet/buyMarketItem', JSON.stringify({
                    itemId: currentItemData.id,
                    price: currentItemData.price,
                    currency: currentItemData.currency
                }));
                
                // Fechar o modal
                $('#purchase-modal').css('display', 'none');
            } else {
                // Mostrar erro de saldo insuficiente
                showNotification('Saldo insuficiente para esta compra!', 'error');
                $('#purchase-modal').css('display', 'none');
            }
        }
    });
    
    // Fechar modal ao clicar fora dele
    $(window).click(function(event) {
        if (event.target == document.getElementById('purchase-modal')) {
            $('#purchase-modal').css('display', 'none');
        }
    });
});

// Update clock display
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    
    // Add leading zeros
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    $('#current-time').text(`${hours}:${minutes}`);
}

// Close the tablet
function closeTablet() {
    $('#tablet').addClass('hidden');
    
    // Clear interval for clock
    if (clockInterval) {
        clearInterval(clockInterval);
    }
    
    // Send NUI message to close tablet in client
    $.post('https://qb-tablet/closeTablet', JSON.stringify({}));
}

// Update venices display
function updateVenicesDisplay(venices) {
    $('#kryon-amount').text(venices.kryon || 0);
    $('#vexel-amount').text(venices.vexel || 0);
    $('#zynther-amount').text(venices.zynther || 0);
    
    // Update total
    $('#total-venices').text(calculateTotalVenices(venices));
}

// Calculate total venices (weighted sum)
function calculateTotalVenices(venices) {
    // Weighted calculation (example: zynther is worth more than kryon)
    return (venices.kryon || 0) + (venices.vexel || 0) * 5 + (venices.zynther || 0) * 20;
}

// Setup events list
function setupEventsList(events) {
    const eventsList = $('#events-list');
    eventsList.empty();
    
    if (events.length === 0) {
        eventsList.html('<p class="no-events">Nenhum evento disponível no momento.</p>');
        return;
    }
    
    events.forEach((event, index) => {
        const eventCard = createEventCard(event, index);
        eventsList.append(eventCard);
    });
}

// Create event card HTML - MODIFICADO: Removida checagem de requisitos
function createEventCard(event, index) {
    // Sempre retorna true, ignorando requisitos
    const canStart = true;
    
    let requirementsHtml = '';
    if (event.requirements && event.requirements.venices) {
        Object.entries(event.requirements.venices).forEach(([currency, amount]) => {
            // Sempre mostra como atendido
            const isMet = true;
            
            requirementsHtml += `
            <div class="requirement ${isMet ? 'met' : ''}">
                <i class="fas ${isMet ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                <span>${amount} ${currency}</span>
            </div>`;
        });
    }
    
    return `
    <div class="event-card">
        <div class="event-card-header">
            <i class="${event.icon || 'fas fa-calendar-alt'}"></i>
            <h4>${event.name}</h4>
        </div>
        <div class="event-card-body">
            <div class="event-description">${event.description}</div>
            <div class="event-requirements">
                ${requirementsHtml}
            </div>
        </div>
        <div class="event-card-footer">
            <button class="start-event-button" data-event="${event.id}">
                Iniciar
            </button>
        </div>
    </div>`;
}

// Check if player meets event requirements - MODIFICADO: Sempre retorna true
function checkEventRequirements(requirements) {
    return true; // Sempre retorna true, ignorando todos os requisitos
}

// Get player's venice amount for a specific currency
function getPlayerVeniceAmount(currency) {
    if (!playerData || !playerData.venices) return 0;
    return playerData.venices[currency] || 0;
}

// Set featured event (random or based on criteria)
function setFeaturedEvent() {
    if (eventsData.length === 0) {
        $('#featured-event-card').html('<p>Nenhum evento disponível</p>');
        return;
    }
    
    // Sempre pega o primeiro evento
    let featuredEvent = eventsData[0];
    
    $('#featured-event-name').text(featuredEvent.name);
    $('#featured-event-desc').text(featuredEvent.description);
    $('.featured-event-card .event-icon i').attr('class', featuredEvent.icon || 'fas fa-star');
    $('.featured-event-card .start-event-button').data('event', featuredEvent.id);
    
    // Botão sempre habilitado
    $('.featured-event-card .start-event-button').prop('disabled', false).text('Iniciar');
}

// Filter events based on search and filter
function filterEvents() {
    const searchTerm = $('#event-search').val().toLowerCase();
    const filterType = $('#event-filter').val();
    
    // Filter events
    const filteredEvents = eventsData.filter(event => {
        // Filter by search term
        const matchesSearch = event.name.toLowerCase().includes(searchTerm) || 
                             event.description.toLowerCase().includes(searchTerm);
        
        // Ignorar filtro de disponibilidade - todos eventos estão disponíveis
        if (filterType === 'locked') return false; // Não tem eventos bloqueados
        
        return matchesSearch;
    });
    
    // Re-render events list
    const eventsList = $('#events-list');
    eventsList.empty();
    
    if (filteredEvents.length === 0) {
        eventsList.html('<p class="no-events">Nenhum evento encontrado.</p>');
        return;
    }
    
    filteredEvents.forEach((event, index) => {
        const eventCard = createEventCard(event, index);
        eventsList.append(eventCard);
    });
}

// Start event function
function startEvent(eventId) {
    $.post('https://qb-tablet/startEvent', JSON.stringify({
        eventId: eventId
    }));
    
    // Optional: Close tablet after starting event
    closeTablet();
}

// Função para filtrar itens da Blackmarket
function filterMarketItems() {
    const searchTerm = $('#item-search').val().toLowerCase();
    const category = $('#category-filter').val();
    
    $('.market-item').each(function() {
        const itemName = $(this).find('h3').text().toLowerCase();
        const itemDesc = $(this).find('p').text().toLowerCase();
        const itemCategory = $(this).data('category');
        
        const matchesSearch = itemName.includes(searchTerm) || itemDesc.includes(searchTerm);
        const matchesCategory = category === 'all' || itemCategory === category;
        
        if (matchesSearch && matchesCategory) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

// Função para mostrar notificações na interface
function showNotification(message, type = 'info') {
    const notificationDiv = $('<div class="notification"></div>');
    notificationDiv.addClass(type);
    notificationDiv.text(message);
    
    $('body').append(notificationDiv);
    
    // Animar entrada
    setTimeout(() => {
        notificationDiv.addClass('show');
        
        // Remover após alguns segundos
        setTimeout(() => {
            notificationDiv.removeClass('show');
            setTimeout(() => {
                notificationDiv.remove();
            }, 300);
        }, 3000);
    }, 10);
}
