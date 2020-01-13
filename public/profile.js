$(document).ready(function(){
var thisUserProfile = $("#thisUserProfile").val();
var pageNum = 1;
var initSearchScroll = true;
var lastMemeId;
const hostName = "https://msrch.herokuapp.com";

//notification bell logic
$("#notification-bell").click(function(e) {
	$("#notifications-list").fadeToggle();
})
//new notification logic
$("#new-notification-close").click(function(e) {
	$("#new-notification-alert").fadeToggle();
})
//profile update logic
const updateBlurb = function() {
	console.log("updating blurb")
	if (!$("#edit-profile-blurb").val()) {
		return console.log("no new blurb");
	} else {
		const newBlurb = $("#edit-profile-blurb").val();
		const dataObj = {
			profileBlurb: newBlurb
		}
		console.log("updating blurb with ", dataObj.profileBlurb);
		profileDataPass(dataObj);
	}
}
$("#edit-profile-submit").click(function(e) {
	e.preventDefault();
	const formData = new FormData();
	//const myFile = $("#edit-profile-avvy")[0].files[0];
	const myFile = document.getElementById("edit-profile-avvy");
	var grabFile;
	if (myFile.files.length == 0) {
		console.log("no file selected");
		//if no file, update the blurb
		return updateBlurb();
	} else {
		//if file, send file and blurb value
		grabFile = $("#edit-profile-avvy")[0].files[0];
		formData.append('file', grabFile);
		formData.append('upload_preset', 'zxggx0o3');
	}
	$.ajax({
		url:"https://api.cloudinary.com/v1_1/dx3ezvpsy/image/upload",
		type:"POST",
		processData: false,
		contentType: false,
		data: formData,
		success: function(data) {
			console.log("upload success");
			const avvyUrl = data.secure_url;
			const newBlurb = $("#edit-profile-blurb").val();
			profileObj = {
				avvyUrl: avvyUrl,
				profileBlurb: newBlurb
			}
			profileDataPass(profileObj);	
		}
	})

})
const profileDataPass = function(profileData) {
	console.log("profileDataPass, update object is ", profileData);
	$.ajax({
		url: (hostName + "/updateprofile"),
		type:"POST",
		data: profileData,
		success: function() {
			window.location= (hostName + "/profile");
		}
	})
}
//delete profile logic
$("#delete-account-link-text").click(e => {
	console.log("delete account link clicked");
	$("#delete-profile-confirm-div").fadeToggle();
})

$("#close-delete-confirm-div").click(e => {
	e.preventDefault();
	$("#delete-profile-confirm-div").fadeToggle();
})
//spinny frog
$("#submit-upload").click(e => {
	$("#submit-upload").fadeToggle(function() {
			$("#loading-div").fadeToggle();
	});
})
//upload logic
$("#submit-upload").click(function(e) {
	e.preventDefault();
	const filesCheck = document.getElementById("selectedFile");
	if (filesCheck.files.length == 0) {
		return console.log("stopping submit - nothing selected");
	}

	const formData = new FormData();
	const myFile = $("#selectedFile")[0].files[0]; 
	formData.append( 'file', myFile );
	formData.append( 'upload_preset', 'zxggx0o3');
	console.log("formData is ", formData);
	$.ajax({
	url:"https://api.cloudinary.com/v1_1/dx3ezvpsy/image/upload",
	type:"POST",
	processData: false,
	contentType: false,
	data: formData,
	success: function(data) {
		console.log("success, data is ", data)
		const imgUrl = data.secure_url
		const imgId = data.public_id
		const imgObj = {
			fileUrl: imgUrl,
			imgId: imgId
		}
		//save meme on server
		memeDataPass(imgObj);
	},
	error: function(err) {
		console.log(err);
	}
	})
})

const memeDataPass = function(memeData) {
	$.ajax({
		url: (hostName + "/upload"),
		type:"POST",
		data: memeData,
		success: function(data) {
			console.log("dataPass function success, data is ", data);
			window.location= (hostName + "/memes/" + memeData.imgId);
		}
	})
}

$(window).scroll(function () { 
	   if (initSearchScroll && $(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
	   	console.log("scroll tr1gger3d")
	   	initSearchScroll = false;
	   	//set back to true on successful ajax call
	   	//for more content
	   	console.log("lastMemeId is ", lastMemeId);
	   	getMoreProfileMemes();
	   	
	   	}
	});


function getMoreProfileMemes() {
	$.ajax({
		url: hostName + "/scrollprofilememes",
		type: "POST",
		data: {
			lastMeme: lastMemeId,
			thisUser: thisUserProfile
		},
		success: function(data) {
			console.log("a thing")
			console.log("getMoreProfileMemes data is ", data);
			data.forEach( function(meme) {
					var profileMemeData = {
						memeId: meme.profileMeme.memeId,
						imageUrl: meme.profileMeme.imageUrl,
						imageTags: meme.profileMeme.imageTags,
						clout: meme.profileMeme.favorited
					}	
					var memeCardSource = document.getElementById("meme-template").innerHTML;
					var memeCardTemplate = Handlebars.compile(memeCardSource)
					var renderedMemeCard = memeCardTemplate(profileMemeData)
					$("#profile-memes-container").append(renderedMemeCard);

					})
			console.log("lastMemeId of this profile is ", lastMemeId);
			//if this array length is less than 10 units the disable
			//search because its the last page
			if (data.length <= 9) {
				initSearchScroll = false;
			} else {
				//if not let the server know what the last meme
				//was so it can paginates
				lastMemeId = data[9].favs._id;
				initSearchScroll = true;
			}
		},
		error: function() {
			console.log("AJAX error")
		}
	})
}

function loadThisProfileMemes() {
	$.ajax({
		url: hostName + "/getprofilememes",
		type: "POST",
		data: {
			thisUser: thisUserProfile
		},
		success: function(data) {
			console.log("loadThisProfileMemes data is ", data)
			//assign last meme ID to send back to server
			//for pagination
			if (data.length >= 9) {
				lastMemeId = data[9].favs.memeId;
			} else {
				initSearchScroll = false;
			}
			console.log("lastMemeId of this profile is ", lastMemeId);

			data.forEach(function(meme){
				console.log(meme);
			});
				data.forEach( function(meme) {
					var profileMemeData = {
						memeId: meme.profileMeme.memeId,
						imageUrl: meme.profileMeme.imageUrl,
						imageTags: meme.profileMeme.imageTags,
						clout: meme.profileMeme.favorited
					}	
					var memeCardSource = document.getElementById("meme-template").innerHTML;
					var memeCardTemplate = Handlebars.compile(memeCardSource)
					var renderedMemeCard = memeCardTemplate(profileMemeData)
					$("#profile-memes-container").append(renderedMemeCard);
		
					//fade container back in
					$("#profile-memes-container").fadeIn()

					})
			// return lastMemeId;
		},
		error: function() {
			console.log("ajax problem loadThisProfileMemes")
		}
	})
}loadThisProfileMemes();

/*friends*/

$("#add-this-friend").click(function(e) {
	$.ajax({
		url: hostName + "/requestfriend",
		type: "POST",
		data: {
			thisUser: thisUserProfile,
		},
		success: function(data) {
			/*
			$(e.target).fadeOut(250, function() {
	            		$(this).text("✅ favorite added").fadeIn(250)
	            		
	       			})
	       			*/
	       			console.log("befriended button ajax success");
			$("#add-this-friend").fadeOut(250, function() {
				$("#add-this-friend").text("friend requested").fadeIn(250);
			})
			console.log("add-this-friend ajax success")
		},
		error: function() {
			console.log("add-this-friend ajax fail");
		}
	})
})

$("#profile-memes-container").click(function(e) {
	if (e.target && e.target.className == "unfav-button"){
		console.log("unfav btn clicked")
		var target = e.target;
		tp = $(target).parent();
		console.log(tp)		
		console.log(target)

		var targetId = e.target.id;
		console.log(targetId);

		newTargetId = targetId.replace(/[^0-9]/g, "");
		console.log(newTargetId);
		$(target).attr("id", newTargetId);
		const thisFav = e.target;
		const thisFavLink = thisFav.getAttribute('name');
		console.log(thisFavLink);
		$.ajax({
			url: hostName + '/unfavorite?favUrl=' + thisFavLink ,
			type: 'GET' ,
			data: {
				format: 'JSON'
			},
			success: function(data) {
				if (data) {
					console.log('unfav success ajax')
							console.log(targetId);
       			 	$("#"+newTargetId).animate({ opacity: 0}, 250, function() {
            		$("#"+newTargetId).text("✅ favorite removed").animate({opacity: 1}, 250)
            		});
            		
       			 }
			},
			error: function() {
				console.log('fav save failed')
			}
		})
	}
})

$(".add-tags-button").click(function (e) {
	console.log("add-tags-button clicked")
	const thisFav = e.target;
		const favName = thisFav.getAttribute('name');
		console.log(favName)
		$.ajax({
			url: hostName + '/addtags?favName=' + favName ,
			type: 'GET' ,
			data: {
				format: 'JSON'
			},
			success: function(data) {
				console.log(data)
			},
			error: function() {
				console.log("edit tags error")
			}

		})
	})

$("#root").click( function(e) {
	//e.preventDefault();
	if (e.target.id == "close-search" ) {
		console.log("close search clicked")
		$("#container-append").remove();
		$("#profile-memes-container").show();
	}
})

//fav from a profile
$("#root").click( function(e) {
if (e.target && e.target.className == 'fav-button') {
			console.log("fav btn on profile clicked")
			targetId = e.target.id;
			console.log(targetId);
			const thisFav = e.target;
			const thisFavLink = thisFav.getAttribute('name');
			console.log("faving ", thisFavLink);
			$.ajax({
				url: hostName + '/favorite',
				type: 'POST' ,
				data: {
					favUrl: thisFavLink
				},
				success: function(status) {
					    if (!status.loggedIn) {
							$(this).text("😬 log in first").fadeIn(250);
							return window.location=hostName + "/login"
					}	
						console.log("success");
	       			 	$(e.target).fadeOut(250, function() {
	            		$(this).text("✅ favorite added").fadeIn(250)	            		
	       			})
				},
				error: function() {
					console.log('fav save failed')
				}
			})
		}
	})

//open search window
$("#my-find-button").click( function(e) {
	e.preventDefault();
	var terms = $("#my-search").val()
 	if (!terms) return;
 	$("#container-append").remove();
	$("#profile-memes-container").fadeOut(250);
	console.log(terms)
	$.ajax( {
			url: hostName + "/myfind",
			type: 'POST',
			data: {
				thisUser: thisUserProfile,
				page: pageNum,
				terms: terms
			},
			success: function(data) {
				console.log("profile search function data is ", data);

				//grab root
				var container = document.getElementById("root");


				//create container for results header and
				//close button
				var headerButtonContainer = document.createElement("div");
				headerButtonContainer.setAttribute("id", "header-button-container")

				//create and append close button
				var closeButton = document.createElement("button")
				closeButton.setAttribute("id", "close-search");
				closeButton.innerText = "ok"
				//closeButton.innerText = "❌";
				//append to container
				headerButtonContainer.appendChild(closeButton)

				//create search header
				var searchHead = document.createElement("h2");
				searchHead.innerText = "Search results";
				searchHead.setAttribute("id", "search-results-head")
				//append to container
				headerButtonContainer.appendChild(searchHead)

				//create and append div to root
				var containerAppend = document.createElement("div");
				containerAppend.setAttribute("id", "container-append");
				container.appendChild(containerAppend);

				//append search header and close button
				//to search results like a meme card
				containerAppend.appendChild(headerButtonContainer)

				//hide append 'tainer and show it after
				//memes are appended to try and avoid
				//scroll jump
				$("#container-append").hide();

				//if no docs, render no docs
				if (data.length == 0) {
					var memeData = {
						memeId: null,
						imageUrl: "https://image.flaticon.com/icons/png/512/15/15135.png",
						imageTags: "No search results :/",
						clout: "-44"
					};
					searchHead.innerText = "No results found"
					var memeCardSource = document.getElementById("meme-template").innerHTML;
					var memeCardTemplate = Handlebars.compile(memeCardSource)
					var renderedMemeCard = memeCardTemplate(memeData)
					$("#container-append").append(renderedMemeCard);
		
					//fade container back in
					$("#container-append").fadeIn()

				} else {

					data.forEach( function(meme) {
					var memeData = {
						memeId: meme.favMemes.memeId,
						imageUrl: meme.favMemes.imageUrl,
						imageTags: meme.favMemes.imageTags,
						clout: meme.favMemes.favorited
					}	
					var memeCardSource = document.getElementById("meme-template").innerHTML;
					var memeCardTemplate = Handlebars.compile(memeCardSource)
					var renderedMemeCard = memeCardTemplate(memeData)
					$("#container-append").append(renderedMemeCard);
		
					//fade container back in
					$("#container-append").fadeIn()

					})
				}					
			},
			error: function() {
				console.log("ajax didn't work babe");
			} 
		})
	})
	return false;
})
