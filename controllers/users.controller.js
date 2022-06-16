const jwt = require("jsonwebtoken"); //JWT tokens creation (sign()) 
const bcrypt = require("bcryptjs"); //password encryption

const config = require("../config/db.config.js");
const db = require("../models/index.js");
const User = db.users;
const Quizz = db.quizzes;
const Movie = db.movies;
const Serie = db.series;
const Badge = db.badges;

exports.createUser = async (req, res) => {
    
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        points: req.body.points,
        role: req.body.role
    }) 
    
    
    try {
        await user.save(); // save User in the database
        console.log(user)
        res.status(201).json({ success: true, msg: "New user created.", URL: `/users/${user._id}` });
        }
        catch (err) {
            if (err.name === "ValidationError") {
                let errors = [];
                Object.keys(err.errors).forEach((key) => {
                    errors.push(err.errors[key].message);
                });
                return res.status(400).json({ success: false, msgs: errors });
            }
            else
                res.status(500).json({
                    success: false, msg: err.message || "Ocorreu um erro ao criar este utilizador"
                });
        };
};

exports.login = async (req, res) => {

    try {
        if (!req.body || !req.body.name || !req.body.password)
            return res.status(400).json({ success: false, msg: "Must provide name and password." });
        
        let user = await User
        .findOne({ name: req.body.name })
        .exec(); //get user data from DB
        
        if (!user) return res.status(404).json({ success: false, msg: "User not found."});

        // tests a string (password in body) against a hash (password in database)
        const check = bcrypt.compareSync( req.body.password, user.password );
        if (!check) return res.status(401).json({ success:false, accessToken:null, msg:"Invalid credentials!" });
        
        // sign the given payload (user ID and type) into a JWT payload – builds JWT token, using secret key
        const token = jwt.sign({ name: user.name, role: user.role },
            config.JWT_SECRET, { expiresIn: '24h' // 24 hours
        });
            return res.status(200).json({ success: true, accessToken: token, userInfo: user});
    } 
    catch (err) {
        if (err.name === "ValidationError") {
            let errors = [];
            Object.keys(err.errors).forEach((key) => {
                errors.push(err.errors[key].message);
            });
            return res.status(400).json({ success: false, msgs: errors });
        }
        else
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while loggin in."
            });    
    };
};

exports.getRanking = async (req, res) => {
    try {
        let data = await User
            .find()
            .select('name points') // select the fields (it will add _id): do not show versionKey
            .exec();
        res.status(200).json({success: true, users: data});
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Some error occurred while retrieving the tutorials."
        });
    }
};

exports.getUserInfo = async (req, res) => {
    try {    
        const user = await User
        .findOne({"name": req.params.name})
        .exec();
        // no data returned means there is no tutorial in DB with that given ID 
        if (user === null) {
            res.status(404).json({
            message: `Not found user with name ${req.params.name}.`
            });
        } else {
            res.status(200).json(user);
            }
        }
        catch (err) 
        {
        res.status(500).json({
        message: err.message || `Error retrieving user with name ${req.params.name}.`
        });
        }
}

exports.changeInfo = async (req, res) => {
    if (!req.body) { // validate request body data
        res.status(400).json({ message: "Request body cannot be empty!" });
        return;
    }
    console.log(req.body);
    try {
        const user = await User.findOneAndUpdate({"name": req.params.name}, req.body, { 
            useFindAndModify: false //https://mongoosejs.com/docs/deprecations.html#findandmodify
        }).exec();
        if (!user) // returns the found document (if any) to the callback
            res.status(404).json({
            message: `Not found User with id=${req.params.name}.`
            });
        else
            res.status(200).json({
            message: `User name=${req.params.name} was updated successfully.`
            });
    } 
    catch (err) 
    {
        res.status(500).json({
        message: `Error updating User with name=${req.params.name}.`
        });
    };
};

exports.getHomeInfo = async (req, res) => { 
    
    try {
        let data = []
        try{
            let serie = await Serie
            .find()
            .select('title image')
            .limit(3)
            .exec();
            return serie

        } catch(err){
                res.status(500).json({
                    success: false, msg: err.message || "Some error occurred while retrieving the movies."
                });
            }
        let quizz = await Quizz
            .find()
            .select('title image')
            .limit(3)
            .exec();
        let movie = await Movie
            .find()
            .select('title image')
            .limit(3)
            .exec();

        data.push(serie,quizz,movie)

        res.status(200).json(data);
        }
        catch (err) {
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while retrieving the movies."
            });
        };
}; 

exports.addMovieFav = async (req, res) => {
    
    if ( req.loggedUsername != req.params.name ) {
        res.status(400).json({ message: "Must be connected!" });
        return;
    }

    let userFavMovVerification = await User.findOne({"name": req.params.name})
    let foundMovie = false;
    userFavMovVerification.favMovies.forEach(movie => {
        if (movie.title === req.params.movieTitle){
            foundMovie = true;
        }
    });
    if (foundMovie)
    return res.status(400).json({ message: "Already in favorites!" });
    
    try {
        let dataMovie = await Movie.findOne({"title": req.params.movieTitle}).select("title image")
        console.log(dataMovie);

        let user = await User.findOneAndUpdate(
            {"name": req.params.name},
            { $push:
                {
                    favMovies:
                    {
                    title: dataMovie.title,
                    image: dataMovie.image
                    }
                }
            },
            { new: true, useFindAndModify: false })
            console.log(user);
        res.status(201).json({ success: true, msg: "New fav. movie added."});
        }
        catch (err) {
            if (err.name === "ValidationError") {
                let errors = [];
                Object.keys(err.errors).forEach((key) => {
                    errors.push(err.errors[key].message);
                });
                return res.status(400).json({ success: false, msgs: errors });
            } 
            else
                res.status(500).json({
                    success: false, msg: err.message || "Ocorreu um erro ao criar este commentario"
                });
        };
};

exports.removeMovieFav = async (req, res) => {
    
    if ( req.loggedUsername != req.params.name ) {
        res.status(400).json({ message: "Must be connected!" });
        return;
    }

    try {
        let data = await User.findOneAndUpdate(
            {"name": req.params.name},
            { $pull: {favMovies: {"title": req.params.movieTitle}}})
            console.log(data);
        res.status(201).json({ success: true, msg: "Fav. movie removed."});
        }
        catch (err) {
            if (err.name === "ValidationError") {
                let errors = [];
                Object.keys(err.errors).forEach((key) => {
                    errors.push(err.errors[key].message);
                });
                return res.status(400).json({ success: false, msgs: errors });
            } 
            else
                res.status(500).json({
                    success: false, msg: err.message || "Ocorreu um erro ao criar este commentario"
                });
        };
};

exports.addSeriesFav = async (req, res) => {
    
    if ( req.loggedUsername != req.params.name ) {
        res.status(400).json({ message: "Must be connected!" });
        return;
    }
    
    let userFavSerVerification = await User.findOne({"name": req.params.name})
    let foundSerie = false;
    userFavSerVerification.favSeries.forEach(serie => {
        if (serie.title === req.params.serieTitle){
            foundSerie = true;
        }
    });
    if (foundSerie)
    return res.status(400).json({ message: "Already in favorites!" });

    try {
        let dataSerie = await Serie.findOne({"title": req.params.serieTitle}).select("title image")
        console.log(dataSerie);

        let user = await User.findOneAndUpdate(
            {"name": req.params.name},
            { $push:
                {
                    favSeries:
                    {
                    title: dataSerie.title,
                    image: dataSerie.image
                    }
                }
            })
        console.log(user);
        res.status(201).json({ success: true, msg: "New fav. serie added."});
        }
        catch (err) {
            if (err.name === "ValidationError") {
                let errors = [];
                Object.keys(err.errors).forEach((key) => {
                    errors.push(err.errors[key].message);
                });
                return res.status(400).json({ success: false, msgs: errors });
            } 
            else
                res.status(500).json({
                    success: false, msg: err.message || "Ocorreu um erro ao criar este commentario"
                });
        };
};

exports.removeSerieFav = async (req, res) => {
    
    if ( req.loggedUsername != req.params.name ) {
        res.status(400).json({ message: "Must be connected!" });
        return;
    }

    try {
        let data = await User.findOneAndUpdate(
            {"name": req.params.name},
            { $pull: {favSeries: {"title": req.params.serieTitle}}})
            console.log(data);
        res.status(201).json({ success: true, msg: "Fav. serie removed."});
        }
        catch (err) {
            if (err.name === "ValidationError") {
                let errors = [];
                Object.keys(err.errors).forEach((key) => {
                    errors.push(err.errors[key].message);
                });
                return res.status(400).json({ success: false, msgs: errors });
            } 
            else
                res.status(500).json({
                    success: false, msg: err.message || "Ocorreu um erro ao criar este commentario"
                });
        };
};

exports.finishQuizz = async (req, res) => {
    // if (!req.body) { // validate request body data
    //     res.status(400).json({ message: "Request body can not be empty!" });
    //     return;
    // }
    let userQuizzDoneVerification = await User.findOne({"name": req.params.name})
    let foundQuizz = false;
    console.log(userQuizzDoneVerification);
    userQuizzDoneVerification.doneQuizz.forEach(quizz => {
        if (quizz.title === req.params.quizzTitle){
            foundQuizz = true;
        }
    });

    if (foundQuizz)
    return res.status(400).json({ message: "Already in favorites!" });



    try {
        let data = await Quizz
            .findOne({"title": req.params.quizzTitle})
            .exec();
        console.log(data);

        let quizz =  {
            title: data.title,
            image: data.image
        }

        let user = await User.findOneAndUpdate({"name": req.params.name}, {$inc: {points: data.points}}, { 
            useFindAndModify: false //https://mongoosejs.com/docs/deprecations.html#findandmodify
        }).exec();

        await User.findOneAndUpdate({"name": req.params.name}, { $push: {doneQuizz: quizz}}, { 
            useFindAndModify: false //https://mongoosejs.com/docs/deprecations.html#findandmodify
        }).exec();

        if (!user) // returns the found document (if any) to the callback
            res.status(404).json({
            message: `Not found User with id=${req.params.name}.`
            });
        else
            res.status(200).json({
            message: `User name=${req.params.name} was updated successfully.`
            });
    } 
    catch (err) 
    {
        res.status(500).json({
        message: `Error updating User with name=${req.params.name}.`
        });
    };
};

exports.addMovieSeen = async (req, res) => {
    
    if ( req.loggedUsername != req.params.name ) {
        res.status(400).json({ message: "Must be connected!" });
        return;
    }

    let userSeenMovVerification = await User.findOne({"name": req.params.name})
    let foundMovieSeen = false;
    userSeenMovVerification.seenMovies.forEach(movie => {
        if (movie.title === req.params.movieTitle){
            foundMovieSeen = true;
        }
    });
    if (foundMovieSeen)
    return res.status(400).json({ message: "Already in seen!" });
    
    try {
        let dataMovie = await Movie.findOne({"title": req.params.movieTitle}).select("title image")
        console.log(dataMovie);

        let user = await User.findOneAndUpdate(
            {"name": req.params.name},
            { $push:
                {
                    seenMovies:
                    {
                    title: dataMovie.title,
                    image: dataMovie.image
                    }
                }
            },
            { new: true, useFindAndModify: false })
            console.log(user);
        res.status(201).json({ success: true, msg: "New seen movie added."});
        }
        catch (err) {
            if (err.name === "ValidationError") {
                let errors = [];
                Object.keys(err.errors).forEach((key) => {
                    errors.push(err.errors[key].message);
                });
                return res.status(400).json({ success: false, msgs: errors });
            } 
            else
                res.status(500).json({
                    success: false, msg: err.message || "Ocorreu um erro ao addicionar este filme "
                });
        };
};

exports.removeMovieSeen = async (req, res) => {
    
    if ( req.loggedUsername != req.params.name ) {
        res.status(400).json({ message: "Must be connected!" });
        return;
    }

    try {
        let data = await User.findOneAndUpdate(
            {"name": req.params.name},
            { $pull: {seenMovies: {"title": req.params.movieTitle}}})
            console.log(data);
        res.status(201).json({ success: true, msg: "Seen movie removed."});
        }
        catch (err) {
            if (err.name === "ValidationError") {
                let errors = [];
                Object.keys(err.errors).forEach((key) => {
                    errors.push(err.errors[key].message);
                });
                return res.status(400).json({ success: false, msgs: errors });
            } 
            else
                res.status(500).json({
                    success: false, msg: err.message || "Ocorreu um erro ao criar este commentario"
                });
        };
};

exports.addSeriesSeen = async (req, res) => {
    
    if ( req.loggedUsername != req.params.name ) {
        res.status(400).json({ message: "Must be connected!" });
        return;
    }
    
    let userSeenSerVerification = await User.findOne({"name": req.params.name})
    let foundSerie = false;
    userSeenSerVerification.seenSeries.forEach(serie => {
        if (serie.title === req.params.serieTitle){
            foundSerie = true;
        }
    });
    if (foundSerie)
    return res.status(400).json({ message: "Already seen!" });

    try {
        let dataSerie = await Serie.findOne({"title": req.params.serieTitle}).select("title image")
        console.log(dataSerie);

        let user = await User.findOneAndUpdate(
            {"name": req.params.name},
            { $push:
                {
                    seenSeries:
                    {
                    title: dataSerie.title,
                    image: dataSerie.image
                    }
                }
            })
        console.log(user);
        res.status(201).json({ success: true, msg: "New fav. serie added."});
        }
        catch (err) {
            if (err.name === "ValidationError") {
                let errors = [];
                Object.keys(err.errors).forEach((key) => {
                    errors.push(err.errors[key].message);
                });
                return res.status(400).json({ success: false, msgs: errors });
            } 
            else
                res.status(500).json({
                    success: false, msg: err.message || "Ocorreu um erro ao criar este commentario"
                });
        };
};

exports.removeSerieSeen = async (req, res) => {
    
    if ( req.loggedUsername != req.params.name ) {
        res.status(400).json({ message: "Must be connected!" });
        return;
    }

    try {
        let data = await User.findOneAndUpdate(
            {"name": req.params.name},
            { $pull: {seenSeries: {"title": req.params.serieTitle}}})
            console.log(data);
        res.status(201).json({ success: true, msg: "Seen serie removed."});
        }
        catch (err) {
            if (err.name === "ValidationError") {
                let errors = [];
                Object.keys(err.errors).forEach((key) => {
                    errors.push(err.errors[key].message);
                });
                return res.status(400).json({ success: false, msgs: errors });
            } 
            else
                res.status(500).json({
                    success: false, msg: err.message || "Ocorreu um erro ao criar este commentario"
                });
        };
};

exports.delete = async (req, res) => {
    try {
    const user = await User.findOneAndRemove(req.body.name).exec();
    if (!user) // returns the deleted document (if any) to the callback
    res.status(404).json({
    message: `Not found user with name=${req.body.name}.`
    });
    else
    res.status(200).json({
    message: `User name=${req.body.name} was deleted successfully.`
    });
    } catch (err) {
    res.status(500).json({
    message: `Error deleting user with name=${req.body.name}.`
    });
}}