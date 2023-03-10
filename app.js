const express = require('express')
const app = express()
const hbs = require('hbs')
const path = require('path')
const port = process.env.PORT || 8000
const bcrypt = require('bcrypt')
const Users = require("./db/conn")
const nodemailer = require('nodemailer')
const validator = require('validator');


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

    if (validator.isEmail(email)) {
        if (pass !== confirm_pass) {
            console.log('Error! password not matched')
            res.render('signup', {
                pass: true
            })
        } else {
            const phoneExist = await Users.find({phone: phone})
            const emailExist = await Users.find({email: email})

            if (phoneExist.length !== 0) {
                res.render('signup', {
                    phone: true
                })
            } else {
                if (emailExist.length !== 0) {
                    res.render('signup', {
                        email: true
                    })
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
    } else {
        res.render('signup', {
            notEmail: true
        })
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
        if (validator.isEmail(email)) {
            const emails = await Users.find({email: email})
            if (emails[0].success !== true) {
                res.render('login', {
                    unauth: true
                })
            } else {
                if (emails.length !== 0) {
                    console.log(emails.length)
                    await bcrypt.compare(pwd, emails[0].password, (err, data) => {
                        if (data) {
                            res.render('user', {
                                user: emails[0].name
                            })
                        } else {
                            res.render('login', {
                                invalid_credentials: true
                            })
                        }
                    })

                } else {
                    res.render('login', {
                        invalid_credentials: true
                    })
                }
            }
        } else {
            res.render('login', {
                invalid_credentials: true
            })
        }


    } else {
        const phone = ephone
        const phones = await Users.find({phone: phone})
        if (phones[0].success !== true) {
            res.render('login', {
                unauth: true
            })
        } else {
            if (phones.length !== 0) {
                console.log(phones.length)
                await bcrypt.compare(pwd, phones[0].password, (err, data) => {
                    if (data) {
                        // res.send(`Welcome ${phones[0].name}`)
                        res.render('user', {
                            user: phones[0].name
                        })
                    } else {
                        res.render('login', {
                            invalid_credentials: true
                        })
                    }
                })
            } else {
                res.render('login', {
                    invalid_credentials: true
                })
            }
        }

    }




})

app.get('/users', async (req, res) => {
    const email = req.query.email
    console.log(email)
    const emailDB = await Users.find({email: email})
    if (emailDB[0].success !== true) {
        try {
            const updateSuccess = await Users.updateOne({
                email: email
            }, {
                success: true
            })

            console.log(updateSuccess)
            res.render('auth')
        } catch (err) {
            console.log(err)
            res.render('unauth')
        }
    } else {
        res.render('aauth')
    }

})

app.get('/*', (req, res) => {
    res.render('error')
})

app.listen(port, () => {
    console.log(`Listening at port : ${port}`)
})
