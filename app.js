var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongojs = require('mongojs');
var db = mongojs('MMS', ['members','accessToken']);
var ObjectId = mongojs.ObjectId;
var app = express();
var cookieParser = require('cookie-parser');
var jwt = require('jwt-express');

app.use(cookieParser());
app.use(jwt.init('secret'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
 
// Register Page
app.get('/registers', function(req, res){
        res.render('register');
});
app.post('/registers/add', function(req, res){
    var myDate = new Date();
    db.members.find({email: req.body.email}, function(err, member){
        if(member.length === 0){
            db.members.find({username: req.body.username}, function(er, mem){
                if(mem.length === 0){
                    var newMember = {
                        full_name:req.body.full_name,
                        email:req.body.email,
                        username:req.body.username,
                        password:req.body.password,
                        createDate:myDate
                    }
                        // Insert member to Database
                    db.members.insert(newMember, function(error, resule){
                        if(error){
                            Console.log(error);
                        }
                        res.send("success");
                    });
                } else {
                    res.status(422).send("username");
                } 
            });
        } else {
            res.status(422).send("email");
        } 
    });
});

// Member Page
app.get('/member',function(req, res){
     db.members.find(function(err, Data){
        res.render('member',{
            members: Data
            
        });
    });
});

// API find Token
app.get('/accessToken/find',function(req, res){
     db.accessToken.find(req.query,function(err, memberData){
        if(memberData.length === 0){
            res.status(400).send('token err !');
        } else {
            res.status(200).send('token seccess')
        }
    });
});

// Logout Page
app.post('/logout', function(req ,res){
    db.accessToken.find({tokenData: req.body.token},function(err, checkToken){
        if(checkToken.length === 0){
            res.status(400).send('logout err !');
        } else {
            db.accessToken.remove({tokenData: req.body.token},function(error, resule){
                if(error){
                    res.status(400).send('logout err !');
                } else {
                    res.status(204).send('Seccess');   
                }
            });
        }
    })
});

// Home
app.get('/', function(req, res){
    res.render('login');
});
 
// Logig Page
app.post('/login', function(req, res) {
    // Check username and Password form Database
    db.members.find({username : req.body.username,password:req.body.password}, function(err, userData){
        //console.log(userData);
        if(userData.length === 0){
            res.status(400).send('err !');
        } else {
            var date = new Date();
            var jwt = res.jwt({
                tokenData: req.body.username + date
            });
             var newToken = {
                username: req.body.username,
                tokenData:jwt.token
                }
            // Insert Token to Database
            db.accessToken.insert(newToken ,function(error, resule) {
                if(error){
                    console.log(error);
                }else {
                    res.send(jwt.token);
                }
            });
        }
    });
});

app.listen(3000, function(){
    console.log('Server Started on path 3000...')
})