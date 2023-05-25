var express = require('express');
var router = express.Router();
var connection = require('../connection');
const multer = require('multer');
const moment = require('moment');
var fs = require('fs');

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
  // limits: {
  //   fileSize: 1024 * 1024 * 10,
  // },
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
      if (err) {
        res.status(500);
        res.send({status: 500, datails: err});
      }
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
          if (err2) {
            res.status(500);
            res.send({status: 500, datails: err2});
          }
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
    if (err) {
      res.status(500);
      res.send({status: 500, datails: err});
    }
    res.send({ status: 200, result });
  });
});

router.post('/desativaQuiz', (req, res) => {
  const { id } = req.body;
  const sql = `update quizzes set status = 0 where id = '${id}'`;
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, datails: err});
    }
    res.send({ status: 200, result });
  });
});

router.post('/ativaQuiz', (req, res) => {
  const { id } = req.body;
  const sql = `update quizzes set status = 1 where id = '${id}'`;
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, datails: err});
    }
    res.send({ status: 200, result });
  });
});

router.get('/listaQuizzes', (req, res) => {
  let sql =
    'SELECT quizzes.id, quizzes.titulo, quizzes.imagem, quizzes.idCriador, ';
  sql += 'quizzes.acessos, quizzes.descricao, quizzes.dataCriacao, ';
  sql += 'usuarios.nome, usuarios.email, usuarios.telefone ';
  sql += 'from quizzes ';
  sql += 'inner join usuarios on (quizzes.idCriador = usuarios.id) ';
  sql += 'WHERE quizzes.status = 1';
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, datails: err});
    }
    res.send({ status: 200, result });
  });
});

router.post('/buscaTeste', (req, res) => {
  const { id } = req.body;
  let sql =
    'SELECT perguntas.quizId, perguntas.id, perguntas.pergunta, perguntas.imagem, perguntas.tipoResposta, ';
  sql +=
    'perguntas.opcao1, perguntas.opcao2, perguntas.opcao3, perguntas.opcao4 FROM perguntas ';
  sql += `WHERE quizId = ${id} ORDER BY sequencia ASC`;
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, datails: err});
    }
    res.send({ status: 200, result });
  });
});

router.post('/salvarRespostas', (req, res) => {
  const { respostas, quizId, userId, executor } = req.body;
  const serie = Date.now();
  const sql = `update quizzes set acessos = acessos + 1 where id = ${quizId}`;
  Object.values(respostas).forEach((item) => {
    const sql2 = `insert into respostas (resposta, quizId, perguntaId, userId, serie, executante) values ('${item.value}', '${quizId}', '${item.perguntaId}', '${userId}', '${serie}', '${executor || ''}')`;
    connection.query(sql2, (err2, result) => {
      if (err2) {
        res.status(500);
        res.send({status: 500, datails: err2});
      }     
    });
  });
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, datails: err});
    } 
    res.send({ status: 200 });
  });
});

router.post('/buscarResultados', (req, res) => {
  const { userId } = req.body;
  let sql =
    'SELECT respostas.quizId, quizzes.titulo, quizzes.descricao, respostas.perguntaId, respostas.resposta, perguntas.resposta gabarito, respostas.serie, respostas.executante, ';
  sql +=
    'quizzes.imagem, usuarios.username, usuarios.nome, usuarios.email, usuarios.telefone ';
  sql += 'FROM respostas ';
  sql += 'INNER JOIN perguntas ON (respostas.perguntaId = perguntas.id) ';
  sql += 'INNER JOIN quizzes on (perguntas.quizId = quizzes.id) ';
  sql += 'INNER JOIN usuarios on (quizzes.idCriador = usuarios.id) ';
  sql += `WHERE quizzes.status = 1 AND respostas.userId = ${userId} `;
  sql += 'ORDER BY respostas.serie desc';
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500);
      res.send({status: 500, datails: err});
    }
    res.send({ status: 200, result });
  });
});

module.exports = router;
