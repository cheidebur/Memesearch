$(document).ready(function() {
	var thisUserProfile = $("#thisUserProfile").val();
	const hostName = "https://msrch.herokuapp.com";

$("#requests-container").click(function(e) {
	if (e.target.id == "accept-friend") {
		var friendToAccept = e.target.value;
		console.log("accepting ", friendToAccept)
		$.ajax({
			url: hostName + "/acceptfriend",
			type: "POST",
			data: {
				thisUser: thisUserProfile,
				thatUser: friendToAccept
			},
			success: function(data) {
				console.log("acceptfriend ajax success")
				$("#"+friendToAccept).fadeOut(300);
			},
			error: function() {
				console.log("acceptfriend ajax failzz")
				

			}
		})
	} else if (e.target.id == "deny-friend") {
		var friendToDeny = e.target.value;
		console.log("denying ", friendToDeny);
		$.ajax({
			url: hostName + "/denyfriend",
			type: "POST",
			data: {
				thisUser: thisUserProfile,
				thatUser: friendToDeny
			},
			success: function(data) {
				console.log("denyfriend ajax success");
				$("#"+friendToDeny).fadeOut(300);
			},
			error: function() {
				console.log("denyfriend ajax fa1l")
			}
		})

	} 
})

function getFriends(){
	console.log("getting friends for ", thisUserProfile)
	$.ajax({
		url: hostName + "/getfriends",
		type: "POST",
		data: {
			thisUser: thisUserProfile
		},
		success: function(data) {
			console.log("getfriends success, data is ", data);
			data.forEach(function(friend) {
				friendData = {
					friendAvvy: friend.friend[0].avvy,
					friendUsername: friend.friend[0].username,
					friendBlurb: friend.friend[0].blurb,
					friendClout: friend.friend[0].clout,
					friendFriends: friend.friend[0].friends
				}
				console.log("frienddata object is ", friendData)
				var friendCardSource = document.getElementById("friend-template").innerHTML;
				var friendCardTemplate = Handlebars.compile(friendCardSource);
				var renderedFriendCard = friendCardTemplate(friendData);
				$("#friends-container").append(renderedFriendCard);
			})
		},
		error: function() {
			console.log("getFriends error")
		}
	})
}getFriends();

$("#friends-page-container").click(function(e) {
 if (e.target.id == "delete-friend") {
	var friendToDelete = e.target.value;
	console.log("deleting ", friendToDelete);
		//var friendToDelete = e.target.value;
		$.ajax({
			url: hostName + "/deletefriend",
			type: "POST",
			data: {
				thisUser: thisUserProfile,
				thatUser: friendToDelete
			},
			success: function(data) {
				console.log("deletefriend ajax success");
				//assign unique id to box
				//fade out only that box 
				$("#"+friendToDelete).fadeOut(300);
			},
			error: function() {
				console.log("deletefriend ajax fa1l");
			}
		})
	}

})

function getFriendRequests() {
	$.ajax({
		url: hostName + "/getfriendrequests",
		type: "POST",
		data: {
			thisUser: thisUserProfile
		},
		success: function(data) {
			console.log("getFriendRequest success, data is ", data);
			data.forEach(function(friend) {
				friendData = {
					friendAvvy: friend.requestingFriend[0].avvy,
					friendUsername: friend.requestingFriend[0].username,
					friendBlurb: friend.requestingFriend[0].blurb,
					friendClout: friend.requestingFriend[0].clout,
					friendFriends: friend.requestingFriend[0].friends
				}
				console.log("frienddata object is ", friendData)
				var friendCardSource = document.getElementById("friend-template").innerHTML;
				var friendCardTemplate = Handlebars.compile(friendCardSource);
				var renderedFriendCard = friendCardTemplate(friendData);
				$("#requests-container").append(renderedFriendCard);
			})
		},
		error: function() {
			console.log("getFriends error")
		}
	})
}getFriendRequests();

})