/**
 * cadastro.js - Gerenciamento de cadastro de itens para o sistema Zeentt
 * Responsável pelo gerenciamento e manipulação do cadastro de itens do cardápio
 */

// Inicialização do módulo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Módulo de cadastro inicializado');
    inicializarFormulario();
    carregarItensSalvos();
    verificarSessao();
});

/**
 * Inicializa os eventos e validações do formulário de cadastro
 */
function inicializarFormulario() {
    const form = document.getElementById('formCadastro');
    
    if (!form) {
        console.error('Formulário de cadastro não encontrado!');
        return;
    }
    
    // Configura o evento de submissão do formulário
    form.addEventListener('submit', (evento) => {
        evento.preventDefault();
        
        if (validarFormulario()) {
            salvarItem();
            exibirMensagem('Item cadastrado com sucesso!', 'sucesso');
            form.reset();
        }
    });
    
    // Inicializa validação em tempo real para os campos
    inicializarValidacaoCampos();
}

/**
 * Configura validação em tempo real para os campos do formulário
 */
function inicializarValidacaoCampos() {
    // Validação do código (apenas números)
    const campoCodigo = document.getElementById('codigo');
    if (campoCodigo) {
        campoCodigo.addEventListener('input', () => {
            const valor = campoCodigo.value.trim();
            
            // Verifica se contém apenas números
            if (!/^\d*$/.test(valor)) {
                exibirErro(campoCodigo, 'O código deve conter apenas números');
            } else {
                limparErro(campoCodigo);
            }
        });
    }
    
    // Validação do valor (apenas números com até 2 casas decimais)
    const campoValor = document.getElementById('valor');
    if (campoValor) {
        campoValor.addEventListener('input', () => {
            const valor = campoValor.value.trim();
            
            // Verifica se é um número válido
            if (!/^\d*(\.\d{0,2})?$/.test(valor)) {
                exibirErro(campoValor, 'Valor inválido. Use o formato 00.00');
            } else {
                limparErro(campoValor);
            }
        });
    }
    
    // Pré-visualização da imagem quando selecionada
    const campoImagem = document.getElementById('imagem');
    if (campoImagem) {
        campoImagem.addEventListener('change', preVisualizarImagem);
    }
}

/**
 * Exibe uma pré-visualização da imagem selecionada
 */
function preVisualizarImagem(evento) {
    const arquivo = evento.target.files[0];
    
    if (arquivo) {
        // Cria ou localiza o elemento de pré-visualização
        let previewContainer = document.getElementById('img-preview');
        
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'img-preview';
            previewContainer.style.cssText = 'margin-top: 10px; text-align: center;';
            evento.target.parentNode.appendChild(previewContainer);
        }
        
        // Cria a URL da imagem para pré-visualização
        const urlImagem = URL.createObjectURL(arquivo);
        
        // Atualiza o conteúdo do container de pré-visualização
        previewContainer.innerHTML = `
            <p>Pré-visualização:</p>
            <img src="${urlImagem}" alt="Pré-visualização" style="max-width: 200px; max-height: 150px; border-radius: 8px;">
        `;
    }
}

/**
 * Valida o formulário antes de enviar
 * @returns {boolean} Se o formulário é válido ou não
 */
function validarFormulario() {
    const codigo = document.getElementById('codigo').value.trim();
    const nome = document.getElementById('nome').value.trim();
    const tipo = document.getElementById('tipo').value;
    const descricao = document.getElementById('descricao').value.trim();
    const valor = document.getElementById('valor').value.trim();
    const imagem = document.getElementById('imagem').value;
    
    // Limpa erros anteriores
    limparTodosErros();
    
    let formValido = true;
    
    // Validação do código
    if (!codigo) {
        exibirErro(document.getElementById('codigo'), 'Código é obrigatório');
        formValido = false;
    } else if (verificarCodigoExistente(codigo)) {
        exibirErro(document.getElementById('codigo'), 'Este código já está em uso');
        formValido = false;
    }
    
    // Validação do nome
    if (!nome) {
        exibirErro(document.getElementById('nome'), 'Nome é obrigatório');
        formValido = false;
    }
    
    // Validação do tipo
    if (!tipo) {
        exibirErro(document.getElementById('tipo'), 'Selecione um tipo');
        formValido = false;
    }
    
    // Validação da descrição
    if (!descricao) {
        exibirErro(document.getElementById('descricao'), 'Descrição é obrigatória');
        formValido = false;
    }
    
    // Validação do valor
    if (!valor) {
        exibirErro(document.getElementById('valor'), 'Valor é obrigatório');
        formValido = false;
    } else if (isNaN(parseFloat(valor)) || parseFloat(valor) <= 0) {
        exibirErro(document.getElementById('valor'), 'Valor deve ser maior que zero');
        formValido = false;
    }
    
    // Validação da imagem
    if (!imagem) {
        exibirErro(document.getElementById('imagem'), 'Selecione uma imagem');
        formValido = false;
    }
    
    return formValido;
}

/**
 * Exibe uma mensagem de erro abaixo de um campo específico
 */
function exibirErro(campo, mensagem) {
    // Remove erro anterior se existir
    limparErro(campo);
    
    // Cria o elemento de erro
    const erro = document.createElement('div');
    erro.className = 'erro-campo';
    erro.textContent = mensagem;
    erro.style.cssText = 'color: #f44336; font-size: 12px; margin-top: 3px;';
    
    // Insere após o campo
    campo.parentNode.insertBefore(erro, campo.nextSibling);
    
    // Destaca o campo com erro
    campo.style.borderColor = '#f44336';
}

/**
 * Remove a mensagem de erro de um campo
 */
function limparErro(campo) {
    const erro = campo.parentNode.querySelector('.erro-campo');
    if (erro) {
        erro.remove();
    }
    campo.style.borderColor = '';
}

/**
 * Remove todas as mensagens de erro do formulário
 */
function limparTodosErros() {
    document.querySelectorAll('.erro-campo').forEach(erro => erro.remove());
    document.querySelectorAll('input, select, textarea').forEach(campo => {
        campo.style.borderColor = '';
    });
}

/**
 * Verifica se já existe um item com o código fornecido
 */
function verificarCodigoExistente(codigo) {
    const itens = JSON.parse(localStorage.getItem('itensCadastrados')) || [];
    return itens.some(item => item.codigo === codigo);
}

/**
 * Salva o item do cardápio no localStorage
 */
function salvarItem() {
    // Obtém os dados do formulário
    const codigo = document.getElementById('codigo').value.trim();
    const nome = document.getElementById('nome').value.trim();
    const tipo = document.getElementById('tipo').value;
    const descricao = document.getElementById('descricao').value.trim();
    const valor = parseFloat(document.getElementById('valor').value.trim());
    
    // Cria o objeto do item
    const novoItem = {
        codigo,
        nome,
        tipo,
        descricao,
        valor,
        dataCadastro: new Date().toISOString(),
        ativo: true
    };
    
    // Recupera itens existentes ou cria array vazio
    const itens = JSON.parse(localStorage.getItem('itensCadastrados')) || [];
    
    // Adiciona o novo item
    itens.push(novoItem);
    
    // Salva no localStorage
    localStorage.setItem('itensCadastrados', JSON.stringify(itens));
    
    console.log('Item cadastrado:', novoItem);
    
    // Se a imagem foi selecionada, trata-a (simulado no front-end)
    const inputImagem = document.getElementById('imagem');
    if (inputImagem.files && inputImagem.files[0]) {
        console.log('Imagem selecionada:', inputImagem.files[0].name);
        // Em um cenário real, aqui você enviaria a imagem para o servidor
    }
    
    // Atualiza a lista de itens exibida, se existir
    atualizarListaItens();
}

/**
 * Carrega itens salvos e exibe na interface, se houver uma tabela para isso
 */
function carregarItensSalvos() {
    const tabelaItens = document.getElementById('tabela-itens');
    if (!tabelaItens) {
        return; // Não há tabela para exibir os itens
    }
    
    const itens = JSON.parse(localStorage.getItem('itensCadastrados')) || [];
    
    if (itens.length === 0) {
        tabelaItens.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum item cadastrado</td></tr>';
        return;
    }
    
    // Limpa a tabela
    tabelaItens.innerHTML = '';
    
    // Adiciona cada item à tabela
    itens.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.codigo}</td>
            <td>${item.nome}</td>
            <td>${item.tipo}</td>
            <td>${item.descricao.substring(0, 50)}${item.descricao.length > 50 ? '...' : ''}</td>
            <td>R$ ${item.valor.toFixed(2)}</td>
            <td>
                <button class="btn-editar" data-index="${index}">Editar</button>
                <button class="btn-excluir" data-index="${index}">Excluir</button>
            </td>
        `;
        
        tabelaItens.appendChild(tr);
    });
    
    // Adiciona eventos aos botões de editar e excluir
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', (e) => editarItem(e.target.dataset.index));
    });
    
    document.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', (e) => excluirItem(e.target.dataset.index));
    });
}

/**
 * Atualiza a exibição da lista de itens após alterações
 */
function atualizarListaItens() {
    carregarItensSalvos();
}

/**
 * Prepara o formulário para edição de um item existente
 */
function editarItem(index) {
    const itens = JSON.parse(localStorage.getItem('itensCadastrados')) || [];
    const item = itens[index];
    
    if (!item) return;
    
    // Preenche o formulário com os dados do item
    document.getElementById('codigo').value = item.codigo;
    document.getElementById('codigo').disabled = true; // Não permite alterar o código
    document.getElementById('nome').value = item.nome;
    document.getElementById('tipo').value = item.tipo;
    document.getElementById('descricao').value = item.descricao;
    document.getElementById('valor').value = item.valor;
    
    // Altera o botão de submit para modo de edição
    const btnSubmit = document.querySelector('button[type="submit"]');
    btnSubmit.textContent = 'Atualizar';
    btnSubmit.dataset.modo = 'editar';
    btnSubmit.dataset.index = index;
    
    // Vai para o início do formulário
    window.scrollTo(0, 0);
    
    // Adiciona eventos específicos para o modo de edição
    const form = document.getElementById('formCadastro');
    
    // Remove handler antigo e adiciona novo
    form.removeEventListener('submit', handleFormSubmit);
    form.addEventListener('submit', handleFormSubmit);
}

/**
 * Função para lidar com o envio do formulário (tanto para criar quanto para editar)
 */
function handleFormSubmit(evento) {
    evento.preventDefault();
    
    const btnSubmit = document.querySelector('button[type="submit"]');
    const modo = btnSubmit.dataset.modo;
    
    if (modo === 'editar') {
        const index = btnSubmit.dataset.index;
        atualizarItem(index);
    } else {
        salvarItem();
    }
    
    // Reseta o formulário e o botão
    resetarFormulario();
}

/**
 * Atualiza um item existente
 */
function atualizarItem(index) {
    const itens = JSON.parse(localStorage.getItem('itensCadastrados')) || [];
    
    if (!itens[index]) {
        exibirMensagem('Item não encontrado!', 'erro');
        return;
    }
    
    // Mantém o código original e atualiza os outros campos
    const codigoOriginal = itens[index].codigo;
    const nome = document.getElementById('nome').value.trim();
    const tipo = document.getElementById('tipo').value;
    const descricao = document.getElementById('descricao').value.trim();
    const valor = parseFloat(document.getElementById('valor').value.trim());
    
    // Atualiza o item
    itens[index] = {
        ...itens[index],
        nome,
        tipo,
        descricao,
        valor,
        dataAtualizacao: new Date().toISOString()
    };
    
    // Salva no localStorage
    localStorage.setItem('itensCadastrados', JSON.stringify(itens));
    
    console.log('Item atualizado:', itens[index]);
    
    // Trata a imagem (simulado no front-end)
    const inputImagem = document.getElementById('imagem');
    if (inputImagem.files && inputImagem.files[0]) {
        console.log('Nova imagem selecionada:', inputImagem.files[0].name);
        // Em um cenário real, aqui você enviaria a imagem para o servidor
    }
    
    exibirMensagem('Item atualizado com sucesso!', 'sucesso');
    
    // Atualiza a lista de itens
    atualizarListaItens();
}

/**
 * Remove um item da lista
 */
function excluirItem(index) {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
        return;
    }
    
    const itens = JSON.parse(localStorage.getItem('itensCadastrados')) || [];
    
    if (!itens[index]) {
        exibirMensagem('Item não encontrado!', 'erro');
        return;
    }
    
    // Remove o item
    const itemRemovido = itens.splice(index, 1)[0];
    
    // Salva no localStorage
    localStorage.setItem('itensCadastrados', JSON.stringify(itens));
    
    console.log('Item removido:', itemRemovido);
    
    exibirMensagem('Item excluído com sucesso!', 'sucesso');
    
    // Atualiza a lista de itens
    atualizarListaItens();
}

/**
 * Reseta o formulário para o estado inicial
 */
function resetarFormulario() {
    const form = document.getElementById('formCadastro');
    form.reset();
    
    // Habilita o campo de código novamente
    document.getElementById('codigo').disabled = false;
    
    // Restaura o botão de submit
    const btnSubmit = document.querySelector('button[type="submit"]');
    btnSubmit.textContent = 'Salvar';
    btnSubmit.removeAttribute('data-modo');
    btnSubmit.removeAttribute('data-index');
    
    // Remove a pré-visualização da imagem
    const previewContainer = document.getElementById('img-preview');
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }
    
    // Limpa todos os erros
    limparTodosErros();
}

/**
 * Exibe uma mensagem de feedback para o usuário
 */
function exibirMensagem(texto, tipo) {
    // Procura ou cria um contêiner para mensagens
    let mensagemEl = document.querySelector('.mensagem-feedback');
    
    if (!mensagemEl) {
        mensagemEl = document.createElement('div');
        mensagemEl.className = 'mensagem-feedback';
        
        // Insere após o formulário
        const form = document.getElementById('formCadastro');
        form.parentNode.insertBefore(mensagemEl, form.nextSibling);
    }
    
    // Define o estilo com base no tipo
    mensagemEl.style.cssText = `
        background-color: ${tipo === 'erro' ? '#f44336' : '#4CAF50'};
        color: white;
        padding: 12px;
        margin: 10px 0;
        border-radius: 5px;
        text-align: center;
        opacity: 1;
        transition: opacity 0.5s;
    `;
    mensagemEl.textContent = texto;
    
    // Remove a mensagem após alguns segundos
    setTimeout(() => {
        mensagemEl.style.opacity = '0';
        setTimeout(() => mensagemEl.remove(), 500);
    }, 3000);
}

/**
 * Verifica se o usuário está logado e tem permissão
 */
function verificarSessao() {
    const sessionId = localStorage.getItem('sessionId');
    const sessaoSession = JSON.parse(sessionStorage.getItem('dadosSessao'));
    
    if (!sessionId || !sessaoSession || sessionId !== sessaoSession.sessionId) {
        // Redireciona para login
        window.location.href = 'login.html';
        return;
    }
    
    // Atualiza o timestamp no sessionStorage
    const agora = new Date().getTime();
    sessaoSession.ultimoAcesso = agora;
    sessionStorage.setItem('dadosSessao', JSON.stringify(sessaoSession));
    
    // Exibe o nome do usuário, se houver um elemento para isso
    const nomeUsuarioEl = document.getElementById('nome-usuario');
    if (nomeUsuarioEl && sessaoSession.nome) {
        nomeUsuarioEl.textContent = sessaoSession.nome;
    }
}

// Função de logoff - chamada pelo botão na interface
function fazerLogoff() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// Configura o toggle do menu lateral
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        console.log('Menu toggled:', sidebar.classList.contains('active'));
    } else {
        console.error('Sidebar element not found');
    }
}