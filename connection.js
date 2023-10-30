var mysql = require('mysql');

// var connection = mysql.createConnection({
//   host: 'vision.clmi8j83ukqy.sa-east-1.rds.amazonaws.com',
//   user: 'root',
//   password: 'rootroot',
//   database: 'vision',
// });

// local connection
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'vision',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});
module.exports = connection;
