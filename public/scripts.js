
$(document).ready(function(){
	var disableSearch = false;
	var pageNum = 1;
	var initSearchScroll = true;
	var enableQuery = false;

	function showStats() {
	console.log("disableSearch is " + disableSearch);
	console.log("enableQuery is " + enableQuery);
	console.log("initSearchScroll is " + initSearchScroll);
	}
	showStats();

	$(window).scroll(function () { 
	   if (initSearchScroll && $(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
	   	pageNum++
	   	console.log("page number is ", pageNum)
	   	initSearchScroll = false;
		showStats();

	 	  	if (enableQuery && !disableSearch) {
	   			initSearch();
	   			console.log("scroll thing")
	   		} else if (!disableSearch) {
	   			landingContent();
	   		}  else {
	   			console.log("Search is disabled")
	   		}
	   	}
	});

	//scroll to top button
	$(window).scroll(function() {
		if ($(window).scrollTop() >= ($(window).height() * 3)) {
			$("#scrolltop").fadeIn(500);
			} else {
				$("#scrolltop").fadeOut(500);
			}
		})
	
	// not sure what sort of fuckery is going on here below,
	// but I did write this a year ago. refactor me
	function appendInitialContainer () {	
		const app = document.getElementById('root');
		const container = document.createElement('div');
		container.setAttribute('class', 'container');
		app.appendChild(container);
	}
	appendInitialContainer();
	
	function landingContent() {	
		$.ajax({
			url: "https://msrch.herokuapp.com/landingscroll?page=" + pageNum,
			type: 'GET',
			data: {
				format: 'json'
			},
			success: function(data) {
				populateSearch(data);
				initSearchScroll = true;
					//DRUNK - disabled because enabling this
					// let the scroll run through
				if (!data.hasNextPage) {
					disableSearch = true;
					}		
				//pageNum++						
			},
			error: function() {
				console.log("ajax didn't work babe");
			}
		}
	)}
	landingContent();

	$('#find-button').click( function(e) {		
		if (!$("#memeFindQuery").val()) {
				return console.log("no value in searchbox");
			}
			pageNum = 1
			enableQuery = true;
			disableSearch = false;

			$('#root').empty();
			const app= document.getElementById('root');
			const container = document.createElement('div');
			container.setAttribute('class', 'container');
			app.appendChild(container);
			initSearch()		
	})

	function initSearch() {
		var terms = $('#memeFindQuery').val();
		console.log(terms);
		if (!$('#memeFindQuery').val()) {
			console.log("nothing in search box");
		} else {
		$.ajax( {
			url: "https://msrch.herokuapp.com/find?page=" + pageNum + "&terms=" + terms,
			type: 'GET',
			data: {
				format: 'json'
			},
			success: function(data) {
				console.log("hasnextpage is ", data.hasNextPage)
				initSearchScroll = true;	
				if (!data.hasNextPage) {
					disableSearch = true;
				}		
				console.log("after if statement, disablesearch is  " + disableSearch);	
				populateSearch(data);								
			},
			error: function() {
				console.log("ajax didn't work babe");
			} 
		})}
	}
	function populateSearch(data) {
		appendArray = data.docs;
		console.log(data.docs);

		appendArray.forEach(image => {
			imgSrc = image.imageUrl;
			const result = document.createElement('div');
			result.setAttribute('class', 'card');
			$(".container").append(result);
	
			//likebtn
			const fav = document.createElement('p');
			fav.setAttribute('class', 'fav-button');
			//this substring must match the server truncation for the memeId
			favId = imgSrc.substring(64, 80);
			fav.setAttribute('id', favId);
			fav.setAttribute('name', imgSrc);
			result.appendChild(fav);
			fav.innerHTML = "❤️ add to favorites";

			//img
			const img = document.createElement('img');
			img.src = (imgSrc);

			var clickableHref = "https://msrch.herokuapp.com/memes/" + image.memeId;
			const clickableMeme = document.createElement('a');
			clickableMeme.setAttribute('href', clickableHref);
			clickableMeme.appendChild(img);

			const clickableUser = document.createElement('a');

			userProfileLink = "https://msrch.herokuapp.com/users/" + image.imageUploader;
			clickableUser.setAttribute('href', userProfileLink);

			//create div under image to append avvy and user label
			const userAuthor = document.createElement('div');

			//classes for author label and author link
			userAuthor.setAttribute('class', 'memeauthorlabel');
			clickableUser.setAttribute('class', 'memeauthorlink');

			//create user avvy image
			const usrAvvyImg = document.createElement('img');
			usrAvvyImg.setAttribute('class', 'card-avvy');
			usrAvvyImg.src = image.author.avvy;

			//create user label 
			const userLabel = document.createElement('p');
			userLabel.setAttribute('class', 'userlabel');
			userLabel.innerText = image.imageUploader;

			//create favorited counter
			const favCounter = document.createElement('p');
			favCounter.setAttribute('class', 'fav-counter');
			favCounter.innerText = image.favorited;

			//append label and avvy and favcounter to userAuthor div
			userAuthor.appendChild(usrAvvyImg);
			userAuthor.appendChild(userLabel);
			userAuthor.appendChild(favCounter);
			clickableUser.appendChild(userAuthor);

			//append a bunch of other shit
			//user div
			clickableUser.appendChild(userAuthor);
			result.appendChild(clickableUser);
			//image
			result.appendChild(clickableMeme);
			//favorite button
			result.appendChild(fav);
			
			img.setAttribute('class', 'meme-result');
		})
	}

	//scroll to top button
	$("#scrolltop").click( function() {
		window.scrollTo(0, 0);
	})

	$(".root-not-logged-in").click( function(e) {
		if (e.target && e.target.className == 'fav-button') {
			var source  = $("#no-acct-template").html();
	       	$("body").append(source);
	       	$("#no-account").fadeIn(250);	
		}
	});

	$(".root-logged-in").click( function(e) {
	if (e.target && e.target.className == 'fav-button') {
			console.log("fav btn clicked");
			targetId = e.target.id;
			console.log(targetId);
			const thisFav = e.target;
			const thisFavLink = thisFav.getAttribute('name');
			console.log("sending this fav link to server: ", thisFavLink);
			$.ajax({
				url: (hostName + '/favorite'),
				type: 'POST',
				data: {
					favUrl: thisFavLink
				},
				success: function(status) {
	       			 	$(e.target).fadeOut(250, function() {
	            		$(this).text("✅ favorite added").fadeIn(250);	            		
	       			})
				},
				error: function() {
					console.log('fav save failed');
				}
			})
		} 
	})

	$(window).click(function(e){
		if (e.target && e.target.id == 'fuck-off') {
			console.log('fo clikdt');
			hideNoAcct();
		}
	})

	const hideNoAcct = function(){
	$("#no-account").fadeOut(250, function() {
				$(this).remove();
			});
	}

});