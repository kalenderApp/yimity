var User = require("../models/user.js");
var Posts = require("../models/post.js");
var Cat = require("../models/cats.js");
var Config = require("../models/config.js");
var settings = require("../settings.js");
var crypto = require('crypto');
exports.register = function(req, res){
	/*
	if (req.params.do == 'validate') {
		res.send('{"code":1,"msg":"可以注册！"}');
	} else {
		res.send('{"code":0,"msg":"邮箱不可以注册！"}');
	};
	*/
	res.render('register', { title: '注册',blogname:settings.blogname,current:"register"});
};

exports.doregister = function(req, res){
	if (req.body['password'] !== req.body['repassword']) {
		res.send('{"code":0,"msg":"两次密码不一致！"}');
	} else {
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		var newUser = new User({
				email    : req.body["email"],
				password : password
			});
		newUser.save(function(err){
			if (err) {
				res.send('{"code":3,"msg":"服务器错误，请稍后重试！"}');
			} else {
				res.send('{"code":1,"msg":"注册成功！"}');
				//res.redirect("/");
				req.session.user = newUser.email;
			}
		})
	}
};
exports.login = function(req, res){
	/*
	if (req.params.do == 'validate') {
		res.send('{"code":1,"msg":"可以注册！"}');
	} else {
		res.send('{"code":0,"msg":"邮箱不可以注册！"}');
	};
	*/
	res.render('login', { title: '登录',blogname:settings.blogname,current:"login" });
};
exports.dologin = function(req, res){
	var md5 = crypto.createHash('md5');
	if (req.body.email) {
		if (req.body.password.length < 6) {
			res.send('{"code":0,"msg":"请输入正确的密码！"}');
		} else {
			//console.log(req.body.email);
			User.get(req.body.email,function(err,user){
				//console.log(user);
				if (user) {
					if (user.email === req.body.email && user.password === md5.update(req.body.password).digest('base64')) {
						req.session.user = user.email;
						//console.log(req.session.user);
						res.send('{"code":1,"msg":"登陆成功！"}');
						//res.redirect("/");
					} else {
						res.send('{"code":0,"msg":"登录失败，用户名或者密码不匹配！"}');
					};
				} else {
					res.send('{"code":2,"msg":"登录失败，没有此用户名！"}');
				};
				if (err) {
					res.send('{"code":3,"msg":"服务器错误！"}');
				}
			});
		};
	} else {
		res.send('{"code":4,"msg":"用户名不可以为空！"}');
	};
	/*
	if (req.params.do == 'validate') {
		res.send('{"code":1,"msg":"可以注册！"}');
	} else {
		res.send('{"code":0,"msg":"邮箱不可以注册！"}');
	};
	*/
	//res.render('login', { title: '登录',current:"login" });
};

exports.validate = function(req, res){
	//if (req.params.do == 'validate') {
		User.get(req.query.email,function(err,user){
			//console.log(user);
			if (user) {
				res.send('{"code":0,"msg":"用户已存在！"}');
			} else {
				res.send('{"code":1,"msg":"可以注册！"}');
			};
			if (err) {
				res.send('{"code":3,"msg":"重复注册或服务器错误！"}');
			}
		});
		
	//} else {
	//	res.send('{"code":0,"msg":"邮箱不可以注册！"}');
	//};
};


exports.membercenter = function(req, res){
	/*
	if (req.params.do == 'validate') {
		res.send('{"code":1,"msg":"可以注册！"}');
	} else {
		res.send('{"code":0,"msg":"邮箱不可以注册！"}');
	};
	*/
	User.get(req.session.user,function(err,user){
		if (user) {
			var post = new Posts();
			post.size(req.session.user,function(err,sizes){
				if (err) {
					//console.log(err);
					res.send('{"code":3,"msg":"服务器错误！"}');
				} else {
					res.render('member_center', {"email":user.email,title:"个人中心 - 首页",blogname:settings.blogname,size:sizes||0});
					//res.redirect("/");
					//req.session.user = newUser.email;
				}
			})
			
		} else {
			res.render('index', { "title": 'NodeJs',blogname:settings.blogname,current:false });
		};
		if (err) {
			res.render('index', { "title": 'NodeJs',blogname:settings.blogname,current:false });
			res.send('{"code":3,"msg":"重复注册或服务器错误！"}');
		}
	});

	
};


exports.post = function(req, res){
	Cat.getCatByUser(req.session.user,function(err,cats){
			if (cats) {
			//	posts.title    = '文章列表';
			//	posts.blogname = settings.blogname;
			//	posts.current  = false;
				//res.render('post_list', posts);
				console.log(cats);
				res.render('post_new', { title: '发表新文章',blogname:settings.blogname,current:"login",cats:cats });
				//res.send('{"code":0,"msg":"用户已存在！"}');
			} else {
				res.render('post_new', { title: '发表新文章',blogname:settings.blogname,current:"login",cats:[] });
			};
			if (err) {
				//res.send('{"code":3,"msg":"重复注册或服务器错误，请稍后重试！"}');
				res.render('post_new', { title: '发表新文章',blogname:settings.blogname,current:"login",cats:null });
			}
		});
	//res.render('post_new', { title: '发表新文章',blogname:settings.blogname,current:"login" });
};

exports.dopost = function(req, res){
	if (req.body['post_title'] === '') {
		res.send('{"code":0,"msg":"标题不能为空！"}');
	} else {
		var newPost = new Posts({
				post_title    : req.body.post_title,
				pt_content    : req.body.pt_content,
				post_cat      : req.body.post_cat,
				post_tag      : req.body.post_tag,
				post_time     : req.body.post_time || (new Date).getTime(),
				post_owner    : req.session.user
			});
		newPost.save(function(err,post_id){
			if (err) {
				//console.log(err);
				res.send('{"code":3,"msg":"服务器错误！"}');
			} else {
				res.send('{"code":1,"msg":"发表成功","post_id":"'+post_id+'"}');
				//res.redirect("/");
				//req.session.user = newUser.email;
			}
		})
	}
};


exports.postlist = function(req, res){
	Posts.getPostByUser(req.session.user,function(err,posts){
			if (posts) {
			//	posts.title    = '文章列表';
			//	posts.blogname = settings.blogname;
			//	posts.current  = false;
				//res.render('post_list', posts);
				res.render('post_list', { title: '文章列表',blogname:settings.blogname,current:"login",posts:posts });
				//res.send('{"code":0,"msg":"用户已存在！"}');
			} else {
				res.render('post_list', { title: '文章列表',blogname:settings.blogname,current:"login",posts:[] });
			};
			if (err) {
				//res.send('{"code":3,"msg":"重复注册或服务器错误，请稍后重试！"}');
				res.render('post_list', { title: '文章列表',blogname:settings.blogname,current:"login",posts:null });
			}
		});
	
};

exports.postById = function(req, res){
	Posts.getPostById(req.params.id,function(err,post){
			if (err) {
				post = new Posts();
				post.post_title="此文章已经不存在了!";
				post.pt_content = "";
				post._id ="";
				post.blogname = settings.blogname;
				post.blogdescription = settings.blogdescription;
				post.current  = false;
				//res.send('{"code":3,"msg":"重复注册或服务器错误，请稍后重试！"}');
				res.render('post',post );
			}

			if (post) {
				post.title    = '文章内容';
				post.blogname = settings.blogname;
				post.blogdescription = settings.blogdescription;
				post.current  = false;
				res.render('post', post);
				//res.render('post_list', { title: '文章列表',blogname:settings.blogname,current:"login",posts:posts });
				//res.send('{"code":0,"msg":"用户已存在！"}');
			} else {
				post = new Posts();
				post.post_title="此文章已经不存在了。";
				post.pt_content = "";
				post._id ="";
				post.blogname = settings.blogname;
				post.blogdescription = settings.blogdescription;
				post.current  = false;
				res.render('post',post );
			};
		});
	
};

exports.postEditGetById = function(req, res){
	Posts.getPostById(req.params.id,function(err,post){
			if (err) {
				//res.send('{"code":3,"msg":"重复注册或服务器错误，请稍后重试！"}');
				post = new Posts();
				post.post_title="此文章已经不存在了。";
				post.pt_content = "";
				post._id ="";
				post.blogname = settings.blogname;
				post.blogdescription = settings.blogdescription;
				post.current  = false;
				res.render('post',post );
			}



			Cat.getCatByUser(req.session.user,function(err,cats){
			if (cats) {
					//console.log(cats);


			if (post) {
				post.title    = '文章内容';
				post.blogname = settings.blogname;
				post.blogdescription = settings.blogdescription;
				post.current  = false;
				post.cat = cats;
				if (req.session.user === post.post_owner) {
					res.render('post_edit', post);
				} else {
					//res.render('post', post);
					res.redirect('/post/'+req.params.id);
				};
				//res.render('post_list', { title: '文章列表',blogname:settings.blogname,current:"login",posts:posts });
				//res.send('{"code":0,"msg":"用户已存在！"}');
			} else {
				post = new Posts();
				post.post_title="此文章已经不存在了。";
				post.pt_content = "";
				post._id ="";
				post.blogname = settings.blogname;
				post.blogdescription = settings.blogdescription;
				post.current  = false;
				post.cat = cats;
				res.render('post',post );
			};

}
});

		});
	
};

exports.postEditById = function(req, res){
	if (req.body['post_title'] === '') {
		res.send('{"code":0,"msg":"标题不能为空！"}');
	} else {
		var newPost = new Posts({
				post_title    : req.body.post_title,
				pt_content    : req.body.pt_content,
				post_cat      : req.body.post_cat,
				post_tag      : req.body.post_tag,
				post_time     : req.body.post_time || (new Date).getTime(),
				post_owner    : req.session.user
			});
		newPost.modify(req.params.id,req.session.user,function(err){
			if (err) {
				res.send('{"code":3,"msg":"服务器错误！"}');
			} else {
				res.send('{"code":1,"msg":"更新成功"}');
				//res.redirect("/");
				//req.session.user = newUser.email;
			}
		})
	}
	
};

exports.postDeleteById = function(req, res){
	if (req.params.id === '') {
		res.send('{"code":0,"msg":"请输入正确的文章id！"}');
	} else {
		var post = new Posts();
		post.deletePostById(req.params.id,function(err){
			if (err) {
				res.send('{"code":3,"msg":"服务器错误！"}');
			} else {
				res.send('{"code":1,"msg":"删除成功"}');
				//res.redirect("/");
				//req.session.user = newUser.email;
			}
		})
	}
	
};

exports.cats = function(req, res){
	Cat.getCatByUser(req.session.user,function(err,cats){
			if (cats) {
			//	posts.title    = '文章列表';
			//	posts.blogname = settings.blogname;
			//	posts.current  = false;
				//res.render('post_list', posts);
				res.render('cats', { title: '添加新分类',blogname:settings.blogname,current:"login",cats:cats });
				//res.send('{"code":0,"msg":"用户已存在！"}');
			} else {
				res.render('cats', { title: '添加新分类',blogname:settings.blogname,current:"login",cats:[] });
			};
			if (err) {
				//res.send('{"code":3,"msg":"重复注册或服务器错误，请稍后重试！"}');
				res.render('cats', { title: '添加新分类',blogname:settings.blogname,current:"login",cats:null });
			}
		});
	//res.render('cats', { title: '添加新分类',blogname:settings.blogname,current:false });
};

/*
exports.getCats = function(req, res){
	res.render('cats', { title: '添加新分类',blogname:settings.blogname,current:false });
};
*/
exports.saveCats = function(req, res){
	if (req.body.cat) {
		var newCats = new Cat({
			cat  :req.body.cat,
			owner:req.session.user
		})
		newCats.saveCats(function(err,cats){
			if (err) {
				res.send('{"code":0,"msg":"添加失败，请重试！"}');
			} else {
				res.send('{"code":1,"msg":"添加文章分类成功","content":"'+ cats +'"}');
			};
		});
	}else{
		res.send('{"code":0,"msg":"文章分类不可以为空！"}');
	};
	
	//res.render('cats', { title: '添加新分类',blogname:settings.blogname,current:false });
};
exports.removeCatById = function(req, res,id){
	if (id) {
		var newCat = new Cat();
		newCat.deleteCatById(id,req.session.user,function(err,cats){
			console.log(err);
			if (err) {
				res.send('{"code":0,"msg":"添加文章分类失败，请重试！"}');
			} else {
				res.send('{"code":1,"msg":"删除文章分类成功","content":"'+ cats +'"}');
			};
		});
	}else{
		res.send('{"code":0,"msg":"文章分类不可以为空！"}');
	};
	
	//res.render('cats', { title: '添加新分类',blogname:settings.blogname,current:false });
};



//系统设置
exports.config = function(req,res){
	res.render('config', { title: '系统设置',blogname:settings.blogname,current:false });
}
exports.saveConfig = function(req,res){
	var config = new Config({
		blogname        : req.body.blogname,
		blogdescription : req.body.blogdescription,
		createtime     : req.body.create_time || (new Date).getTime(),
		blogowner      : req.session.user
	});
	config.saveConfig(req.session.user,function(err,doc){
		if (err) {
			res.send('{"code":0,"msg":"更新失败，请重试！"}');
		} else {
			res.send('{"code":1,"msg":"更新成功","content":"'+ doc +'"}');
		};
	})
	//res.render('config', { title: '系统设置',blogname:settings.blogname,current:false });
}
