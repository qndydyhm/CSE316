const auth = require('../auth')
const User = require('../models/user-model')
const bcrypt = require('bcryptjs')

getLoggedIn = async (req, res) => {
    auth.verify(req, res, async function () {
        if (req.userId === 'Guest') {
            return res.status(200).json({
                loggedIn: false,
                user: {
                    firstName: 'Guest',
                    lastName: 'Guest',
                    name: 'Guest',
                    email: 'Guest@gmail.com'
                }
            });
        }
        const loggedInUser = await User.findOne({ _id: req.userId });
        return res.status(200).json({
            loggedIn: true,
            user: {
                firstName: loggedInUser.firstName,
                lastName: loggedInUser.lastName,
                name: (loggedInUser.firstName + ' ' + loggedInUser.lastName),
                email: loggedInUser.email
            }
        });
    })
}

registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, passwordVerify } = req.body;
        if (!firstName || !lastName || !email || !password || !passwordVerify) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }
        const existingEmail = await User.findOne({ email: email });
        const existingName = await User.findOne({ $and: [{firstName: firstName}, {lastName: lastName}]});
        if (existingEmail) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                })
        }
        if (existingName) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with the same name already exists."
                })
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName, lastName, email, passwordHash
        });
        const savedUser = await newUser.save();

        // LOGIN THE USER
        const token = auth.signToken(savedUser);

        await res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }).status(200).json({
            success: true,
            user: {
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                name: (savedUser.firstName+' '+savedUser.lastName),
                email: savedUser.email
            }
        }).send();
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ errorMessage: "Please enter email."});
        }
        if (!password) {
            return res.status(400).json({ errorMessage: "Please enter password."});
        }
        const existingUser = await User.findOne({ email: email});
        if (!existingUser) {
            return res.status(400).json({ errorMessage: "Email address " + email + " does not exists."});
        }
        let hash = existingUser.passwordHash;
        if (! await bcrypt.compare(password, hash)) {
            return res.status(400).json({ errorMessage: "Incorrect password."})
        }
        const token = auth.signToken(existingUser);

        await res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }).status(200).json({
            success: true,
            user: {
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                name: (existingUser.firstName+' '+existingUser.lastName),
                email: existingUser.email
            }
        }).send();
    } catch (err) {
        console.error(err);
        res.status(500).send;
    }
}

logoutUser = async(req, res) => {
    return await res.cookie("token", '', {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }).status(200).json({
        success: true
    })
}

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}
