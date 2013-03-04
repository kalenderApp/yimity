var mongodb = require("./db");

function Cat(cat){
	if (typeof cat != 'object') {
		return 
	} else {
		this.cat   = cat.cat;
		this.owner = cat.owner;
		this._id   = cat._id;
	}
}

module.exports = Cat;

Cat.getCatByUser = function(user,callback){
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 users 集合
		db.collection('cats', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
		// 为 name 属性添加索引
		//collection.ensureIndex("_id");
		// 写入 post 文档
		collection.find({owner:user}).toArray(function(err,docs){
				mongodb.close();
				if (err) {
					callback(err,null);
				}else{
					var cats = [];
					docs.forEach(function(doc,index){
						cats.push(new Cat(docs[index]));
					});
					callback(null,cats);
				};
			});//.limit(50);
		});
	})
}
Cat.prototype.saveCats = function(callback){
	var cat = this;
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 users 集合
		db.collection('cats', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
		// 为 name 属性添加索引
		collection.ensureIndex("_id");
		collection.ensureIndex("cat");
		// 写入 post 文档
		collection.update({cat:cat.cat,owner:cat.owner},{"$set":{cat:cat.cat,owner:cat.owner}}, { upsert: true,w:1},function(err,docs){
					mongodb.close();
					console.log(docs);
					if (err) {
						callback(err);
					} else {
						callback(null,docs);
					};
					
				});
			//mongodb.close();
			//callback(err);
		});
	})
};
exports.modifyCats = function(post_id,callback) {
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
		//collection.ensureIndex("_id");
		// 写入 post 文档
		collection.update({_id: new require('mongodb').ObjectID(post_id)},{"$set":{
				post_title : post.post_title,
				pt_content : post.pt_content,
				post_cat   : post.post_cat,
				post_tag   : post.post_tag,
				post_time  : post.post_time,
				post_owner : post.post_owner
			}});
		callback(null);
		mongodb.close();
		});
	})
};

Cat.prototype.deleteCatById = function(cat_id,cat_owner,callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 users 集合
		db.collection('cats', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
		// 为 name 属性添加索引
		//collection.ensureIndex("_id");
		// 写入 post 文档

		/*    查找相应 id 的文章    */
		collection.findOne({_id: new require('mongodb').ObjectID(cat_id),owner:cat_owner/*"ObjectId("+post_id+")"*/}, function(err, doc) {
			//mongodb.close();
			if (doc) {
				collection.remove({_id: new require('mongodb').ObjectID(cat_id)}, function(err,cat) {
					mongodb.close();
					if (!err) {
						callback(null,cat);
					} else {
						callback(err, null);
					}
				});
				/*collection.update({_id:doc._id},{"$set":{
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
					
				});*/
			
				// 封装文档为 User 对象
				//callback(null, post);
			}else{
				mongodb.close();
				callback(err, null);
				return false
			}
		});
		
		/*    查找相应 id 的文章    */
		//callback(null);
		//mongodb.close();
		});
	})
};