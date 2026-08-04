const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const signToken = (req, res) => {
    const user = {
        id: 1,
        username: 'test',
        password: 'test',

        }
    const token = jwt.sign({ user }, process.env.JWT_SECRET)
    res.json({ token })
}

const verifyToken = (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    res.json({ decoded })
}

const signUp = async (req, res) => {
    try {
        // console.log("Data from Postman:", req.body)

        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ err: 'Passwords do not match.' })
        }
        
        const userInDatabase = await User.findOne({
            username: req.body.username
        })

        if (userInDatabase) {
            return res.status(409).json({ err: 'Username already taken.' })
        }

        let userData = {}
        userData.username = req.body.username

        const hashedPassword = bcrypt.hashSync(req.body.password, 10)
        userData.password = hashedPassword

        const user = await User.create(userData)

        const payload = { username: user.username, _id: user._id }
        const token = jwt.sign({ payload }, process.env.JWT_SECRET)

        res.json({ token })

    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

const signIn = async (req, res) => {
    try {
        const userInDatabase = await User.findOne({
            username: req.body.username
        })
        
        if (!userInDatabase) {
            return res.json({ err: 'User does not exist.' })
        }
        
        const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password)
        
        if(!validPassword) {
            return res.json({ err: 'Login failed. Please try again.' })
        }
        
        const payload = { username: userInDatabase.username, _id: userInDatabase._id }
        const token = jwt.sign({ payload }, process.env.JWT_SECRET)
        
        res.status(201).json({ token })
        
    } catch (err) {
        res.json({ err: err.message })
    }
}

module.exports = {
    signToken,
    verifyToken,
    signUp,
    signIn,
}