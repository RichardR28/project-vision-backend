var express = require('express');
var router = express.Router();
const connection = require('../connection');

router.post('/saveSolicitacoes', (req, res) => {
  const { id, descricao, dataSolicitacao } = req.body;
  let sql = `insert into solicitacoes (usuario, descricao, dataSolicitacao, retorno) values (${id}, '${descricao}', '${dataSolicitacao}', 0)`;
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, details: err});
    }
    res.send({ status: 200, result });
  });
});

router.get('/getSolicitacoes', (req, res) => {
  let sql =
    'SELECT solicitacoes.id, solicitacoes.usuario, solicitacoes.descricao, solicitacoes.dataSolicitacao, usuarios.nome, usuarios.email, usuarios.telefone, usuarios.username ';
  sql += 'FROM solicitacoes ';
  sql += 'INNER JOIN usuarios ON (usuarios.id = solicitacoes.usuario) ';
  sql += 'WHERE retorno = 0 ';
  sql += 'ORDER BY dataSolicitacao ASC';

  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, details: err});
    }
    res.send(result);
  });
});

router.post('/declineSolicitation', (req, res) => {
  const { id } = req.body;
  let sql = `UPDATE solicitacoes SET retorno = 2 where id = ${id}`;

  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, details: err});
    }
    res.send({ status: 200 });
  });
});

router.post('/acceptSolicitation', (req, res) => {
  const { id } = req.body;
  let sql = `UPDATE solicitacoes SET retorno = 1 where id = ${id}`;

  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, details: err});
    }
    res.send({ status: 200 });
  });
});

router.post('/getSolicitacoesUsuarios', (req, res) => {
  const { id } = req.body;
  let sql =
    'SELECT solicitacoes.id, solicitacoes.usuario, solicitacoes.retorno, solicitacoes.descricao, solicitacoes.dataSolicitacao, usuarios.nome, usuarios.email, usuarios.telefone, usuarios.username ';
  sql += 'FROM solicitacoes ';
  sql += 'INNER JOIN usuarios ON (usuarios.id = solicitacoes.usuario) ';
  sql += `WHERE usuarios.id = '${id}' `;
  sql += 'ORDER BY dataSolicitacao ASC';

  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, details: err});
    }
    res.send(result);
  });
});

router.post('/registraPontuacao', (req, res) => {
  const { userId, gameId, resultado01, resultado02, resultado03, media, executor } = req.body;
  const serie = Date.now();
  const sql = `insert into pontuacoes (gameId, userId, resultado01, resultado02, resultado03, media, serie, executante) values ('${gameId}', '${userId}', '${resultado01}', '${resultado02}', '${resultado03}', '${media}', '${serie}', '${executor || ''}')`;
  const sql2 = `update jogos set acessos = acessos + 1 where id = ${gameId}`;

  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, details: err});
    }
    connection.query(sql2, (err2, result2) => {
      if (err2) {
        res.status(500);
        res.send({status: 500, details: err2});
      } 
      res.send({ status: 200, result });
    });
  });
});

router.get('/listaJogosAtivos', (req, res) => {
  let sql =
    'SELECT jogos.id, jogos.acessos, jogos.titulo, jogos.imagem, jogos.descricao, jogos.dataCriacao, jogos.codigo, usuarios.nome, usuarios.email, usuarios.telefone ';
  sql +=
    'FROM jogos INNER JOIN usuarios ON (usuarios.id = jogos.idCriador) WHERE status = 1';
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, details: err});
    }
    res.send({ status: 200, result });
  });
});

router.post('/listaPontuacoesUsuario', (req, res) => {
  const { id } = req.body;
  let sql =
    'SELECT pontuacoes.id, pontuacoes.resultado01, pontuacoes.resultado02, pontuacoes.resultado03, pontuacoes.media, ';
  sql +=
    'pontuacoes.serie, usuarios.nome, usuarios.email, usuarios.telefone, jogos.titulo FROM pontuacoes ';
  sql +=
    'INNER JOIN jogos ON (jogos.id = pontuacoes.gameId) INNER JOIN usuarios ON (usuarios.id = jogos.idCriador) ';
  sql += `WHERE userId = ${id} `;
  sql += `ORDER BY pontuacoes.serie desc`;
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, details: err});
    }
    res.send({ status: 200, result });
  });
});

module.exports = router;
