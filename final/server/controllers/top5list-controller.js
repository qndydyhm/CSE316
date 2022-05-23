const Top5List = require('../models/top5list-model');
const CommunityList = require('../models/communitylist-model');
const auth = require('../auth');
const User = require('../models/user-model')

createTop5List = async (req, res) => {
    const body = req.body;
    if (!body) {
        return res.status(400).json({
            success: false,
            errorMessage: 'You must provide a Top 5 List',
        })
    }
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    if (_id === 'Guest') {
        return res.status(403).json({success: false, errorMessage: 'Please log in to creat new list'});
    }

    let owner = await getOwner(_id);
    body.owner = owner;
    body.likes = [];
    body.dislikes = [];
    body.views = 0;
    body.comments = [];
    body.published = false;

    const top5List = new Top5List(body);
    console.log("creating top5List: " + JSON.stringify(top5List));
    if (!top5List) {
        return res.status(400).json({ success: false, errorMessage: err })
    }

    top5List
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                top5List: top5List,
                message: 'Top 5 List Created!'
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                errorMessage : 'Top 5 List Not Created!'
            })
        })
}

updateTop5List = async (req, res) => {
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let owner = 'Guest';
    if (_id !== 'Guest') {
        owner = await getOwner(_id);
    }
    const body = req.body
    console.log("updateTop5List: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            errorMessage: 'You must provide a body to update',
        })
    }

    await Top5List.findOne({ _id: req.params.id }, (err, top5List) => {
        console.log("top5List found: " + JSON.stringify(top5List));
        if (err || top5List.owner !== owner) {
            return res.status(404).json({
                err,
                errorMessage: 'Top 5 List not found!',
            })
        }
        if (top5List.published) {
            return res.status(403).json({
                err,
                errorMessage: 'Cannot modify published list!',
            })
        }

        top5List.name = body.name;
        top5List.items = body.items;
        top5List
            .save()
            .then(() => {
                console.log("SUCCESS!!!");
                return res.status(200).json({
                    success: true,
                    id: top5List._id,
                    message: 'Top 5 List updated!',
                })
            })
            .catch(error => {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    errorMessage: 'Top 5 List not updated!',
                })
            })
    })
}

publishTop5List = async (req, res) => {
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let owner = 'Guest';
    if (_id !== 'Guest') {
        owner = await getOwner(_id);
    }
    const body = req.body
    console.log("publishTop5List: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            errorMessage: 'You must provide a body to update',
        })
    }

    if (!body.name || !body.items[0] || !body.items[1] || !body.items[2] || !body.items[3] || !body.items[4]) {
        return res.status(403).json({success: false, errorMessage: 'Must fill in all items and title.'});
    }

    if (body.items[0] === body.items[1] || body.items[0] === body.items[2] || body.items[0] === body.items[3] || body.items[0] === body.items[4] || body.items[1] === body.items[2] || body.items[1] === body.items[3] || body.items[1] === body.items[4] || body.items[2] === body.items[3] || body.items[2] === body.items[4] || body.items[3] === body.items[4]) {
        return res.status(403).json({success: false, errorMessage: 'All item should be identical'});
    }


    Top5List.findOne({ $and:[{owner: owner}, {name: body.name}, {published: true}]}, (err, top5List) => {
        if (err) {
            return res.status(400).json({success: false, errorMessage: err});
        }
        if (top5List) {
            console.log('there is list with same name')
            console.log(top5List);
            return res.status(403).json({success: false, errorMessage: 'Cannot publish list with same name'});
        }
        else {

    Top5List.findOne({ _id: req.params.id }, (err, top5List) => {
        console.log("top5List found: " + JSON.stringify(top5List));
        if (err || top5List.owner !== owner) {
            return res.status(404).json({
                err,
                errorMessage: 'Top 5 List not found!',
            })
        }
        console.log(top5List);
        if (top5List.published) {
            return res.status(403).json({
                err,
                errorMessage: 'Cannot modify published list!',
            })
        }

        let d = new Date;
        CommunityList.findOne({name: body.name}, (err, communityList) => {
            console.log("community list found: " + communityList);
            if (err) {
                return res.status(403).json({
                    err,
                    errorMessage: 'Error with CommunityList',
                })
            }
            if (!communityList) {
                communityList = {
                    name: body.name,
                    items: [],
                    likes: [],
                    dislikes: [],
                    views: 0,
                    comments: [],
                    publishedAt: [],
                }

                communityList = new CommunityList(communityList);
                console.log("creating communityList: " + communityList);
            }
            let citem = communityList.items;
            for (let i = 0; i < 5; i ++) {
                let tmp = citem.find(function(a){return a[0] === body.items[i]});

                if (tmp) {
                    tmp[1] = parseInt(tmp[1]) + (5-i);
                    console.log(tmp);
                }
                else {
                    citem.push([body.items[i], (5-i)]);
                }
            }

            communityList.items = citem;
            communityList.publishedAt = [d.getFullYear(), (d.getMonth()+1), d.getDate()];
            communityList.save().then(() => { console.log('updated communityList!')});
        })


        top5List.name = body.name;
        top5List.items = body.items;
        top5List.likes = [];
        top5List.dislikes = [];
        top5List.views = 0;
        top5List.comments = [];
        top5List.published = true;
        top5List.publishedAt = [d.getFullYear(), d.getMonth()+1, d.getDate()];
        top5List
            .save()
            .then(() => {
                console.log("SUCCESS!!!");
                return res.status(200).json({
                    success: true,
                    id: top5List._id,
                    message: 'Top 5 List updated!',
                })
            })
            .catch(error => {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    errorMessage: 'Top 5 List not updated!',
                })
            })
    })
        }
    }).catch(err => console.log(err));

}


deleteTop5List = async (req, res) => {
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let owner = 'Guest';
    if (_id !== 'Guest') {
        owner = await getOwner(_id);
    }
    await Top5List.findById({ _id: req.params.id }, (err, top5List) => {
        if (err || top5List.owner !== owner) {
            return res.status(404).json({
                err,
                errorMessage: 'Top 5 List not found!',
            })
        }

        let d = new Date;
        if (top5List.published){
        CommunityList.findOne({name: top5List.name}, (err, communityList) => {
            console.log("community list found: " + communityList);
            if (err || !communityList) {
                return res.status(403).json({
                    err,
                    errorMessage: 'Error with CommunityList',
                })
            }

            let citem = communityList.items;
            console.log(citem);
            console.log(top5List.items);
            for (let i = 0; i < 5; i ++) {
                let tmp = citem.find(function(a){return a[0] === top5List.items[i]});
                if (tmp) {
                    tmp[1] -= (5-i);
                    if (tmp[1] < 0) {
                        console.log('vote<0)');
                    }
                    else if (tmp[1] == 0) {
                        let index = citem.indexOf(tmp);
                        citem.splice(index, 1);
                    }
                }
                else {
                    console.log('Error with CommunityList(cannot find item)\ntmp:',tmp, '\ncitem:', citem);
                }
            }
            console.log(citem);
            if (citem.length < 5) {
                if (citem.length > 0) {
                    console.log('length is less than 5');
                }
                else {
                    console.log('deleting ' + communityList);
                    CommunityList.findOneAndDelete({_id: communityList._id}, () => {})
                }
            }
            else {
                communityList.items = citem;
                communityList.publishedAt = [d.getFullYear(), (d.getMonth()+1), d.getDate()];
                communityList.save();
            }
        })
        }

        Top5List.findOneAndDelete({ _id: req.params.id }, () => {
            return res.status(200).json({ success: true, data: top5List })
        }).catch(err => console.log(err))
    })
}

getTop5ListById = async (req, res) => {
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let owner = 'Guest';
    if (_id !== 'Guest') {
        owner = await getOwner(_id);
    }
    console.log(owner)
    await Top5List.findById({ _id: req.params.id }, (err, list) => {
        if (err) {
            return res.status(400).json({ success: false, errorMessage: err });
        }
        if (!list||!list.published && list.owner !== owner) {
            return res.status(400).json({success: false, errorMessage: "List does not exists"});
        }
            let pair = {
                _id: list._id,
                name: list.name,
                items: list.items,
                owner: list.owner,
                likes: list.likes.length,
                dislikes: list.dislikes.length,
                views: list.views,
                comments: list.comments,
                published: list.published,
                publishedAt: list.publishedAt,
            };
        return res.status(200).json({ success: true, top5List: pair })
    }).catch(err => console.log(err))
}


getTop5Lists = async (req, res) => {
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let owner = 'Guest';
    if (_id !== 'Guest') {
        owner = await getOwner(_id);
    }
    //let owner = 'a';
    await Top5List.find({ $or:[{owner: owner}, {published: true}] }, (err, top5Lists) => {
        if (err) {
            return res.status(400).json({ success: false, errorMessage: err })
        }
        if (!top5Lists) {
            console.log("!top5Lists.length");
            return res
                .status(404)
                .json({ success: false, errorMessage: 'Top 5 Lists not found' })
        }
        else {
            // PUT ALL THE LISTS INTO ID, NAME PAIRS
            let pairs = [];
            for (let key in top5Lists) {
                let list = top5Lists[key];
                let pair = {
                    _id: list._id,
                    name: list.name,
                    items: list.items,
                    owner: list.owner,
                    likes: list.likes.length,
                    dislikes: list.dislikes.length,
                    views: list.views,
                    comments: list.comments,
                    published: list.published,
                    publishedAt: list.publishedAt,
                };
                pairs.push(pair);
            }
            return res.status(200).json({ success: true, idNamePairs: pairs })
        }
    }).catch(err => console.log(err))
}

getCommunityLists = async (req, res) => {
    await CommunityList.find({}, (err, communityLists) => {
        if (err) {
            return res.status(400).json({ success: false, errorMessage: err })
        }
        if (!communityLists) {
            console.log("!communityLists.length");
            return res
                .status(404)
                .json({ success: false, errorMessage: 'Top 5 Lists not found' })
        }
        else {
            // PUT ALL THE LISTS INTO ID, NAME PAIRS
            let pairs = [];
            for (let key in communityLists) {
                let list = communityLists[key];
                let items = list.items.sort(function(a, b){return b[1] - a[1]});
                let temp = [];
                for (let i = 0; i < 5; i ++) {
                    temp.push(items[i][0] + ' (' + items[i][1] + ' votes)' );
                }
                let pair = {
                    _id: list._id,
                    name: list.name,
                    items: temp,
                    owner: 'Community',
                    likes: list.likes.length,
                    dislikes: list.dislikes.length,
                    views: list.views,
                    comments: list.comments,
                    published: true,
                    publishedAt: list.publishedAt,
                };
                pairs.push(pair);
            }
            return res.status(200).json({ success: true, idNamePairs: pairs })
        }
    }).catch(err => console.log(err))
}

getCommunityListById = async (req, res) => {
    await CommunityList.findById({ _id: req.params.id }, (err, list) => {
        console.log("communityList found: " + JSON.stringify(list));
        if (err) {
            return res.status(400).json({ success: false, errorMessage: err });
        }
                let items = list.items.sort(function(a, b){return b[1] - a[1]});
                let temp = [];
                for (let i = 0; i < 5; i ++) {
                    temp.push(items[i][0] + ' (' + items[i][1] + ' votes)' );
                }
                let pair = {
                    _id: list._id,
                    name: list.name,
                    items: temp,
                    owner: 'Community',
                    likes: list.likes.length,
                    dislikes: list.dislikes.length,
                    views: list.views,
                    comments: list.comments,
                    published: true,
                    publishedAt: list.publishedAt,
                };
        return res.status(200).json({ success: true, top5List: pair })
    }).catch(err => console.log(err))
}

updateTop5ListViews = async (req, res) => {
    await Top5List.findById({ _id: req.params.id }, (err, top5List) => {
        console.log("top5List found: " + JSON.stringify(top5List));
        if (!top5List||err) {
            return res.status(404).json({
                err,
                errorMessage: 'Top 5 List not found!',
            })
        }
        if (top5List.published) {
            top5List.views += 1;
        }

        top5List
            .save()
            .then(() => {
                console.log("SUCCESS!!!");
                return res.status(200).json({
                    success: true,
                    id: top5List._id,
                    message: 'Top 5 List views updated!',
                })
            })
            .catch(error => {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    errorMessage: 'Top 5 List views not updated!',
                })
            })
    })
}

updateTop5ListLikes = async (req, res) => {
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let owner = 'Guest';
    if (_id !== 'Guest') {
        owner = await getOwner(_id);
    await Top5List.findById({ _id: req.params.id }, (err, top5List) => {
        console.log("top5List found: " + JSON.stringify(top5List));
        if (!top5List||err) {
            return res.status(404).json({
                err,
                errorMessage: 'Top 5 List not found!',
            })
        }
        if (top5List.published) {
            let likes = top5List.likes;
            let dislikes = top5List.dislikes;

            if (likes.find((a) => a === owner)) {
                let index = likes.indexOf(owner);
                likes.splice(index, 1);
            }
            else {
                likes.push(owner);
            }
            if (dislikes.find((a) => a === owner)) {
                let index = likes.indexOf(owner);
                dislikes.splice(index, 1);
            }

            top5List.likes = likes;
        }

        top5List
            .save()
            .then(() => {
            let pair = {
                _id: top5List._id,
                name: top5List.name,
                items: top5List.items,
                owner: top5List.owner,
                likes: top5List.likes.length,
                dislikes: top5List.dislikes.length,
                views: top5List.views,
                comments: top5List.comments,
                published: top5List.published,
                publishedAt: top5List.publishedAt,
            };
                console.log("SUCCESS!!!");
                return res.status(200).json({
                    success: true,
                    top5List: pair,
                })
            })
            .catch(error => {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    errorMessage: 'Top 5 List views not updated!',
                })
            })
    })
    }
    else {
        return res.status(403).json({
            success: false,
            errorMessage: 'Please login to like/dislike',
        })
    }
}

updateTop5ListDislikes = async (req, res) => {
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let owner = 'Guest';
    if (_id !== 'Guest') {
        owner = await getOwner(_id);
    await Top5List.findById({ _id: req.params.id }, (err, top5List) => {
        console.log("top5List found: " + JSON.stringify(top5List));
        if (!top5List||err) {
            return res.status(404).json({
                err,
                errorMessage: 'Top 5 List not found!',
            })
        }
        if (top5List.published) {
            let likes = top5List.likes;
            let dislikes = top5List.dislikes;

            if (likes.find((a) => a === owner)) {
                let index = likes.indexOf(owner);
                likes.splice(index, 1);
            }
            if (dislikes.find((a) => a === owner)) {
                let index = likes.indexOf(owner);
                dislikes.splice(index, 1);
            }
            else {
                dislikes.push(owner);
            }
            top5List.dislikes = dislikes;
        }

        top5List
            .save()
            .then(() => {
            let pair = {
                _id: top5List._id,
                name: top5List.name,
                items: top5List.items,
                owner: top5List.owner,
                likes: top5List.likes.length,
                dislikes: top5List.dislikes.length,
                views: top5List.views,
                comments: top5List.comments,
                published: top5List.published,
                publishedAt: top5List.publishedAt,
            };
                console.log("SUCCESS!!!");
                return res.status(200).json({
                    success: true,
                    top5List: pair,
                })
            })
            .catch(error => {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    errorMessage: 'Top 5 List views not updated!',
                })
            })
    })
    }
    else {
        return res.status(403).json({
            success: false,
            errorMessage: 'Please login to like/dislike',
        })
    }
}

updateCommunityListViews = async (req, res) => {
    console.log('get message');
    await CommunityList.findById({ _id: req.params.id }, (err, communityList) => {
        console.log("communityList found: " + JSON.stringify(communityList));
        if (err) {
            return res.status(404).json({
                err,
                errorMessage: 'Top 5 List not found!',
            })
        }
        communityList.views += 1;

        communityList
            .save()
            .then(() => {
                console.log("SUCCESS!!!");
                return res.status(200).json({
                    success: true,
                    id: communityList._id,
                    message: 'Top 5 List views updated!',
                })
            })
            .catch(error => {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    errorMessage: 'Top 5 List views not updated!',
                })
            })
    })
}

updateCommunityListLikes = async (req, res) => {
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let owner = 'Guest';
    if (_id !== 'Guest') {
        owner = await getOwner(_id);
    await CommunityList.findOne({ _id: req.params.id }, (err, top5List) => {
        console.log("top5List found: " + JSON.stringify(top5List));
        if (err) {
            return res.status(404).json({
                err,
                errorMessage: 'Top 5 List not found!',
            })
        }
            let likes = top5List.likes;
            let dislikes = top5List.dislikes;

            if (likes.find((a) => a === owner)) {
                let index = likes.indexOf(owner);
                likes.splice(index, 1);
            }
            else {
                likes.push(owner);
            }
            if (dislikes.find((a) => a === owner)) {
                let index = likes.indexOf(owner);
                dislikes.splice(index, 1);
            }

            top5List.likes = likes;

        top5List
            .save()
            .then(() => {
            let pair = {
                _id: top5List._id,
                name: top5List.name,
                items: top5List.items,
                owner: 'Community',
                likes: top5List.likes.length,
                dislikes: top5List.dislikes.length,
                views: top5List.views,
                comments: top5List.comments,
                published: true,
                publishedAt: top5List.publishedAt,
            };
                console.log("SUCCESS!!!");
                return res.status(200).json({
                    success: true,
                    top5List: pair,
                })
            })
            .catch(error => {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    errorMessage: 'Top 5 List views not updated!',
                })
            })
    })
    }
    else {
        return res.status(403).json({
            success: false,
            errorMessage: 'Please login to like/dislike',
        })
    }
}

updateCommunityListDislikes = async (req, res) => {
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let owner = 'Guest';
    if (_id !== 'Guest') {
        owner = await getOwner(_id);
    await CommunityList.findOne({ _id: req.params.id }, (err, top5List) => {
        console.log("top5List found: " + JSON.stringify(top5List));
        if (err) {
            return res.status(404).json({
                err,
                errorMessage: 'Top 5 List not found!',
            })
        }
            let likes = top5List.likes;
            let dislikes = top5List.dislikes;

            if (likes.find((a) => a === owner)) {
                let index = likes.indexOf(owner);
                likes.splice(index, 1);
            }
            if (dislikes.find((a) => a === owner)) {
                let index = likes.indexOf(owner);
                dislikes.splice(index, 1);
            }
            else {
                dislikes.push(owner);
            }
            top5List.dislikes = dislikes;

        top5List
            .save()
            .then(() => {
            let pair = {
                _id: top5List._id,
                name: top5List.name,
                items: top5List.items,
                owner: 'Community',
                likes: top5List.likes.length,
                dislikes: top5List.dislikes.length,
                views: top5List.views,
                comments: top5List.comments,
                published: true,
                publishedAt: top5List.publishedAt,
            };
                console.log("SUCCESS!!!");
                return res.status(200).json({
                    success: true,
                    top5List: pair,
                })
            })
            .catch(error => {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    errorMessage: 'Top 5 List views not updated!',
                })
            })
    })
    }
    else {
        return res.status(403).json({
            success: false,
            errorMessage: 'Please login to like/dislike',
        })
    }
}

updateCommunityListComments = async (req, res) => {
    const body = req.body
    console.log('updating c list commens');
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let owner = 'Guest';
    if (_id !== 'Guest') {
        owner = await getOwner(_id);
        await CommunityList.findOne({ _id: req.params.id }, (err, top5List) => {
        console.log("top5List found: " + JSON.stringify(top5List));
        if (!top5List || err) {
            return res.status(404).json({
                err,
                errorMessage: 'Top 5 List not found!',
            })
        }

        top5List.comments.push([owner, body.comment])

        top5List
            .save()
            .then(() => {
            let pair = {
                _id: top5List._id,
                name: top5List.name,
                items: top5List.items,
                owner: 'Community',
                likes: top5List.likes.length,
                dislikes: top5List.dislikes.length,
                views: top5List.views,
                comments: top5List.comments,
                published: true,
                publishedAt: top5List.publishedAt,
            };
                console.log("SUCCESS!!!");
                return res.status(200).json({
                    success: true,
                    top5List: pair,
                })
            })
            .catch(error => {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    errorMessage: 'Top 5 List views not updated!',
                })
            })
    })
    }
    else {
        return res.status(403).json({
            success: false,
            errorMessage: 'Please login to leave comments',
        })
    }
}

updateTop5ListComments = async (req, res) => {
    const body = req.body
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let owner = 'Guest';
    if (_id !== 'Guest') {
        owner = await getOwner(_id);
        await Top5List.findOne({ _id: req.params.id }, (err, top5List) => {
        console.log("top5List found: " + JSON.stringify(top5List));
        if (!top5List || err) {
            return res.status(404).json({
                err,
                errorMessage: 'Top 5 List not found!',
            })
        }

        if (top5List.published) {
        top5List.comments.push([owner, body.comment])

        top5List
            .save()
            .then(() => {
            let pair = {
                _id: top5List._id,
                name: top5List.name,
                items: top5List.items,
                owner: top5List.owner,
                likes: top5List.likes.length,
                dislikes: top5List.dislikes.length,
                views: top5List.views,
                comments: top5List.comments,
                published: top5List.published,
                publishedAt: top5List.publishedAt,
            };
                console.log("SUCCESS!!!");
                return res.status(200).json({
                    success: true,
                    top5List: pair,
                })
            })
            .catch(error => {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    errorMessage: 'Top 5 List views not updated!',
                })
            })
        }
    })
    }
    else {
        return res.status(403).json({
            success: false,
            errorMessage: 'Please login to leave comments',
        })
    }
}


getOwner = async function (_id) {
    const loggedInUser = await User.findOne({ _id: _id});
    return (loggedInUser.firstName + ' ' + loggedInUser.lastName);
}

module.exports = {
    createTop5List,
    updateTop5List,
    publishTop5List,
    deleteTop5List,
    getTop5Lists,
    getTop5ListById,
    getCommunityLists,
    getCommunityListById,
    updateTop5ListViews,
    updateTop5ListLikes,
    updateTop5ListDislikes,
    updateCommunityListViews,
    updateCommunityListLikes,
    updateCommunityListDislikes,
    updateTop5ListComments,
    updateCommunityListComments,
}
