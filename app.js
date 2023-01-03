const express = require('express')
const app = express()
const hbs = require('hbs')
const path = require('path')
const port = process.env.PORT || 8000
const bcrypt = require('bcrypt')
const Users = require("./db/conn")
const alert = require('alert')
const nodemailer = require('nodemailer')


app.use(express.urlencoded({
    extended: false
}))

app.set('view engine', 'hbs')

const partial_path = path.join(__dirname + '/views/partials/')

hbs.registerPartials(partial_path)

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/signup' , (req, res) => {
    res.render('signup')
})

app.post('/register', async (req, res) => {
    const firstName = req.body.first_name
    const lastName = req.body.last_name
    const email = req.body.email
    const age = req.body.age
    const phone = req.body.phone
    const pass = req.body.pwd
    const confirm_pass = req.body.confirm_pwd

    if (pass !== confirm_pass) {
        console.log('Error!')
        res.send('Passwords not matched...')
    } else {
        const phoneExist = await Users.find({phone: phone})
        const emailExist = await Users.find({email: email})

        if (phoneExist.length !== 0) {
            res.send('Phone number already exists....')
        } else {
            if (emailExist.length !== 0) {
                res.send('Email already exists...')
            } else {
                const createUser = async () => {
                    try {
                        const salt = bcrypt.genSaltSync(10)
                        const hash = bcrypt.hashSync(pass, salt)
                        const user = new Users({
                            name: firstName + ' ' + lastName,
                            email: email,
                            age: age,
                            phone: phone,
                            password: hash
                        })

                        const result = await user.save()
                        res.render('check')
                    } catch (err) {
                        console.log(err)
                    }
                }

                createUser()


                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'rohitkm40021@gmail.com',
                        pass: process.env.email_pass
                    }
                })

                const mailOptions = {
                    from: 'rohitkm40021@gmail.com',
                    to: email,
                    subject: 'Activation Mail',
                    text: 'Thank you for registering to our website. To activate your account, please open this link :- ' +
                        `https://mywebsite-iuji.onrender.com/users?email=${email}`
                }

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log('Email sent : ' + info)
                    }
                })
            }
        }



    }
})

app.get('/find', async (req, res) => {
    const result = await Users.find()
    console.log(result.length)
    res.send(result)
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login' ,async (req, res) => {
    const ephone = req.body.ephone
    const pwd = req.body.pwd


    if (isNaN(ephone)) {
        const email = ephone
        const emails = await Users.find({email: email})
        if (emails[0].success !== true) {
            res.send('User not Authorized')
        } else {
            if (emails.length !== 0) {
                console.log(emails.length)
                await bcrypt.compare(pwd, emails[0].password, (err, data) => {
                    if (data) {
                        res.send(`Welcome ${emails[0].name}`)
                    } else {
                        res.send('Invalid Password.........')
                    }
                })

            } else {
                res.send('Email does not exist......')
            }
        }

    } else {
        const phone = ephone
        const phones = await Users.find({phone: phone})
        if (phones[0].success !== true) {
            res.send('User not Authorized')
        } else {
            if (phones.length !== 0) {
                console.log(phones.length)
                await bcrypt.compare(pwd, phones[0].password, (err, data) => {
                    if (data) {
                        res.send(`Welcome ${phones[0].name}`)
                    } else {
                        res.send('Invalid Password.......')
                    }
                })
            } else {
                res.send('Phone Number does not exist.......')
            }
        }

    }




})

app.get('/users', async (req, res) => {
    const email = req.query.email
    console.log(email)
    try {
        const updateSuccess = await Users.updateOne({
            email: email
        }, {
            success: true
        })

        console.log(updateSuccess)
        res.render('auth')
        setTimeout(() => {
            res.redirect('/login')
        }, 3000)
    } catch (err) {
        console.log(err)
        res.render('unauth')
    }
})

app.listen(port, () => {
    console.log(`Listening at port : ${port}`)
})
