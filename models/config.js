var mongodb = require("./db");

function Config(config){
	if (typeof config != 'object') {
		return 
	} else {
		this.blogname        = config.blogname;
		this.blogdescription = config.blogdescription;
		this.createtime      = config.createtime || (new Date).getTime();
		this.blogowner       = config.blogowner
	};
}

module.exports = Config;

Config.prototype.saveConfig = function(user,callback){
	var config = this;
	//获取此 id 文章
	//判断此用户是否由此文章
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 users 集合
		db.collection('config', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
		/*    查找相应 id 的文章    */
		//collection.findOne({blogowner:user}, function(err, doc) {
		//	if (doc) {
			console.log(config);
	console.log("config");
				collection.update({blogowner:user},{"$set":config},{upsert:true, w: 1},function(err,docs){
					mongodb.close();
					console.log(err);
					if (err) {
						callback(err);
					} else {
						callback(null,docs);
					};
					
				});
		//	}else{
		//		mongodb.close();
		//		callback("err", null);
		//		return false
		//	}
		//});
		});
	})
}