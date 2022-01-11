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
  const sql =
    'select * from solicitacoes where retorno = 0 order by dataSolicitacao desc';

  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

module.exports = router;
