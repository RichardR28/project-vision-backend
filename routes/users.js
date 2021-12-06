var express = require('express');
var router = express.Router();
const connection = require('../connection');
const crypto = require('crypto');
const salt = '690b5443198e34da4adf22098442e92b';

// function gerarSalt() {
//   return crypto.randomBytes(16).toString('hex');
// }

function sha512(senha) {
  var hash = crypto.createHmac('sha512', salt); // Algoritmo de cripto sha512
  hash.update(senha);
  var hash = hash.digest('hex');
  return {
    salt,
    hash,
  };
}

function gerarSenha(senha) {
  var senhaHash = sha512(senha);
  return senhaHash.hash;
}

router.post('/createUser', (req, res) => {
  const {
    userCPF,
    nome,
    user,
    email,
    senha,
    genero,
    dataNascimento,
    country,
    estado,
    cidade,
    telefone,
  } = req.body;

  const senhaHash = gerarSenha(senha);

  let sql =
    'insert into usuarios (nome, username, email, senha, cpf, dataNascimento, telefone, genero, idPais, idEstado, idCidade) ';
  sql += `values ('${nome}', '${user}', '${email}', '${senhaHash}', '${userCPF}', '${dataNascimento}', `;
  sql += telefone ? `${telefone}, ` : 'null, ';
  sql += `${genero}, ${country}, ${estado}, ${cidade})`;

  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send({ status: 200, result });
  });
});

router.get('/getGeneros', (req, res) => {
  let sql = 'select * from generos ';
  sql += 'order by label';
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

router.post('/validaUsername', (req, res) => {
  let sql = 'select count(*) count from usuarios ';
  sql += `where username = "${req.body.username}"`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

module.exports = router;
