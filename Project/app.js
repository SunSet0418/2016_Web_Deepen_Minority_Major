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
  level : {
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
        req.session.username == result.username
        req.session.id == result.id
        req.session.password == result.password
        req.session.level = result.level
        req.session.exp = result.exp
        if(result.level==1){
          req.session.per = 100;
        }
        else {
          req.session.per = 100+(200*result.level);
        }
        res.redirect('/game')
      }
      else if(result.password == body.password){
        console.log('Password Error!')
        res.redirect('/')
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
    level : "1",
    exp : "0"
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
  if(req.session.exp == req.session.per){
    res.redirect('/level')
  }
  fs.readFile('game.ejs', 'utf-8', function(err, data){
    res.end(ejs.render(data, {
      exp: req.session.exp,
      level : req.session.level,
      per : req.session.per
    }))
  })
})

// app.post('/game', function(req, res){
//   var body = req.body;
//   if(req.session.exp == req.session.per){
//     res.redirect('/level')
//   }
//   else {
//     req.session.level == body.level
//     req.session.exp = body.exp
//     res.redirect('/game')
//   }
// })

app.get('/exp', function(req, res){
  req.session.exp++;
  res.redirect('/game')
})

app.get('/level', function(req, res){
  console.log(req.session.level)
  console.log(req.session.exp)
  req.session.level++;
  console.log(req.session.level)
  req.session.exp = 0;
  console.log(req.session.exp)
  req.session.per = 100+(200*req.session.level);
  console.log(req.session.per)
  res.redirect('/game')
})
