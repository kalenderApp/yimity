var mongodb = require("./db");

function Posts(post/*obj*/){
	if (typeof post != 'object') {
		return 
	} else {
		this._id           = post._id || null;
		this.post_title    = post.post_title;
		this.pt_content    = post.pt_content;
		this.post_cat      = post.post_cat;
		this.post_tag      = post.post_tag;
		this.post_time     = post.post_time || (new Date).getTime();
		this.post_owner    = post.post_owner
	};
}

module.exports = Posts;

Posts.prototype.save = function(callback) {
	var post = {
		//_id           : this._id || null,
		post_title    : this.post_title,
		pt_content    : this.pt_content,
		post_cat      : this.post_cat,
		post_tag      : this.post_tag,
		post_time     : this.post_time || (new Date).getTime(),
		post_owner    : this.post_owner
	}
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 users 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
		// 为 name 属性添加索引
		collection.ensureIndex("_id");
		// 写入 post 文档
		collection.insert(post, {safe: true}, function(err, post) {
			mongodb.close();
			callback(err, post[0]._id);
			});
		});
	})
};

Posts.prototype.modify = function(post_id,post_owner,callback) {
	var post = {
		//_id           : this._id || null,
		post_title    : this.post_title,
		pt_content    : this.pt_content,
		post_cat      : this.post_cat,
		post_tag      : this.post_tag, 
		post_time     : this.post_time || (new Date).getTime(),
		post_owner    : this.post_owner  
	}

	//获取此 id 文章
	/*
	post.(post_id,function(err,post){
		if (err) {
			callback("err");
			return false
		}
		if (!post) {
			callback("err");
			return false
		}
	})
	*/



	//判断此用户是否由此文章




	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 users 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
		// 为 name 属性添加索引
		//collection.ensureIndex("_id");
		// 写入 post 文档

		/*    查找相应 id 的文章    */
		collection.findOne({_id: new require('mongodb').ObjectID(post_id),post_owner:post_owner/*"ObjectId("+post_id+")"*/}, function(err, doc) {
			//mongodb.close();
			if (doc) {
				collection.update({_id:doc._id},{"$set":{
					post_title : post.post_title,
					pt_content : post.pt_content,
					post_cat   : post.post_cat,
					post_tag   : post.post_tag,
					post_time  : post.post_time
					//post_owner : post.post_owner
				}},{upsert:false, w: 1},function(err,docs){
					mongodb.close();
					if (err) {
						callback(err);
					} else {
						callback(null);
					};
					
				});
			
				// 封装文档为 User 对象
				//callback(null, post);
			}else{
				mongodb.close();
				callback("err", null);
				return false
			}
		});
		
		/*    查找相应 id 的文章    */
		//callback(null);
		//mongodb.close();
		});
	})
};





Posts.getPostByUser = function get(post_owner, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 users 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 查找 name 属性为 username 的文档
			collection.find({post_owner: post_owner}).toArray(function(err, docs) {
				mongodb.close();
				if (docs) {
					// 封装文档为 User 对象
					var posts = [];
					docs.forEach(function(doc,index){
						posts.push(new Posts(docs[index]));
					});
					//var posts = new Posts(doc);
					//console.log(posts);
					callback(null, posts);
				} else {
					callback(err, null);
				}
			});
		});
	});
};

Posts.getPostById = function get(post_id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 users 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 查找 name 属性为 username 的文档
			collection.findOne({_id: new require('mongodb').ObjectID(post_id)/*"ObjectId("+post_id+")"*/}, function(err, doc) {
				mongodb.close();
				//console.log(doc);
				if (doc) {
					// 封装文档为 User 对象
					var post = new Posts(doc);
					callback(null, post);
				} else {
					callback("err", null);
				}
			});
		});
	});
};
Posts.prototype.deletePostById = function get(post_id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 users 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 查找 name 属性为 username 的文档
			collection.remove({_id: new require('mongodb').ObjectID(post_id)}, function(err) {
				mongodb.close();
				if (!err) {
					callback(null);
				} else {
					callback(err, null);
				}
			});
		});
	});
};

Posts.prototype.size = function(post_owner, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 users 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 查找 name 属性为 username 的文档
			collection.find({post_owner: post_owner}).toArray(function(err, docs) {
				mongodb.close();
				console.log(docs);
				if (docs) {
					callback(null, docs.length||0);
				} else {
					callback(err, null);
				}
			});
		});
	});
};


function getNextSequence(db,obj) {
   var ret = db.posts.findAndModify(
          {
            query: { _id: obj.post_id },
            update: { $inc: { seq: 1 } },
            new: true
          }
   );

   return ret.seq;
}