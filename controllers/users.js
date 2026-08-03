const User = require('../models/user')

const index = async (req, res) => {
    const users = await User.find({}, 'username')
    res.json(users)
}

const show = async (req, res) => {
    if (req.user._id !== req.params.userId){
      return res.status(403).json({ err: "Unauthorized"})
    }
    
    const user = await User.findById(req.params.userId)
    if (!user) {
        return res.json({ err: 'User not found.' })
    }
    res.json({ user })
}

module.exports = {
    index,
    show,
}