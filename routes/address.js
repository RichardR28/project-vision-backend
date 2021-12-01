var express = require('express');
var router = express.Router();
const connection = require('../connection');

router.get('/getPaises', (req, res) => {
  const sql = 'select * from paises';
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

module.exports = router;
