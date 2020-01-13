$(document).ready(function() {
const hostName = "https://msrch.herokuapp.com";
$("#comments").click(function(e) {
	var cmtId;

	if (e.target.className == "delete-comment") {
			cmtId = e.target.id;
	}
	$.ajax({
		url: hostName + '/deletecomment',
		type: 'POST',
		data: {
			cmtId: cmtId
		},
		success: function() {
			console.log("comment deleted")
			$("#wrap-"+cmtId).fadeOut();
		},
		error: function(err) {
			console.log("error ", err)
		}
	})
})
  var memeId = $("#memeId").val();
  console.log(memeId)
  function loadComments() {

  	$.ajax({
			url: hostName + '/getcomments',
			type: 'POST',
			data: {
				memeId: memeId
			},
			success: function(comments) {
				comments.forEach( function(comment) {
					var commentData = {
					commentId: comment.comments._id,
					comment: comment.comments.comment,
					authorName: comment.comments.authorName,
					datePosted: comment.comments.datePosted,
					userAvvy: comment.authorUserInfo.avvy,
					userLink: comment.authorUserInfo.username,
					clout: comment.authorUserInfo.clout
				}
				console.log("cmttdata is")
					console.log(commentData)
				var cmtTemplateSource = document.getElementById("cmttemplate").innerHTML;
				var cmtTemplate = Handlebars.compile(cmtTemplateSource);
				var	renderedCmt = cmtTemplate(commentData)
	

				commentDivToPopulate = document.getElementById("comments")
				var commentsDiv = document.createElement("div")
				commentsDiv.setAttribute('id', 'comments-populate')
				commentDivToPopulate.appendChild(commentsDiv)

				$("#comments-populate").append(renderedCmt)
				//commentDiv.innerHTML = renderedCmt;
					})
				       			 
			},
			error: function() {
				console.log('ajax fail')
			}


		})
  }
  loadComments();

})