var express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var schema = mongoose.Schema;
var ejs = require('ejs')
var fs = require('fs')
var app = express();

app.use(bodyParser.urlencoded({
  extended:true
}))

app.use(session({
  secret:'@#@$MYSIGN#@$#$',
  resave: false,
  saveUninitialized:true
}));

mongoose.connect("mongodb://localhost/websojeon", function(err){
  if(err){
    console.log("DB Error!")
  }
  else {
    console.log("DB Connect Success!")
  }
})

var UserSchema = new schema({
  username : {
    type : String
  },
  id : {
    type : String
  },
  password : {
    type : String
  },
  percent : {
    type : String
  },
  exp : {
    type : String
  }
})

var User = mongoose.model('user',UserSchema);

app.listen(3000, function(err){
  if(err){
    console.log('Server Error!')
    throw err
  }
  else {
    console.log('Server Running At 3000 Port!')
  }
})

app.get('/', function(req, res){
  res.redirect('/login')
})

app.get('/login', function(req, res){
  req.session.destroy(function(){
    req.session;
  });
  fs.readFile('login.ejs', 'utf-8', function (error, data){
      res.send(data);
  });
})

app.post('/login', function(req, res){
  var body = req.body;
  User.findOne({
    id : body.id
  }, function(err, result){
    if(err){
      console.log('Login Error!')
      throw err
    }
    else if(result){
      if(result.password == body.password){
        console.log('Login : '+ result.username)
        console.log('Data : '+ result)
        req.session.username == result.username
        req.session.id == result.id
        req.session.password == result.password
        req.session.percent = result.percent
        req.session.exp = result.exp
        res.redirect('/game')
      }
    }
    else {
      res.redirect('/')
    }
  })
})

app.get('/register', function(req, res){
  fs.readFile('register.html', 'utf-8', function(err, data){
    res.send(data)
  })
})

app.post('/register', function(req, res){
  var body = req.body;
  user = new User({
    username: body.username,
    id: body.id,
    password: body.password,
    percent : '0',
    exp : '0'
  })

  User.findOne({
    id: body.id
  }, function(err, result){
    if(err){
      console.log("/insert Error")
      throw err
    }
    if(result){
      res.redirect('/')
    }
    else {
      user.save(function(err){
        if(err){
          console.log("save Error")
          throw err
        }
        else {
          console.log(body.username+" save success")
          res.redirect('/')
        }
      })
    }
  })
})

app.get('/logout', function(req, res){
  res.redirect('/')
})

app.get('/game', function(req, res){
  fs.readFile('game.ejs', 'utf-8', function(err, data){
    res.end(ejs.render(data, {
      exp: req.session.exp,
      percent : req.session.percent
    }))
  })
})

app.post('/game', function(req, res){
  var body = req.body;
  req.session.percent == body.percent
  req.session.exp = body.exp
  res.redirect('/game')
})
