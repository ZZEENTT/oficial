const usuarios = [
    { usuario: "admin", senha: "admin123", nome: "Administrador" },
    { usuario: "usuario", senha: "user123", nome: "Usuário Padrão" },
    { usuario: "zeentt", senha: "zeentt2023", nome: "Zeentt Team" },
    { usuario: "msilva", senha: "1234", nome: "Administrador" },
    { usuario: "wsantana", senha: "654321", nome: "Administrador" }
];

// LOGIN
function fazerLogin(evento) {
    evento.preventDefault();

    const usuarioDigitado = document.getElementById("username").value;
    const senhaDigitada = document.getElementById("password").value;

    if (!usuarioDigitado || !senhaDigitada) {
        exibirMensagem("Preencha todos os campos!", "erro");
        return;
    }

    const usuarioEncontrado = usuarios.find(user => user.usuario === usuarioDigitado && user.senha === senhaDigitada);

    if (usuarioEncontrado) {
        salvarSessao(usuarioEncontrado);
        // Limpa o flag de mensagem de boas-vindas para que ela apareça na próxima página
        sessionStorage.removeItem('welcomeMessageShown');
        // Define um flag para indicar que o login acabou de ser feito
        sessionStorage.setItem('justLoggedIn', 'true'); // MODIFICAÇÃO: Adicionado flag
        window.location.href = "menu.html";
    } else {
        exibirMensagem("Usuário ou senha incorretos!", "erro");
        const passwordField = document.getElementById("password");
        if (passwordField) {
            passwordField.value = "";
        }
    }
}

function salvarSessao(usuario) {
    const sessionId = crypto.randomUUID();
    const agora = new Date().getTime();
    
    localStorage.clear();
    sessionStorage.clear();
    
    localStorage.setItem("sessionId", sessionId);
    
    const dadosSessao = {
        usuario: usuario.usuario,
        nome: usuario.nome,
        dataLogin: new Date().toISOString(),
        ultimoAcesso: agora,
        ativo: true,
        sessionId: sessionId
    };
    sessionStorage.setItem("dadosSessao", JSON.stringify(dadosSessao));
}

function verificarSessao() {
    const sessionId = localStorage.getItem("sessionId");
    const sessaoSessionJSON = sessionStorage.getItem("dadosSessao");

    if (!sessionId || !sessaoSessionJSON) {
        fazerLogoff();
        return;
    }

    const sessaoSession = JSON.parse(sessaoSessionJSON);

    if (sessionId !== sessaoSession.sessionId) {
        fazerLogoff();
        return;
    }
    
    const agora = new Date().getTime();
    const tempoInativo = agora - sessaoSession.ultimoAcesso;

    if (tempoInativo > 1800000) { // 30 minutos
        fazerLogoff();
    } else {
        sessaoSession.ultimoAcesso = agora;
        sessionStorage.setItem("dadosSessao", JSON.stringify(sessaoSession));
    }
}

if (typeof setInterval !== 'undefined') {
    setInterval(verificarSessao, 60000);
}

function fazerLogoff() {
    localStorage.clear();
    sessionStorage.clear();
    // Se não estiver na página de login, redireciona para ela
    if (window.location.pathname.indexOf("login.html") === -1) {
        window.location.href = "login.html";
    }
}

function exibirMensagem(texto, tipo) {
    let mensagemEl = document.querySelector(".mensagem-feedback-geral"); // Usando uma classe diferente para não conflitar

    if (!mensagemEl) {
        mensagemEl = document.createElement("div");
        mensagemEl.className = "mensagem-feedback-geral"; // Classe para estilização
        // Tenta adicionar ao .container, senão ao body, idealmente teria um local específico
        const containerPrincipal = document.querySelector(".container") || document.body;  //
        if (containerPrincipal) {
             // Adiciona no início do container ou body para melhor visibilidade
            containerPrincipal.insertBefore(mensagemEl, containerPrincipal.firstChild);
        }
    }

    // Estilo aplicado via JS para garantir que apareça (pode ser movido para CSS)
    mensagemEl.style.backgroundColor = tipo === "erro" ? "#f44336" : "#4CAF50";
    mensagemEl.style.color = "white";
    mensagemEl.style.padding = "10px";
    mensagemEl.style.marginTop = (document.querySelector(".container")) ? "0" : "10px"; // Ajusta margin se não for no container
    mensagemEl.style.marginBottom = "10px";
    mensagemEl.style.borderRadius = "5px";
    mensagemEl.style.textAlign = "center";
    mensagemEl.style.position = (document.querySelector(".container")) ? "relative" : "fixed"; // Posição fixa se fora do container
    mensagemEl.style.top = (document.querySelector(".container")) ? "auto" : "20px";
    mensagemEl.style.left = (document.querySelector(".container")) ? "auto" : "50%";
    mensagemEl.style.transform = (document.querySelector(".container")) ? "none" : "translateX(-50%)";
    mensagemEl.style.zIndex = "10001"; // Z-index alto
    mensagemEl.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    
    mensagemEl.textContent = texto;

    setTimeout(() => {
        if (mensagemEl && mensagemEl.parentNode) {
            mensagemEl.remove();
        }
    }, 3000);
}

// NOVA FUNÇÃO: Exibir mensagem de boas-vindas
function exibirMensagemBoasVindas() {
    const dadosSessaoJSON = sessionStorage.getItem("dadosSessao");
    const welcomeMessageShown = sessionStorage.getItem('welcomeMessageShown');

    // Só mostra se estiver logado e se a mensagem ainda não foi exibida nesta sessão
    if (dadosSessaoJSON && !welcomeMessageShown) {
        const dadosSessao = JSON.parse(dadosSessaoJSON);
        if (dadosSessao.nome) {
            const container = document.getElementById('welcome-message-container');
            const messageDiv = document.getElementById('welcome-message-text'); // Elemento específico para o texto

            if (container && messageDiv) {
                messageDiv.textContent = `Bem-vindo(a) de volta, ${dadosSessao.nome}!`;
                container.style.display = 'block'; // Garante que o container está visível
                container.classList.add('welcome-message-show');

                sessionStorage.setItem('welcomeMessageShown', 'true'); // Marca que a mensagem foi exibida

                setTimeout(() => {
                    container.classList.remove('welcome-message-show');
                    container.classList.add('welcome-message-hide');
                    // Após a animação de saída, esconde o elemento completamente
                    setTimeout(() => {
                        if (container) { // Verifica se o container ainda existe
                           container.style.display = 'none';
                           container.classList.remove('welcome-message-hide');
                        }
                    }, 500); // Duração da animação de fadeOutUpWelcome
                }, 4000); // Tempo que a mensagem fica visível (4 segundos)
            }
        }
    }
}


////////////////////////////////////// MENU (Geralmente em menu.html ou páginas com lista de menu)
function loadMenu() {
    const menuList = document.getElementById("menuList");
    if (!menuList) return; 

    const menu = JSON.parse(localStorage.getItem("menu")) || [];
    menuList.innerHTML = "";
    menu.forEach((item, index) => {
        const li = document.createElement("li");
        li.classList.add("item");
        li.innerHTML = `${item.name} - R$ ${item.price.toFixed(2)} <button class='delete' onclick='deleteItem(${index})'>X</button>`;
        li.onclick = () => selecionarItem(li);
        menuList.appendChild(li);
    });
}

function addItem() {
    const nameInput = document.getElementById("itemName");
    const priceInput = document.getElementById("itemPrice");

    if (!nameInput || !priceInput) return; 

    const name = nameInput.value;
    const price = parseFloat(priceInput.value);

    if (name && !isNaN(price)) {  //
        const menu = JSON.parse(localStorage.getItem("menu")) || [];
        menu.push({ name, price });
        localStorage.setItem("menu", JSON.stringify(menu));
        loadMenu();  //
        nameInput.value = '';  //
        priceInput.value = '';
    } else {
        alert("Por favor, insira nome e preço válidos.");
    }
}

function deleteItem(index) {
    const menu = JSON.parse(localStorage.getItem("menu")) || [];
    menu.splice(index, 1);
    localStorage.setItem("menu", JSON.stringify(menu));
    loadMenu();
}

function selecionarItem(item) {
    const items = document.querySelectorAll('#menuList .item');  //
    if (items) {
        items.forEach(i => i.classList.remove('selected'));
    }
    if (item) {
        item.classList.add('selected');
    }
}

function toggleMenu() { 
    const menu = document.querySelector('.sidebar'); // ou #sidebar se for ID
    const overlay = document.getElementById('sidebar-overlay');  //
    if (menu) {
        menu.classList.toggle("active");  //
    }
    if (overlay) {
        overlay.classList.toggle("active");  //
        if (menu && menu.classList.contains('active')) { //
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }
}

//////////////////////////////////////// PEDIDOS (Geralmente em pedido.html ou páginas com lista de pedidos)
function loadOrders() {
    const list = document.querySelector(".list");  //
    if (!list) return;

    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    list.innerHTML = "";
    savedOrders.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${item.quantity} x</span><span>${item.name}</span> <span>R$ ${(item.quantity * item.price).toFixed(2)}</span> <button class="delete" data-index="${index}" onclick="removeOrder(${index})">x</button>`;
        list.appendChild(li);
    });
    updateSummary();
}

function removeOrder(index) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.splice(index, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();  //
}

function updateSummary() {
    const totalPriceEl = document.getElementById("total-price");
    const totalItemsEl = document.getElementById("total-items");

    if (!totalPriceEl || !totalItemsEl) return;

    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];

    const totalPrice = savedOrders.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const totalItems = savedOrders.reduce((sum, item) => sum + parseInt(item.quantity, 10), 0);  //

    totalPriceEl.textContent = `R$ ${totalPrice.toFixed(2)}`;
    totalItemsEl.textContent = totalItems;
}

//////////////////////////////////////// LÓGICA DO CARDÁPIO INTERATIVO (Geralmente em cardapio.html)
let carrinho = [];  //

function updateCardapioTotal() {
    let totalCardapio = 0;
    const itemElementsCardapio = document.querySelectorAll("#menuList .item input[type='checkbox']");  //
    if (itemElementsCardapio && itemElementsCardapio.length > 0) { //
        itemElementsCardapio.forEach((checkbox) => {
            if (checkbox.checked) { //
                const itemEl = checkbox.closest(".item");  //
                if (itemEl) {
                    const priceAttr = itemEl.getAttribute("data-price"); //
                    if (priceAttr) {
                        const price = parseFloat(priceAttr); //
                        if (!isNaN(price)) {
                            totalCardapio += price;
                        }
                    }
                }
            }
        });
    }
    const totalElementCardapio = document.getElementById("total");  //
    if (totalElementCardapio) {
        totalElementCardapio.textContent = totalCardapio.toFixed(2); //
    }
}

window.showModal = function (element) {
    const item = element.closest(".item");  //
    if (!item) {
        console.error("Elemento .item não encontrado para o modal.");
        return;
    }

    const title = item.getAttribute("data-title") || item.querySelector('.item-title')?.textContent || "Detalhes do Item";
    const desc = item.getAttribute("data-description") || item.querySelector('p:not(.item-price)')?.textContent || "Sem descrição.";
    const priceText = item.getAttribute("data-price") || item.querySelector('.item-price')?.textContent.replace(/[^0-9.,]/g, '').replace(',', '.');
    const price = priceText ? parseFloat(priceText).toFixed(2) : "N/A";
    const img = item.getAttribute("data-img") || item.querySelector('img')?.src || "";

    const modalDetailsEl = document.getElementById("modalDetails");
    if (modalDetailsEl) {
        modalDetailsEl.innerHTML = `
          <h2 class="text-xl font-semibold mb-2">${title}</h2>
          <img src="${img}" alt="${title}" style="width: 100%; max-height: 200px; object-contain; border-radius: 8px; margin-bottom: 10px;">
          <p class="text-sm text-gray-600 mb-2">${desc}</p>
          <p class="text-lg font-bold text-blue-600"><strong>Preço:</strong> R$ ${price}</p>
        `;
    }
  
    const modalEl = document.getElementById("modal");
    if (modalEl) {
        modalEl.style.display = "flex";
    }
};
  
window.closeModal = function () {
  const modalEl = document.getElementById("modal");
  if (modalEl) {
    modalEl.style.display = "none";
  }
};

function adicionarItemAoCarrinho(itemDetails) {
    const itemExistente = carrinho.find(item => item.title === itemDetails.title);
    if (itemExistente) {
        itemExistente.quantity = (itemExistente.quantity || 1) + 1;
    } else {
        carrinho.push({ ...itemDetails, quantity: 1 });
    }
    atualizarCarrinhoVisual();
}

window.adicionarSelecionadosAoPedido = function () {
    // Este seletor busca por checkboxes dentro de elementos .item na lista com ID #menuList
    // Se a sua página de cardápio usa uma estrutura diferente, ajuste este seletor.
    const itemElementsCardapio = document.querySelectorAll("#menuList .item");  //
    let itensAdicionados = 0;

    if (itemElementsCardapio && itemElementsCardapio.length > 0) { //
        itemElementsCardapio.forEach((itemEl) => {
            const checkbox = itemEl.querySelector("input[type='checkbox']"); //
            if (checkbox && checkbox.checked) { //
                const title = itemEl.getAttribute("data-title") || itemEl.querySelector('.item-title')?.textContent; //
                const priceAttr = itemEl.getAttribute("data-price") || itemEl.querySelector('.item-price')?.textContent.replace(/[^0-9.,]/g, '').replace(',', '.'); //
                const price = priceAttr ? parseFloat(priceAttr) : 0; //
                const img = itemEl.getAttribute("data-img") || itemEl.querySelector('img')?.src; //
                const description = itemEl.getAttribute("data-description") || itemEl.querySelector('p:not(.item-price)')?.textContent; //

                if (title && !isNaN(price)) { //
                    adicionarItemAoCarrinho({ title, price, img, description }); // Adiciona ao carrinho global
                    itensAdicionados++;
                }
                checkbox.checked = false;  //
            }
        });
    }

    if (itensAdicionados > 0) {
        // alert(itensAdicionados + " item(ns) adicionado(s) ao carrinho!");
        const cartCountEl = document.getElementById('cart-count'); //
        if(cartCountEl) cartCountEl.classList.add('animate__animated', 'animate__heartBeat'); // Animação no ícone do carrinho
        setTimeout(() => {
            if(cartCountEl) cartCountEl.classList.remove('animate__animated', 'animate__heartBeat'); //
        }, 1000);
    } else {
        // alert("Nenhum item selecionado para adicionar.");
    }
    updateCardapioTotal();  //
};

function toggleCarrinho() {
  const carrinhoLateral = document.getElementById('carrinho-lateral');
  const overlay = document.getElementById('carrinho-overlay');
  if (carrinhoLateral && overlay) { //
    carrinhoLateral.classList.toggle('open');
    overlay.classList.toggle('show');  //
    if (carrinhoLateral.classList.contains('open')) { //
        document.body.style.overflow = 'hidden';  //
    } else {
        document.body.style.overflow = 'auto'; //
    }
    atualizarCarrinhoVisual();
  }
}

function atualizarCarrinhoVisual() {
    const lista = document.getElementById('carrinho-itens');
    const totalSpan = document.getElementById('carrinho-total');
    const countSpan = document.getElementById('cart-count');

    if (!lista || !totalSpan || !countSpan) {
        return;
    }

    lista.innerHTML = '';  //
    let totalValorCarrinho = 0;
    let totalItensCarrinho = 0;

    if (carrinho.length === 0) { //
        lista.innerHTML = '<li class="text-center text-gray-500 py-4">Seu carrinho está vazio.</li>';
    } else {
        carrinho.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center py-2 px-1 border-b border-gray-200';
            li.innerHTML = `
                <div class="flex-grow pr-2">
                    <span class="font-semibold text-sm">${item.title}</span>
                    <span class="text-xs text-gray-600 block">Qtd: ${item.quantity}</span>
                </div>
                <span class="font-semibold text-sm_ whitespace-nowrap">R$ ${(item.price * item.quantity).toFixed(2)}</span>
                <button class="ml-2 text-red-500 hover:text-red-700 text-xs p-1" onclick="removerItemDoCarrinho(${index})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            lista.appendChild(li);
            totalValorCarrinho += item.price * item.quantity;
            totalItensCarrinho += item.quantity;
        });
    }

    totalSpan.innerText = totalValorCarrinho.toFixed(2);
    countSpan.innerText = totalItensCarrinho;
}

function removerItemDoCarrinho(index) {
    if (carrinho[index]) { //
        if (carrinho[index].quantity > 1) { //
            carrinho[index].quantity--; //
        } else {
            carrinho.splice(index, 1); //
        }
        atualizarCarrinhoVisual();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // MODIFICAÇÃO: Lógica de login forçado movida para o início e condicionada
    if (window.location.pathname.indexOf("login.html") === -1) { // Se não estiver na página de login
        const justLoggedIn = sessionStorage.getItem('justLoggedIn');
        if (justLoggedIn === 'true') {
            // Se o usuário acabou de fazer login, remove o flag e continua normalmente
            sessionStorage.removeItem('justLoggedIn');
            verificarSessao(); // Verifica a sessão (deve estar válida)
            exibirMensagemBoasVindas(); // Mostra a mensagem de boas-vindas
        } else {
            // Se NÃO acabou de fazer login (ex: acesso direto à URL, recarregou a página, reabriu aba)
            // força o logoff.
            fazerLogoff(); //
            // Não é necessário chamar verificarSessao() ou exibirMensagemBoasVindas() aqui,
            // pois o usuário será redirecionado para login.html pela função fazerLogoff().
        }
    }

    // Listener para o formulário de login
    const formLogin = document.getElementById("loginForm"); //
    if (formLogin) {
        formLogin.addEventListener("submit", fazerLogin); //
    }

    // Demais listeners e inicializações que estavam no DOMContentLoaded original
    const modalPrincipal = document.getElementById("modal"); //
    if (modalPrincipal) {
        modalPrincipal.addEventListener("click", function (e) { //
            if (e.target.id === "modal") {  //
                closeModal(); //
            }
        });
    }
    
    const menuListCardapio = document.getElementById("menuList");  //
    const totalCardapioEl = document.getElementById("total");  //

    if (menuListCardapio && totalCardapioEl) { //
        const checkboxesCardapio = menuListCardapio.querySelectorAll(".item input[type='checkbox']"); //
        checkboxesCardapio.forEach(checkbox => {
            checkbox.addEventListener("change", updateCardapioTotal); //
        });
        updateCardapioTotal();  //
    }

    if (document.querySelector(".list")) {  //
        loadOrders();  //
    }

    const carrinhoItensEl = document.getElementById('carrinho-itens'); //
    const carrinhoTotalEl = document.getElementById('carrinho-total'); //
    const cartCountEl = document.getElementById('cart-count'); //
    const carrinhoOverlayEl = document.getElementById('carrinho-overlay'); //

    if (carrinhoItensEl && carrinhoTotalEl && cartCountEl) { //
        atualizarCarrinhoVisual();  //
    }

    if (carrinhoOverlayEl) { //
        carrinhoOverlayEl.addEventListener('click', () => { //
            toggleCarrinho(); //
        });
    }

    // A antiga lógica de verificação de sessão e boas-vindas no final do DOMContentLoaded
    // foi incorporada na nova estrutura condicional no início deste listener.
});