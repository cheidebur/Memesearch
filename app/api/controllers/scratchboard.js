memeModel.aggregate([
			  { $match: { memeId: memeId }},
			  { $unwind: "$comments" },
			  { $sort: { "comments.date": -1 }},
			  { $group: { _id: "$name", comments: { $push: "$comments" }}},
			  { $project: { _id: 0 }} // To remove `_id`
			]).exec( function(err, comments) {
				console.log(comments)
				res.send(comments[])
			})