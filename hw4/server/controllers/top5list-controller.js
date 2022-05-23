const Top5List = require('../models/top5list-model');
const auth = require('../auth');
const User = require('../models/user-model')

createTop5List = (req, res) => {
    const body = req.body;
    if (!body) {
        return res.status(400).json({
            success: false,
            errorMessage: 'You must provide a Top 5 List',
        })
    }

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
    let email = await getEmail(_id);
    const body = req.body
    console.log("updateTop5List: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            errorMessage: 'You must provide a body to update',
        })
    }

    Top5List.findOne({ _id: req.params.id }, (err, top5List) => {
        console.log("top5List found: " + JSON.stringify(top5List));
        if (err || top5List.ownerEmail !== email) {
            return res.status(404).json({
                err,
                errorMessage: 'Top 5 List not found!',
            })
        }

        top5List.name = body.name
        top5List.items = body.items
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

deleteTop5List = async (req, res) => {
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let email = await getEmail(_id);
    Top5List.findById({ _id: req.params.id }, (err, top5List) => {
        if (err || top5List.ownerEmail !== email) {
            return res.status(404).json({
                err,
                errorMessage: 'Top 5 List not found!',
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
    let email = await getEmail(_id);
    await Top5List.findById({ _id: req.params.id }, (err, list) => {
        if (err || list.ownerEmail !== email) {
            return res.status(400).json({ success: false, errorMessage: err });
        }
        return res.status(200).json({ success: true, top5List: list })
    }).catch(err => console.log(err))
}
getTop5Lists = async (req, res) => {
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let email = await getEmail(_id);
    await Top5List.find({ ownerEmail: email }, (err, top5Lists) => {
        if (err) {
            return res.status(400).json({ success: false, errorMessage: err })
        }
        if (!top5Lists.length) {
            return res
                .status(404)
                .json({ success: false, errorMessage: `Top 5 Lists not found` })
        }
        return res.status(200).json({ success: true, data: top5Lists })
    }).catch(err => console.log(err))
}
getTop5ListPairs = async (req, res) => {
    let _id = '';
    auth.verify(req, res, async function () {
        _id = req.userId;
    });
    let email = await getEmail(_id);
    await Top5List.find({ ownerEmail: email }, (err, top5Lists) => {
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
                    name: list.name
                };
                pairs.push(pair);
            }
            return res.status(200).json({ success: true, idNamePairs: pairs })
        }
    }).catch(err => console.log(err))
}

getEmail = async function (_id) {
    const loggedInUser = await User.findOne({ _id: _id});
    return loggedInUser.email;
}

module.exports = {
    createTop5List,
    updateTop5List,
    deleteTop5List,
    getTop5Lists,
    getTop5ListPairs,
    getTop5ListById
}
