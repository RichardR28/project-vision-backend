var express = require('express');
var router = express.Router();
const connection = require('../connection');

router.post('/saveSolicitacoes', (req, res) => {
  const { id, descricao, dataSolicitacao } = req.body;
  let sql = `insert into solicitacoes (usuario, descricao, dataSolicitacao, retorno) values (${id}, '${descricao}', '${dataSolicitacao}', 0)`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
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
    if (err) throw err;
    res.send(result);
  });
});

router.post('/declineSolicitation', (req, res) => {
  const { id } = req.body;
  let sql = `UPDATE solicitacoes SET retorno = 2 where id = ${id}`;

  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send({ status: 200 });
  });
});

router.post('/acceptSolicitation', (req, res) => {
  const { id } = req.body;
  let sql = `UPDATE solicitacoes SET retorno = 1 where id = ${id}`;

  connection.query(sql, (err, result) => {
    if (err) throw err;
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
    if (err) throw err;
    res.send(result);
  });
});

module.exports = router;
