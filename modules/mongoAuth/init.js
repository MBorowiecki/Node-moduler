const mongoose = require('mongoose');
const mongoDBConfig = require('./config');
const njwt = require('njwt');
const bcrypt = require('bcrypt');
const secureRandom = require('secure-random')

const userModel = require('./models/user');
const roleModel = require('./models/role');

const signingKey = secureRandom(256,{ type: "Buffer" });

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
            userModel.find({ email: req.body.email }, (err, user) => {
                if (err) {
                    res.status(500).send(err);
                    throw err;
                } else {
                    if(user.length > 0){
                        bcrypt.compare(req.body.password, user[0].password, async (error, same) => {
                            if (error) {
                                res.status(500).send(err);
                                throw err;
                            } else {
                                if (same) {
                                    const claims = {
                                        iss: "http://nodemoduler.com/",  // The URL of your service
                                        sub: "users/" + req.body.email
                                    };
        
                                    let userObject = user;
                                    let jwt = njwt.create(claims, signingKey);
                                    let token = jwt.compact()
        
                                    res.status(200).json({token: token, user: userObject[0]});
                                }
                            }
                        });
                    }else{
                        res.status(403).json({msg: 'No user with this email.'})
                    }
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
                        res.status(409).json({msg: 'Another user with this email is in database.'})
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

    app.post('/mongoAuth/verify', (req, res) => {
        if(req.body.token){
            njwt.verify(req.body.token, signingKey, (err, verified) => {
                if(err){
                    console.log(err)
                    res.status(500).send(err)
                }else{
                    console.log(verified)
                    res.status(200).send(verified)
                }
            })
        }
    })

    app.get('/mongoAuth/users', (req, res) => {
        userModel.find({}, (err, users) => {
            if(err){
                console.log(err)
                res.status(500).send(err)
            }else{
                let finalUsers = []

                users.forEach(user => {
                    delete user.password
                    finalUsers.push(user)
                })

                res.status(200).send(finalUsers)
            }
        })
    })

    app.post('/mongoAuth/createRole', (req, res) => {
        if(req.body){
            roleModel.find({name: req.body.name}, (err, roles) => {
                if(err){
                    res.status(500).send(err);
                    throw err;
                }else{
                    if(roles.length > 0){
                        res.status(409).json({msg: 'There is role with this name.'})
                    }else{
                        let role = new roleModel({
                            name: req.body.name
                        })

                        role.save((err, savedRole) => {
                            if(err){
                                res.status(500).send(err)
                                throw err;
                            }else{
                                res.status(200).send(savedRole)
                            }
                        })
                    }
                }
            })
        }
    })

    app.put('/mongoAuth/updateRole', (req, res) => {
        if(req.body.role.updateRoles){
            roleModel.find({_id: req.body.roleToUpdate._id}, async (err, roles) => {
                if(err){
                    res.status(500).send(err)
                    throw err;
                }else{
                    if(roles.length === 0){
                        res.status(409).json({msg: 'There is no role with this id'})
                    }else{
                        let errors = 0;
                        let updated = 0;
                        try{
                            req.body.valueToUpdate.forEach(value => {
                                roleModel.updateOne({_id: req.body.roleToUpdate._id}, {$set: {[value.name]: value.value}}, (err, docs) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            })
                        }catch(err){
                            res.status(500).send(err)
                        }finally{
                            res.status(200).json({msg: 'Updated.'})
                        }
                    }
                }
            })
        }else{
            res.status(403).json({msg: 'No right to remove role.'})
        }
    })

    app.delete('/mongoAuth/removeRole', (req, res) => {
        if(req.body.role.removeRoles){
            roleModel.findByIdAndRemove({_id: req.body.roleToRemove._id}, (err, docs) => {
                if(err){
                    res.status(500).send(err)
                    throw err
                }else{
                    res.status(200).send(docs);
                }
            })
        }else{
            res.status(403).json({msg: 'No right to remove role.'})
        }
    })

    app.post('/mongoAuth/getUserRoles', (req, res) => {
        if(req.body._id){
            userModel.findById(req.body._id, (err, user) => {
                if(err){
                    console.log(err)
                    res.status(500).send(err)
                    throw err;
                }else{
                    if(user){
                        res.status(200).send(user.roles);
                    }else{
                        res.status(403).json({msg: 'No user with this _id.'})
                    }
                }
            })
        }
    })
}