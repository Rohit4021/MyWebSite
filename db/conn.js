const mongoose = require('mongoose')


mongoose.connect(`mongodb+srv://${process.env.user}:${process.env.pass}@registerers.mthztqv.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    console.log('Connection Successful....')
}).catch((e) => {
    console.log(e)
})

const users = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
    phone: Number,
    password: String,
    success: {
        type: Boolean,
        default: false
    }
})

const Users = new mongoose.model('User', users)



// setTimeout(async () => {
//     const deleteC = await Users.deleteOne()
//     console.log(deleteC)
// }, 5000)

// use
// const user = new Users({
//     name:fdskk
//     fsdl: sbdkfb
// })
// user.save()

module.exports = Users
