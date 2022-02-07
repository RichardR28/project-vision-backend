var express = require('express');
var router = express.Router();
var connection = require('../connection');
const multer = require('multer');
const moment = require('moment');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './Images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: fileFilter,
});

router.post(
  '/savarQuiz',
  upload.fields([{ name: 'imagem[]' }, { name: 'logo' }]),
  (req, res) => {
    const { titulo, descricao, id, perguntas } = req.body;
    const data = moment().format('YYYY-MM-DD');
    const arquivo = req.files['logo'][0].filename;
    const sql = `insert into quizzes (titulo, imagem, idCriador, descricao, dataCriacao, status) values ('${titulo}', '${arquivo}', '${id}', '${descricao}', '${data}', '${1}')`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      const aux = JSON.parse(perguntas);
      aux.forEach((item, index) => {
        let perguntaSql = '';
        let auxImage = '';
        if (req.files['imagem[]']?.length > 0) {
          req.files['imagem[]'].forEach((img) => {
            const pos = img.originalname.split('-')[1];
            if (index == pos) {
              auxImage = img.filename;
            }
          });
        }
        if (item.tipo === 1) {
          perguntaSql += `insert into perguntas (sequencia, pergunta, imagem, tipoResposta, resposta, opcao1, opcao2, opcao3, opcao4, quizId)`;
          perguntaSql += ` values ('${item.sequencia}', '${item.pergunta}', '${auxImage}', '${item.tipo}', '${item.resposta}', '${item.opcoes[0].value}', '${item.opcoes[1].value}', '${item.opcoes[2].value}', '${item.opcoes[3].value}', ${result.insertId})`;
        } else {
          perguntaSql += `insert into perguntas (sequencia, pergunta, imagem, tipoResposta, resposta, quizId)`;
          perguntaSql += ` values ('${item.sequencia}', '${item.pergunta}', '${auxImage}', '${item.tipo}', '${item.resposta}', ${result.insertId})`;
        }
        connection.query(perguntaSql, (err2, result2) => {
          if (err2) throw err2;
        });
      });
      res.send({ status: 200 });
    });
  },
);

router.post('/listaQuizzesUsuario', (req, res) => {
  const { id } = req.body;
  const sql = `select id, titulo, descricao, dataCriacao,  status, acessos from quizzes where idCriador = '${id}'`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send({ status: 200, result });
  });
});

router.post('/desativaQuiz', (req, res) => {
  const { id } = req.body;
  const sql = `update quizzes set status = 0 where id = '${id}'`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send({ status: 200, result });
  });
});

router.post('/ativaQuiz', (req, res) => {
  const { id } = req.body;
  const sql = `update quizzes set status = 1 where id = '${id}'`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send({ status: 200, result });
  });
});

module.exports = router;
