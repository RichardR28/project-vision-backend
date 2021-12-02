var express = require('express');
var router = express.Router();
const connection = require('../connection');

router.get('/createUser', (req, res) => {
  let sql = 'select * from estados';

  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
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

module.exports = router;
