/**
 * http://usejsdoc.org/
 */
function post(req,res){
	var currentUser = req.session.user;
	var post = req.body.post;
	var post_insert = new Post(currentUser,post,new Date());
	post_insert.save(function(err){
		if(err){
			req.flash("error",err);
			return res.redirect("/");
		}
		req.flash("success","发表成功");
		res.redirect("/u/"+currentUser.user_name);
	})
}