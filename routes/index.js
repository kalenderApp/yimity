
/*
 * GET home page.
 */
 var settings = require("../settings.js");
exports.index = function(req, res){
  res.render('index', { title: 'NodeJs',blogname:settings.blogname,blogdescription:settings.blogdescription,current:false });
};
