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
        window.location.href = "menu.html";
    } else {
        exibirMensagem("Usuário ou senha incorretos!", "erro");
        document.getElementById("password").value = "";
    }
}

function salvarSessao(usuario) {
    // Gera um ID único para a sessão
    const sessionId = crypto.randomUUID();
    const agora = new Date().getTime();
    
    // Limpa qualquer sessão anterior
    localStorage.clear();
    sessionStorage.clear();
    
    // Salva apenas o ID da sessão no localStorage
    localStorage.setItem("sessionId", sessionId);
    
    // Salva os dados completos da sessão no sessionStorage
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
    const sessaoSession = JSON.parse(sessionStorage.getItem("dadosSessao"));
    
    // Se não houver sessão em nenhum dos storages, faz logout
    if (!sessionId || !sessaoSession) {
        fazerLogoff();
        return;
    }
    
    // Verifica se os IDs de sessão correspondem
    if (sessionId !== sessaoSession.sessionId) {
        fazerLogoff();
        return;
    }
    
    const agora = new Date().getTime();
    const tempoInativo = agora - sessaoSession.ultimoAcesso;

    if (tempoInativo > 1800000) { // 30 minutos
        fazerLogoff();
    } else {
        // Atualiza o timestamp no sessionStorage
        sessaoSession.ultimoAcesso = agora;
        sessionStorage.setItem("dadosSessao", JSON.stringify(sessaoSession));
    }
}

// Adiciona verificação de inatividade a cada minuto
setInterval(verificarSessao, 60000);

function fazerLogoff() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "login.html";
}

function exibirMensagem(texto, tipo) {
    let mensagemEl = document.querySelector(".mensagem-login");

    if (!mensagemEl) {
        mensagemEl = document.createElement("div");
        mensagemEl.className = "mensagem-login";
        const container = document.querySelector(".container") || document.body;
        container.appendChild(mensagemEl);
    }

    mensagemEl.style.cssText = `
        background-color: ${tipo === "erro" ? "#f44336" : "#4CAF50"};
        color: white;
        padding: 10px;
        margin-top: 10px;
        border-radius: 5px;
        text-align: center;
    `;
    mensagemEl.textContent = texto;

    setTimeout(() => mensagemEl.remove(), 3000);
}

////////////////////////////////////// MENU

function loadMenu() {
    const menu = JSON.parse(localStorage.getItem("menu")) || [];
    const menuList = document.getElementById("menuList");
    if (!menuList) return;

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
    const name = document.getElementById("itemName").value;
    const price = parseFloat(document.getElementById("itemPrice").value);
    if (name && price) {
        const menu = JSON.parse(localStorage.getItem("menu")) || [];
        menu.push({ name, price });
        localStorage.setItem("menu", JSON.stringify(menu));
        loadMenu();
    }
}

function deleteItem(index) {
    const menu = JSON.parse(localStorage.getItem("menu")) || [];
    menu.splice(index, 1);
    localStorage.setItem("menu", JSON.stringify(menu));
    loadMenu();
}

function selecionarItem(item) {
    document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
    item.classList.add('selected');
}

function toggleMenu() {
    const menu = document.querySelector('.sidebar');
    menu?.classList.toggle("active");
  }
  

// ////////////////////////////////////////PEDIDOS
function loadOrders() {
    const list = document.querySelector(".list");
    if (!list) return;

    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    list.innerHTML = "";
    savedOrders.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${item.quantity} x</span><span>${item.name}</span> <span>R$ ${(item.quantity * item.price).toFixed(2)}</span> <button class="delete" data-index="${index}">x</button>`;
        list.appendChild(li);
    });

    updateSummary();
}

function updateSummary() {
    const totalPriceEl = document.getElementById("total-price");
    const totalItemsEl = document.getElementById("total-items");
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];

    const totalPrice = savedOrders.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const totalItems = savedOrders.reduce((sum, item) => sum + parseInt(item.quantity), 0);

    if (totalPriceEl) totalPriceEl.textContent = `R$ ${totalPrice.toFixed(2)}`;
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
}

// INICIALIZAÇÃO// ... (todo o código anterior permanece igual até o final do DOMContentLoaded)
const itemElements = document.querySelectorAll("#menuList .item");
let selectedItems = {};
let total = 0;

function updateTotal() {
  total = 0;
  itemElements.forEach((itemEl, index) => {
    const checkbox = itemEl.querySelector("input");
    if (checkbox.checked) {
      const price = parseFloat(itemEl.getAttribute("data-price"));
      total += price;
    }
  });
  document.getElementById("total").textContent = total.toFixed(2);
}

itemElements.forEach((itemEl, index) => {
  const checkbox = itemEl.querySelector("input");
  checkbox.addEventListener("change", updateTotal);
});

window.showModal = function (element) {
    const item = element.closest(".item");
    const title = item.getAttribute("data-title");
    const desc = item.getAttribute("data-description");
    const price = parseFloat(item.getAttribute("data-price")).toFixed(2);
    const img = item.getAttribute("data-img");
  
    document.getElementById("modalDetails").innerHTML = `
      <h2>${title}</h2>
      <img src="${img}" alt="${title}" style="width: 100%; max-height: 300px; object-fit: cover; margin: 10px 0;">
      <p>${desc}</p>
      <p><strong>Preço:</strong> R$ ${price}</p>
    `;
  
    document.getElementById("modal").style.display = "flex";
  };
  

window.closeModal = function () {
  document.getElementById("modal").style.display = "none";
};

window.adicionarSelecionadosAoPedido = function () {
  const pedidosAtuais = JSON.parse(localStorage.getItem("orders")) || [];

  itemElements.forEach((itemEl) => {
    const checkbox = itemEl.querySelector("input");
    if (checkbox.checked) {
      pedidosAtuais.push({
        name: itemEl.getAttribute("data-title"),
        price: parseFloat(itemEl.getAttribute("data-price")),
        quantity: 1
      });
      checkbox.checked = false;
    }
  });

  localStorage.setItem("orders", JSON.stringify(pedidosAtuais));
  alert("Itens adicionados ao pedido!");
  updateTotal();
};

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    if (form) {
        form.addEventListener("submit", fazerLogin);
    }
});

document.getElementById("modal").addEventListener("click", function (e) {
    if (e.target.id === "modal") {
      closeModal();
    }
  });
  
  // Removed duplicate declaration of 'carrinho'

function toggleCarrinho() {
  const carrinhoLateral = document.getElementById('carrinho-lateral');
  const overlay = document.getElementById('carrinho-overlay');
  carrinhoLateral.classList.toggle('open');
  overlay.classList.toggle('show');
  atualizarCarrinhoVisual();
}

function adicionarSelecionadosAoPedido() {
  const checkboxes = document.querySelectorAll('.item-checkbox');
  checkboxes.forEach((checkbox, index) => {
    if (checkbox.checked) {
      const item = checkbox.closest('.item');
      const title = item.getAttribute('data-title');
      const price = parseFloat(item.getAttribute('data-price'));
      carrinho.push({ title, price });
      checkbox.checked = false;
    }
  });
  atualizarCarrinhoVisual();
}

function atualizarCarrinhoVisual() {
  const lista = document.getElementById('carrinho-itens');
  const totalSpan = document.getElementById('carrinho-total');
  const countSpan = document.getElementById('cart-count');

  lista.innerHTML = '';
  let total = 0;

  carrinho.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerText = `${item.title} - R$ ${item.price.toFixed(2)}`;
    lista.appendChild(li);
    total += item.price;
  });

  totalSpan.innerText = total.toFixed(2);
  countSpan.innerText = carrinho.length;
}
// Carrinho de compras
let carrinho = []; // Retained the original declaration

// Função para alternar a exibição do carrinho lateral
function toggleCarrinho() {
  const carrinhoLateral = document.getElementById('carrinho-lateral');
  const overlay = document.getElementById('carrinho-overlay');
  carrinhoLateral.classList.toggle('open');
  overlay.classList.toggle('show');
  atualizarCarrinhoVisual();
}

// Função para adicionar itens selecionados ao carrinho
function adicionarSelecionadosAoPedido() {
  const checkboxes = document.querySelectorAll('.item-checkbox');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const item = checkbox.closest('.item');
      const title = item.getAttribute('data-title');
      const price = parseFloat(item.getAttribute('data-price'));
      carrinho.push({ title, price });
      checkbox.checked = false;
    }
  });
  atualizarCarrinhoVisual();
}

// Função para atualizar a visualização do carrinho
function atualizarCarrinhoVisual() {
  const lista = document.getElementById('carrinho-itens');
  const totalSpan = document.getElementById('carrinho-total');
  const countSpan = document.getElementById('cart-count');

  lista.innerHTML = '';
  let total = 0;

  carrinho.forEach((item) => {
    const li = document.createElement('li');
    li.innerText = `${item.title} - R$ ${item.price.toFixed(2)}`;
    lista.appendChild(li);
    total += item.price;
  });

  totalSpan.innerText = total.toFixed(2);
  countSpan.innerText = carrinho.length;
}

// Event listener para fechar o carrinho ao clicar fora dele
document.getElementById('carrinho-overlay').addEventListener('click', () => {
  toggleCarrinho();
});
