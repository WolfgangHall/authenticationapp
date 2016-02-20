var express = require('express');
var expressHandlebars = require('express-handlebars');
var bodyParser = require ('body-parser');
var session = require('express-session');
var Sequelize = require('sequelize');
var sha256 = require('sha256');
var app = express();

var PORT = process.env.PORT || 8080;

var sequelize = new Sequelize('auth_db', 'root');

app.use(bodyParser.urlencoded({extended: false}));
app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var Student = sequelize.define('Student', {
  email: {
    type: Sequelize.STRING,
    validate: {
      len: [5,30],
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    notEmpty: true
  },
  firstname: {
   type: Sequelize.STRING,
   validate: {
    len: [1,30],
    is: ["^[a-z]+$",'i']
   },
   notEmpty: true
  },
  lastname: {
   type: Sequelize.STRING,
   validate: {
    len: [1,30],
    is: ["^[a-z]+$",'i']
   },
   notEmpty: true
  }
});


var Teacher = sequelize.define('Teacher', {
  email: {
    type: Sequelize.STRING,
    validate: {
      len: [5,30],
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    notEmpty: true
  },
  firstname: {
   type: Sequelize.STRING,
   validate: {
    len: [1,30],
    is: ["^[a-z]+$",'i']
   },
   notEmpty: true
  },
  lastname: {
   type: Sequelize.STRING,
   validate: {
    len: [1,30],
    is: ["^[a-z]+$",'i']
   },
   notEmpty: true
  }
});

Teacher.hasMany(Student);

app.use(session({
  secret: 'magnus rex',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 14
  },
  saveUninitialized: true,
  resave: false
}));

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/student/register', function(req, res) {
  res.render('student_registration');
});

app.get('/teacher/register', function(req, res) {
  res.render('teacher_registration');
});

app.get('/student/login', function(req, res) {
  res.render('teacher_login');
});

app.get('/teacher/login', function(req, res) {
  res.render('student_login');
});

app.post('/register', function(req, res) {
  var email = req.body.email;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  if(req.body.password.length > 5) {
    var password = sha256('diamonddogs' + req.body.password);
    User.create({email: email, firstname: firstname, password: password, lastname: lastname}).then(function(user) {
      req.session.authenticated = user;
      res.redirect('/?msg=' + 'you are logged in');
    }).catch(function(err) {
      console.log(err);
      res.redirect('/?msg=' + err.message);
    });
  } else {
    res.render('unauthed');
  }
});

app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = sha256('porkchopsandwiches' + req.body.password);

  User.findOne({
    where: {
      username: username,
      password: password
    }
  }).then(function(user) {
    if(user) {
      req.session.authenticated = user;
      res.redirect('/?msg=login successful');
    } else {
      res.redirect('/?msg=You failed at life');
    }
  }).catch(function(err) {
    throw err;
  });
});


app.get('/success', function(req, res) {
  if(req.session.authenticated) {
    res.render('success');
  } else {
    res.render('fail');
  }
});

sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log("LISTENING!");
  });
});