var express = require('express');
var router = express.Router();
const connection = require('../connection');
const crypto = require('crypto');
const salt = '690b5443198e34da4adf22098442e92b';

const nodemailer = require('nodemailer');
const SMTP_CONFIG = require('../smtp');

const Trasporter = nodemailer.createTransport({
  host: SMTP_CONFIG.host,
  port: SMTP_CONFIG.port,
  secure: false,
  auth: { user: SMTP_CONFIG.user, pass: SMTP_CONFIG.pass },
  tls: {
    rejectUnauthorized: false,
  },
});

function gerarSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function sha512(senha) {
  var hash = crypto.createHmac('sha512', salt); // Algoritmo de cripto sha512
  hash.update(senha);
  var hash = hash.digest('hex');
  return {
    salt,
    hash,
  };
}

function sha512Aux(key) {
  const salt = gerarSalt();
  let hash = crypto.createHmac('sha512', salt);
  hash.update(key);
  hash = hash.digest('hex');
  return { salt, hash };
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

router.post('/login', (req, res) => {
  const senhaHash = gerarSenha(req.body.password);
  let sql = `select * from usuarios where (username = '${req.body.username}' or email = '${req.body.email}') and senha = '${senhaHash}'`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

router.get('/getUserId', (req, res) => {
  const { username, email } = req.body;
  let sql = `select id from usuarios where username = '${username}' and email = '${email}'`;

  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

router.post('/checkEmail', (req, res) => {
  const { email } = req.body;
  let sql = `select senha from usuarios where email = '${email}'`;
  connection.query(sql, async (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      res.send({ status: 500 });
    } else {
      const senha = result[0].senha;
      let fullKeyHash = crypto.createHmac('sha512', senha);
      fullKeyHash.update(crypto.randomBytes(6).toString('hex'));
      fullKeyHash = fullKeyHash.digest('hex');
      const keyHash = fullKeyHash.substr(0, 5).toUpperCase();
      enviaEmail(email, keyHash);
      const maskKey = sha512Aux(keyHash);
      res.send({ status: 200, key: maskKey });
    }
  });
});

router.post('/redefineSenha', (req, res) => {
  const { email, senha } = req.body;
  const senhaHash = gerarSenha(senha);
  const sqlSelect = `select id, senha from usuarios where email = '${email}'`;
  connection.query(sqlSelect, (err, result) => {
    if (err) throw err;
    const id = result[0].id;
    if (senhaHash === result[0].senha) {
      res.send({ status: 500, msg: 'A senha não pode ser igual à anterior.' });
    } else {
      let sqlUpdate = `update usuarios set senha = '${senhaHash}' where id = ${id} `;
      connection.query(sqlUpdate, (err2) => {
        if (err2) throw err2;
        res.send({ status: 200 });
      });
    }
  });
});

async function enviaEmail(email, key) {
  const mailSent = await Trasporter.sendMail({
    text: `Olá, segue chave para troca de senha no sistema. CHAVE: ${key}`,
    subject: 'Chave para redefinição de senha Vision',
    from: SMTP_CONFIG.from,
    to: email,
  });
  console.log('Info: ', mailSent);
}

module.exports = router;
