var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;

var Sequelize = require('sequelize');
var sequelize = new Sequelize('auth_db', 'root');

var passport = require('passport');
var passportLocal = require('passport-local');

app.use(require('express-session')({
 secret: 'magnusrex',
 cookie: { secure: false,
  maxAge: 1000 * 60 * 60 * 24 * 14
 },
 saveUninitialized: true,
 resave: true
}));
app.use(passport.initialize());
app.use(passport.session());

//passport use methed as callback when being authenticated
passport.use(new passportLocal.Strategy(function(username, password, done) {
    //check password in db
    User.findOne({
     where: {
      username: email
     }
    }).then(function(user) {
        //check password against hash
        if(user){
         bcrypt.compare(password, user.dataValues.password, function(err, user) {
          if (user) {
                  //if password is correct authenticate the user with cookie
                  done(null, { id: username, username: username });
                 } else{
                  done(null, null);
                 }
                });
        } else {
         done(null, null);
        }
       });
   }));

var session = require('express-session');
var bcrypt = require('bcryptjs');

//change the object used to authenticate to a smaller token, and protects the server from attacks
passport.serializeUser(function(user, done) {
 done(null, user.id);
});
passport.deserializeUser(function(id, done) {
 done(null, { id: id, username: id })
});

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

var expressHandlebars = require('express-handlebars');
app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var Student = sequelize.define('Student', {
 email: {
  type: Sequelize.STRING,
  validate: {
   len: {
    args: [5,30],
   },
   isEmail: true
  },
  unique: true,
  allowNull: false
 },
 password: {
  type: Sequelize.STRING,
  validate: {
   len: {
    args: [5,12],
    msg: "Your password must contain 5-12 characters"
   }
  },
   allowNull: false
 },
 firstname: {
  type: Sequelize.STRING,
  validate: {
   len: {
    args: [1,30],
    msg: "You must havea first name"
   }
  },
  allowNull: false
 },
 lastname: {
  type: Sequelize.STRING,
  validate: {
   len: {
    args: [2,30],
    msg: "You must have a last name"
   }
  },
  allowNull: false
 }
}, {
 hooks: {
  beforeCreate: function(input){
   input.password = bcrypt.hashSync(input.password, 10);
  }
 }
});

var Teacher = sequelize.define('Teacher', {
 email: {
  type: Sequelize.STRING,
  validate: {
   len: [5,30],
   isEmail: true
  },
  allowNull: false,
  unique: true
 },
 password: {
  type: Sequelize.STRING,
  allowNull: false,
  validate: {
   len: {
    args: [3,12],
    msg: "Your password must contain 3-12 characters"
   }
  }
 },
 firstname: {
  type: Sequelize.STRING,
  validate: {
   len: {
    args: [1,30],
    msg: "You must have a first name"
   }
  },
  allowNull: false
 },
 lastname: {
  type: Sequelize.STRING,
  validate: {
   len: {
    args: [1,30],
    msg: "You must have a last name"
   }
  },
  allowNull: false
 }
}, {
 hooks: {
  beforeCreate: function(input){
   input.password = bcrypt.hashSync(input.password, 10);
  }
 }
});

Teacher.hasMany(Student);



app.get('/', function(req, res) {
 res.render('index', {msg: req.query.msg});
});

app.get('/register', function(req, res) {
 res.render('registration');
});

app.get('/login/student', function(req, res) {
 res.render('student_login');
});

app.get('/login/teacher', function(req, res) {
 res.render('teacher_login');
});

app.get('/home', function(req, res){
 res.render('home', {
  user: req.user,
  isAuthenticated: req.isAuthenticated()
 });
})

app.post('/register/student', function(req, res) {

 Student.create(req.body).then(function(user) {
  res.redirect('/?msg=' + 'you are registered');
 }).catch(function(err) {
  console.log(err);
  res.redirect('/?msg=' + err.message);
 });
});

app.post('/register/teacher', function(req, res) {

 Teacher.create(req.body).then(function(user) {
  res.redirect('/?msg=' + 'you are registered');
 }).catch(function(err) {
  console.log(err);
  res.redirect('/?msg=' + err.message);
 });
});

app.post('/login/student', passport.authenticate('local',{
 successRedirect: '/success',
 failureRedirect: '/msg=Login Credentials do not work'
}));

app.post('/login/teacher', passport.authenticate('local',{
 successRedirect: '/success',
 failureRedirect: '/msg=Login Credentials do not work'
}));



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