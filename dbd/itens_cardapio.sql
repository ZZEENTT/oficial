CREATE TABLE itens_cardapio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  tipo VARCHAR(50),
  descricao TEXT,
  valor DECIMAL(10,2),
  imagem VARCHAR(255)
);
