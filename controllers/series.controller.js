const db = require("../models/index.js");
const Serie = db.series;

exports.createSerie = async (req, res) => {
    
    if ( req.loggedUserRole === 'regular') {
        res.status(400).json({ message: "Must be an admin or advanced!" });
        return;
    } else if (!req.body) { // validate request body data
        res.status(400).json({ message: "Request body can not be empty!" });
        return;
    }  

    const serie = new Serie({
        title: req.body.title,
        type: req.body.type,
        realizador: req.body.realizador,
        description: req.body.description,
        image: req.body.image,
        actors: req.body.actors,
        seasons: req.body.seasons
    }) 
    
    try {
        await serie.save(); // save User in the database
        console.log(serie)
        res.status(201).json({ success: true, msg: "New serie created.", URL: `/series/${serie._id}` });
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
                    success: false, msg: err.message || "Ocorreu um erro ao criar este serie"
                });
        };
};

exports.getSeries = async (req, res) => { 
    const perPage = 6, page = req.query.page;
    try {
        let data = await Serie
            .find()
            .select('title image') // select the fields
            .skip(perPage * page)
            .limit(perPage)
            .exec();
        res.status(200).json({success: true, series: data});
        }
        catch (err) {
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while retrieving the movies."
            });
        };
}; 

exports.getSpecificSeries = async (req, res) => { 

    try {
        let data = await Serie
            .findOne({"title": req.params.serieTitle})
            .select() // select the fields
            .exec();
            
        let ratingAvg = 0;
        data.ratings.forEach(r => {
            ratingAvg += r.rating;
        });
        ratingAvg = ratingAvg / data.ratings.length

        res.status(200).json({success: true, serie: data, ratings: ratingAvg});
        }
        catch (err) {
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while retrieving the series."
            });
        };

        //get ratings with aggregate 
        //Serie.aggregate([{$group : {Rating : "rating", num_Voters : {$avg : 1}}}])
};

exports.createComment = async (req, res) => {
    
    if ( req.loggedUsername != req.params.name ) {
        res.status(400).json({ message: "Must be connected!" });
        return;
    } else if (!req.body) { // validate request body data
        res.status(400).json({ message: "Request body can not be empty!" });
        return;
    }

    let comment = {
        content: req.body.content,
        name: req.params.name
    }
    

    try {
        let data = await Serie.findOneAndUpdate(
            {"title": req.params.serieTitle},
            { $push: {comments: comment}})
            console.log(data);
        res.status(201).json({ success: true, msg: "New comment created."});
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

exports.addRating = async (req, res) => {
    
    if ( req.loggedUsername != req.params.name ) {
        res.status(400).json({ message: "Must be connected!" });
        console.log(req.loggedUserRole);
        return;
    } else if (!req.body) { // validate request body data
        res.status(400).json({ message: "Request body can not be empty!" });
        return;
    }
    
    let ratingSerie = {
        name: req.params.name,
        rating: req.body.rating
    }

    try {
        let data = await Serie.findOneAndUpdate(
            {"title": req.params.serieTitle},
            { $push: {ratings: ratingSerie}})
            console.log(data);
        res.status(201).json({ success: true, msg: "New rating added."});
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
    const serie = await Serie.deleteOne(req.params.serieTitle)
    if (!serie) // returns the deleted document (if any) to the callback
    res.status(404).json({
    message: `Not found serie with title=${req.params.serieTitle}.`, serie: serie
    });
    else
    res.status(200).json({
    message: `Serie name=${req.params.serieTitle} was deleted successfully.`
    });
    } catch (err) {
    res.status(500).json({
    message: `Error deleting serie with name=${req.params.serieTitle}.`
    });
}}