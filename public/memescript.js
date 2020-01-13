$(document).ready(function() {

  $("#postcomment-button").click(function(e) {
  //	e.preventDefault()
  })
  const hostName = "https://msrch.herokuapp.com";
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
							//compile handlebars script into comment and append to the page!!
				comments.forEach( function(comment) {
					
					var commentData = {
					comment: comment.comments.comment,
					authorName: comment.comments.authorName,
					datePosted: comment.comments.datePosted,
					userAvvy: comment.authorUserInfo.avvy,
					useLink: comment.authorUserInfo.username,
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