
const items = [
  { title: "Combo dos Clássicos", price: 52.90, description: "2 Sanduíches + Batata + Bebida. Escolha entre Big Mac, Cheddar McMelt..." },
  { title: "4 Pequenos Preços", price: 32.00, description: "Escolha 4 itens entre Cheeseburger, McFiesta, Chicken Jr..." },
  { title: "McOferta Média + Nuggets/Cheeseburger/McFlurry", price: 43.90, description: "1 McOferta Média Clássica + acompanhamento (Nuggets, Cheeseburger ou McFlurry)." },
  { title: "2 McOfertas Médias", price: 68.90, description: "2 McOfertas Médias Clássicas para compartilhar." },
  { title: "2 Sanduíches com desconto", price: 30.90, description: "Leve 2 sanduíches com desconto entre várias opções." }
];

let total = 0;

const menuList = document.getElementById('menuList');
const totalDisplay = document.getElementById('total');
const modal = document.getElementById('modal');
const modalDetails = document.getElementById('modalDetails');

function updateTotal(amount) {
  total += amount;
  totalDisplay.textContent = total.toFixed(2);
}

function showModal(item) {
  modalDetails.innerHTML = `<h2>${item.title}</h2><p>${item.description}</p><p><strong>Preço:</strong> R$ ${item.price.toFixed(2)}</p><button class='btn-add' onclick='selectItem(${item.price})'>Selecionar</button>`;
  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
}

function selectItem(price) {
  updateTotal(price);
  closeModal();
}

items.forEach(item => {
  const div = document.createElement('div');
  div.className = 'item';
  div.innerHTML = `<div class='item-title'>${item.title}</div><div class='item-price'>a partir de R$ ${item.price.toFixed(2)}</div>`;
  div.onclick = () => showModal(item);
  menuList.appendChild(div);
});