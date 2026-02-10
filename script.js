/* =====================
   DATOS INICIALES
   ===================== */

// Productos iniciales
let products = [
    {
        id: 1,
        name: "Collar de Oro",
        description: "Collar elegante de oro con diseño minimalista",
        price: 45.99,
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop",
        status: "disponible"
    },
    {
        id: 2,
        name: "Pulsera de Perlas",
        description: "Pulsera delicada con perlas naturales",
        price: 35.99,
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop",
        status: "disponible"
    },
    {
        id: 3,
        name: "Anillo de Cristal",
        description: "Anillo brillante con cristal Swarovski",
        price: 28.99,
        image: "https://images.unsplash.com/photo-1599643478606-20142a370890?w=300&h=300&fit=crop",
        status: "disponible"
    },
    {
        id: 4,
        name: "Pendientes de Diamante",
        description: "Pendientes elegantes con piedras brillantes",
        price: 52.99,
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop",
        status: "disponible"
    },
    {
        id: 5,
        name: "Brazalete de Oro Rosado",
        description: "Brazalete grueso de oro rosado",
        price: 62.99,
        image: "https://images.unsplash.com/photo-1515562141207-6c703ac40628?w=300&h=300&fit=crop",
        status: "disponible"
    },
    {
        id: 6,
        name: "Reloj Dorado",
        description: "Reloj elegante con correa de cuero",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=300&h=300&fit=crop",
        status: "disponible"
    }
];

let cart = [];
let orders = [];
let isAdminLoggedIn = false;
let nextProductId = 7;

// Respuestas del chatbot
const chatbotResponses = {
    "hola": "¡Hola! Bienvenido a Arena Roja. ¿En qué puedo ayudarte?",
    "precio": "Nuestros productos varían en precio. El más económico es $28.99 y tenemos opciones hasta $89.99",
    "envío": "Realizamos envíos a nivel nacional en 3-5 días hábiles.",
    "pago": "Aceptamos Transferencia Bancaria y Pago Móvil.",
    "devolución": "Aceptamos devoluciones dentro de 7 días del recibimiento.",
    "contacto": "Puedes contactarnos por WhatsApp, Instagram o TikTok.",
    "ayuda": "Puedo ayudarte con información sobre productos, precios, envíos y más.",
    "default": "No entendí tu pregunta. ¿Puedo ayudarte con algo más?"
};

/* =====================
   INICIALIZACIÓN
   ===================== */

document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromStorage();
    loadCartFromStorage();
    loadOrdersFromStorage();
    renderProducts();
    updateCartUI();
    initializeEventListeners();
    loadChatHistory();
});

function initializeEventListeners() {
    // Carrito
    document.getElementById('cartCount').addEventListener('click', () => scrollToSection('carrito'));
    document.getElementById('adminBtn').addEventListener('click', openAdminModal);
    
    // Formulario de compra
    document.getElementById('checkoutForm').addEventListener('submit', submitCheckout);
    
    // Formulario de producto (Admin)
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', addProduct);
    }
    
    // Login (Admin)
    document.getElementById('loginForm').addEventListener('submit', handleAdminLogin);
    
    // Búsqueda y filtros
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('filterPrice').addEventListener('change', filterProducts);
    
    // Chatbot
    document.getElementById('userMessage').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Método de pago
    document.getElementById('paymentMethod').addEventListener('change', function() {
        const bankDetails = document.getElementById('bankDetails');
        bankDetails.style.display = this.value === 'transferencia' ? 'block' : 'none';
    });
}

/* =====================
   GESTIÓN DE PRODUCTOS
   ===================== */

function renderProducts(productsToRender = products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    
    productsToRender.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const isAvailable = product.status === 'disponible';
    
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x300?text=Imagen+no+disponible'">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <span class="product-status status-${product.status}">${product.status === 'disponible' ? '✓ Disponible' : '✗ Agotado'}</span>
            <button onclick="addToCart(${product.id})" ${!isAvailable ? 'disabled' : ''}>
                ${isAvailable ? 'Agregar al Carrito' : 'Agotado'}
            </button>
        </div>
    `;
    
    card.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            showProductDetails(product);
        }
    });
    
    return card;
}

function showProductDetails(product) {
    const modal = document.getElementById('productModal');
    const details = document.getElementById('productDetails');
    
    details.innerHTML = `
        <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 5px; margin-bottom: 20px;" onerror="this.src='https://via.placeholder.com/400x400?text=Imagen+no+disponible'">
        <h2>${product.name}</h2>
        <p style="color: #666; margin: 15px 0;">${product.description}</p>
        <p style="font-size: 24px; color: var(--color-primary); font-weight: bold; margin: 15px 0;">$${product.price.toFixed(2)}</p>
        <p style="margin-bottom: 20px;">
            <span class="product-status status-${product.status}">${product.status === 'disponible' ? '✓ Disponible' : '✗ Agotado'}</span>
        </p>
        <button class="btn btn-primary" onclick="addToCart(${product.id}); closeModal('productModal')" ${product.status !== 'disponible' ? 'disabled' : ''}>
            Agregar al Carrito
        </button>
    `;
    
    modal.style.display = 'flex';
}

function filterProducts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const priceFilter = document.getElementById('filterPrice').value;
    
    let filtered = products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
    );
    
    if (priceFilter === 'asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (priceFilter === 'desc') {
        filtered.sort((a, b) => b.price - a.price);
    }
    
    renderProducts(filtered);
}

/* =====================
   CARRITO DE COMPRAS
   ===================== */

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product || product.status === 'agotado') {
        alert('Este producto no está disponible');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartUI();
    alert(`${product.name} agregado al carrito`);
}

function updateCartUI() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartBadge = document.getElementById('cartBadge');
    
    cartBadge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">El carrito está vacío</p>';
        updateCartTotal();
        return;
    }
    
    cartItemsDiv.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <p class="cart-item-name">${item.name}</p>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="changeQuantity(${item.id}, -1)" style="width: 30px; height: 30px; background: #ddd; border: none; border-radius: 3px; cursor: pointer;">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="changeQuantity(${item.id}, this.value - ${item.quantity})">
                <button onclick="changeQuantity(${item.id}, 1)" style="width: 30px; height: 30px; background: #ddd; border: none; border-radius: 3px; cursor: pointer;">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
    
    updateCartTotal();
}

function changeQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += parseInt(delta);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCartToStorage();
            updateCartUI();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
}

function updateCartTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function goToCheckout() {
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    document.getElementById('carrito').style.display = 'none';
    document.getElementById('checkout').style.display = 'block';
    scrollToSection('checkout');
}

function goBackToCart() {
    document.getElementById('checkout').style.display = 'none';
    document.getElementById('carrito').style.display = 'block';
    scrollToSection('carrito');
}

function submitCheckout(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.16,
        date: new Date().toLocaleDateString('es-ES'),
        orderNumber: generateOrderNumber()
    };
    
    orders.push(formData);
    saveOrdersToStorage();
    
    // Mostrar confirmación
    document.getElementById('checkout').style.display = 'none';
    document.getElementById('orderConfirmation').style.display = 'block';
    
    document.getElementById('orderNumber').textContent = formData.orderNumber;
    document.getElementById('orderName').textContent = formData.name;
    document.getElementById('orderEmail').textContent = formData.email;
    document.getElementById('orderTotal').textContent = `$${formData.total.toFixed(2)}`;
    document.getElementById('orderDate').textContent = formData.date;
    
    cart = [];
    saveCartToStorage();
    updateCartUI();
    
    scrollToSection('orderConfirmation');
}

function generateOrderNumber() {
    return 'ORD-' + Date.now();
}

function goHome() {
    document.getElementById('orderConfirmation').style.display = 'none';
    document.getElementById('carrito').style.display = 'block';
    scrollToSection('inicio');
}

/* =====================
   PANEL DE ADMINISTRACIÓN
   ===================== */

function openAdminModal() {
    document.getElementById('adminModal').style.display = 'flex';
    switchTab('login');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function switchTab(tabName) {
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === 'admin' && password === 'admin123') {
        isAdminLoggedIn = true;
        document.getElementById('loginTab').style.display = 'none';
        document.getElementById('panelTab').style.display = 'block';
        document.getElementById('adminTabBtn').style.display = 'block';
        
        document.querySelectorAll('.tab-btn')[0].style.display = 'none';
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        
        switchAdminTab('products');
        loadAdminProductsList();
    } else {
        alert('Usuario o contraseña incorrectos. Intenta con admin/admin123');
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    document.getElementById('adminModal').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('loginTab').style.display = 'block';
    document.getElementById('panelTab').style.display = 'none';
    document.getElementById('adminTabBtn').style.display = 'block';
    document.querySelectorAll('.tab-btn')[0].style.display = 'block';
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
    
    if (tabName === 'products') {
        document.getElementById('productsTab').classList.add('active');
        loadAdminProductsList();
    } else if (tabName === 'orders') {
        document.getElementById('ordersTab').classList.add('active');
        loadOrdersList();
    }
}

function addProduct(e) {
    e.preventDefault();
    
    const newProduct = {
        id: nextProductId++,
        name: document.getElementById('productName').value,
        description: document.getElementById('productDesc').value,
        price: parseFloat(document.getElementById('productPrice').value),
        image: document.getElementById('productImage').value || 'https://via.placeholder.com/300x300?text=Producto',
        status: document.getElementById('productStatus').value
    };
    
    products.push(newProduct);
    saveProductsToStorage();
    
    document.getElementById('productForm').reset();
    renderProducts();
    loadAdminProductsList();
    alert('Producto agregado exitosamente');
}

function loadAdminProductsList() {
    const list = document.getElementById('adminProductsList');
    list.innerHTML = products.map(product => `
        <div class="admin-product-item">
            <div class="admin-product-info">
                <p><strong>${product.name}</strong></p>
                <p>Precio: $${product.price.toFixed(2)}</p>
                <p>Estado: ${product.status}</p>
            </div>
            <div class="admin-product-buttons">
                <button class="edit-btn" onclick="editProduct(${product.id})">Editar</button>
                <button class="delete-btn" onclick="deleteProduct(${product.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const newName = prompt('Nuevo nombre:', product.name);
        if (newName) product.name = newName;
        
        const newPrice = prompt('Nuevo precio:', product.price);
        if (newPrice) product.price = parseFloat(newPrice);
        
        const newStatus = prompt('Estado (disponible/agotado):', product.status);
        if (newStatus) product.status = newStatus;
        
        saveProductsToStorage();
        renderProducts();
        loadAdminProductsList();
        alert('Producto actualizado');
    }
}

function deleteProduct(productId) {
    if (confirm('¿Eliminar este producto?')) {
        products = products.filter(p => p.id !== productId);
        saveProductsToStorage();
        renderProducts();
        loadAdminProductsList();
        alert('Producto eliminado');
    }
}

function loadOrdersList() {
    const list = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999;">No hay pedidos realizados</p>';
        return;
    }
    
    list.innerHTML = orders.map((order, index) => `
        <div class="order-item">
            <p><strong>Pedido #${index + 1}</strong></p>
            <p><strong>Número de Orden:</strong> ${order.orderNumber}</p>
            <p><strong>Cliente:</strong> ${order.name}</p>
            <p><strong>Email:</strong> ${order.email}</p>
            <p><strong>Teléfono:</strong> ${order.phone}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            <p><strong>Fecha:</strong> ${order.date}</p>
            <p><strong>Método de Pago:</strong> ${order.paymentMethod === 'transferencia' ? 'Transferencia' : 'Pago Móvil'}</p>
            <p><strong>Productos:</strong> ${order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</p>
        </div>
    `).join('');
}

/* =====================
   CHATBOT
   ===================== */

function toggleChatbot() {
    const body = document.getElementById('chatbotBody');
    body.style.display = body.style.display === 'none' ? 'flex' : 'none';
}

function sendMessage() {
    const input = document.getElementById('userMessage');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessageToChat(message, 'user');
    input.value = '';
    
    // Respuesta del bot
    setTimeout(() => {
        const response = getBotResponse(message);
        addMessageToChat(response, 'bot');
    }, 500);
    
    saveChatHistory();
}

function addMessageToChat(message, sender) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${sender}-message`;
    messageEl.textContent = message;
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function getBotResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    
    for (const key in chatbotResponses) {
        if (msg.includes(key)) {
            return chatbotResponses[key];
        }
    }
    
    return chatbotResponses['default'];
}

function saveChatHistory() {
    const messages = Array.from(document.querySelectorAll('.chat-message')).map(el => ({
        text: el.textContent,
        sender: el.className.includes('user') ? 'user' : 'bot'
    }));
    localStorage.setItem('chatHistory', JSON.stringify(messages));
}

function loadChatHistory() {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.innerHTML = '';
    
    history.forEach(msg => {
        addMessageToChat(msg.text, msg.sender);
    });
}

/* =====================
   STORAGE (LocalStorage)
   ===================== */

function saveProductsToStorage() {
    localStorage.setItem('products', JSON.stringify(products));
}

function loadProductsFromStorage() {
    const stored = localStorage.getItem('products');
    if (stored) {
        products = JSON.parse(stored);
        nextProductId = Math.max(...products.map(p => p.id)) + 1;
    }
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const stored = localStorage.getItem('cart');
    if (stored) {
        cart = JSON.parse(stored);
    }
}

function saveOrdersToStorage() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

function loadOrdersFromStorage() {
    const stored = localStorage.getItem('orders');
    if (stored) {
        orders = JSON.parse(stored);
    }
}

/* =====================
   UTILIDADES
   ===================== */

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Cerrar modales al hacer clic fuera
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
