<?php
// Conexão com o banco
$conn = new mysqli("localhost", "root", "", "restaurante");

if ($conn->connect_error) {
  die("Erro na conexão: " . $conn->connect_error);
}

$nome = $_POST['nome'];
$tipo = $_POST['tipo'];
$descricao = $_POST['descricao'];
$valor = $_POST['valor'];

// Upload da imagem
$imagem = $_FILES['imagem']['name'];
$target = "uploads/" . basename($imagem);

if (move_uploaded_file($_FILES['imagem']['tmp_name'], $target)) {
    $sql = "INSERT INTO itens_cardapio (nome, tipo, descricao, valor, imagem) VALUES ('$nome', '$tipo', '$descricao', '$valor', '$imagem')";

    if ($conn->query($sql) === TRUE) {
        echo "Item cadastrado com sucesso!";
    } else {
        echo "Erro: " . $sql . "<br>" . $conn->error;
    }
} else {
    echo "Erro ao enviar a imagem.";
}

$conn->close();
?>
