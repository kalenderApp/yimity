
/**
 * Module dependencies.
 */

var express    = require('express'),
    routes     = require('./routes'),
    user       = require('./routes/user'),
    register   = require('./routes/register'),
    http       = require('http'),
    path       = require('path'),
    MongoStore = require("connect-mongo")(express),
    settings   = require("./settings");

var app        = express();
thesession = false;

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  //app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(settings.cookiesecret));
  app.use(express.session({
    Store  : new MongoStore({
      db   : settings.db
    })
  }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public'), {maxAge:31557600000}));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', /*routes.index*/function(req,res){
  if (req.session.user) {
    thesession = true;
    routes.index(req,res);
  } else {
    thesession = false;
    routes.index(req,res);
  };
});
//app.get('/hello/:email', routes.hello);
//app.get('/users', user.list);
app.get('/register/:do',function(req,res,next){
  if (req.params.do) {
    register[req.params.do](req, res);
    return;
  } else {
    next();
  };
});
app.get('/register',function(req,res){
  if (req.session.user) {
    thesession = true;
    //register.membercenter(req,res);
    res.redirect('/mcenter');
  } else {
    thesession = false;
    register.register(req,res);
  };
});
app.post('/register',function(req,res){
  if (req.session.user) {
    thesession = true;
    //register.membercenter(req,res);
    res.redirect('/mcenter');
  } else {
    thesession = false;
    register.doregister(req,res);
  };
});
app.get('/login',function(req,res){
  if (req.session.user) {
    thesession = true;
    //register.membercenter(req,res);
    res.redirect('/mcenter');
  } else {
    thesession = false;
    register.login(req,res);
  };
});
app.post('/login',function(req,res){
  if (req.session.user) {
    thesession = true;
    res.redirect('/mcenter');
  } else {
    thesession = false;
    register.dologin(req,res);
  };
});
app.get('/logout', function(req, res) {
  req.session.user = null;
  //res.send('{"code"1:"msg":"登出成功"}');
  res.redirect('/');
});
app.get('/mcenter',function(req,res){
  if (req.session.user) {
    thesession = true;
    register.membercenter(req,res);
  } else {
    thesession = false;
    register.login(req,res);
  };
});
app.get('/post_new',function(req,res){
  if (req.session.user) {
    thesession = true;
    register.post(req,res);
  } else {
    thesession = false;
    register.login(req,res);
  };
});
app.post('/post_new',function(req,res){
  if (req.session.user) {
    thesession = true;
    register.dopost(req,res);
  } else {
    thesession = false;
    //register.login(req,res);
    res.redirect('/login');
  };
});

app.get('/post_list',function(req,res){
  if (req.session.user) {
    thesession = true;
    register.postlist(req,res);
  } else {
    thesession = false;
    register.login(req,res);
  };
});

app.get('/post/:id',function(req,res){
  if (req.params.id) {
    register.postById(req, res);
    return;
  } else {
    res.redirect('/');
  };
});

app.get('/edit/:id',function(req,res){
  if (req.params.id) {
    if (req.session.user) {
      register.postEditGetById(req, res);
      return;
    }else{
      res.redirect('/login');
    };
  } else {
    res.redirect('/');
  };
});
app.post('/edit/:id',function(req,res){
  if (req.params.id) {
    if (req.session.user) {
      register.postEditById(req, res);
      return;
    }else{
      res.redirect('/login');
    };
  } else {
    res.send('{"code":"0","msg":"请输入有效地文章ID"}');
    //res.redirect('/');
  };
});
app.get('/delete/:id',function(req,res){
  if (req.params.id) {
    if (req.session.user) {
      register.postDeleteById(req, res);
      return;
    }else{
      res.send('{"code":"0","msg":"请登录后管理！"}');
    };
  } else {
    res.send('{"code":"0","msg":"请输入有效地文章ID"}');
    //res.redirect('/');
  };
});


app.get('/cats',function(req,res){
  if (req.session.user) {
    thesession = true;
    register.cats(req,res);
  } else {
    thesession = false;
    register.login(req,res);
  };
});

app.post('/cats',function(req,res){
  if (req.session.user) {
    thesession = true;
    register.saveCats(req,res);
  } else {
    thesession = false;
    res.send('{"code":"0","msg":"请登录后管理！"}');
  };
});

app.get('/deletecatby/:id',function(req,res){
  if (req.session.user && req.params.id) {
    thesession = true;
    register.removeCatById(req,res,req.params.id);
  } else {
    thesession = false;
    res.send('{"code":"0","msg":"请登录后管理！"}');
  };
});

//系统设置
app.get('/config',function(req,res){
  if (req.session.user) {
    thesession = true;
    register.config(req,res);
  } else {
    thesession = false;
    register.login(req,res);
  };
});

app.post('/saveConfig',function(req,res){
  if (req.session.user) {
    thesession = true;
    register.saveConfig(req,res);
  } else {
    thesession = false;
    res.send('{"code":"0","msg":"请登录后管理！"}');
  };
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
