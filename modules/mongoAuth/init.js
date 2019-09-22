const mongoose = require('mongoose');
const mongoDBConfig = require('./config');
const njwt = require('njwt');
const bcrypt = require('bcrypt');

const userModel = require('./models/user');

module.exports = (app, express) => {
    if (mongoose.connection.readyState === 0) {
        mongoose.connect("mongodb://" + mongoDBConfig.username + ":" + mongoDBConfig.password + "@" + mongoDBConfig.address + ":" + mongoDBConfig.port + "/" + mongoDBConfig.database,
                            (err) => {
            if (err) {
                console.log(err)
                console.log("Error connecting to mongoDB");
            } else {
                console.log("Connected to mongoDB");
            }
        });
    }

    app.use('/mongoAuth/html', express.static(__dirname + '/html'))

    app.post("/mongoAuth/login", (req, res) => {
        if(req.body){
            userModel.findOne({ username: req.body.username }, (err, user) => {
                if (err) {
                    res.status(500).send(err);
                    throw err;
                } else {
                    bcrypt.compare(req.body.password, user.password, (error, same) => {
                        if (error) {
                            res.status(500).send(err);
                            throw err;
                        } else {
                            if (same) {
                                const signingKey = secureRandom(256,
                                                    { type: "Buffer" });
    
                                const claims = {
                                    iss: "http://nodemoduler.com/",  // The URL of your service
                                    sub: "users/" + req.body.username
                                };
    
                                const userObject = user;
                                const jwt = njwt.create(claims, signingKey);
                                userObject.jwt = jwt;
    
                                res.status(200).send(userObject);
                            }
                        }
                    });
                }
            });
        }
    })

    app.post('/mongoAuth/signup', (req, res) => {
        if(req.body.email && req.body.password){
            userModel.find({email: req.body.email}, async(err, users) => {
                if(err){
                    res.status(500).send(err)
                    throw err
                }else{
                    if(users.length > 0){
                        res.status(200).json({msg: 'Another user with this email is in database.'})
                    }else{
                        await bcrypt.genSalt(10, async(err, salt) => {
                            if(err)
                                throw err;
                            else{
                                    await bcrypt.hash(req.body.password, salt, (err, encrypted) => {
                                        if(err){
                                            throw err;
                                        }else{
                                            let firstName, lastName;

                                            if(req.body.firstName){
                                                firstName = req.body.firstName
                                            }else{
                                                firstName = ""
                                            }

                                            if(req.body.lastName){
                                                lastName = req.body.lastName
                                            }else{
                                                lastName = ""
                                            }
                                            
                                            let newUser = new userModel({
                                                username: req.body.username,
                                                password: encrypted,
                                                email: req.body.email,
                                                firstName: firstName,
                                                lastName: lastName
                                            })
                    
                                            newUser.save((err, savedUser) => {
                                                if(err){
                                                    throw err;
                                                }else{
                                                    res.status(200).send(savedUser);
                                                }
                                            })
                                        }
                                    })
                                }
                        })
                        
                    }
                }
            })
        }
    })
}