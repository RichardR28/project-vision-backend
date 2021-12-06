var express = require('express');
var router = express.Router();
const connection = require('../connection');

router.get('/getPaises', (req, res) => {
  let sql = 'select paises.id, paises.fips, paises.nome from paises ';
  sql += 'inner join estados on (paises.id = estados.idPais) ';
  sql += 'group by paises.id ';
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

router.post('/getEstados', (req, res) => {
  let sql = 'select * from estados ';
  sql += `where idPais = ${req.body.id}`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

router.post('/getCidades', (req, res) => {
  let sql = 'select * from cidades ';
  sql += `where idEstado = ${req.body.id}`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

module.exports = router;
