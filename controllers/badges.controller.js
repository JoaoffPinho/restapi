const db = require("../models/index.js");
const Badge = db.badges;
const User = db.users;

exports.createBadge = async (req, res) => {
    
    if ( req.loggedUserRole === 'regular') {
        res.status(400).json({ message: "Must be an admin or advanced!" });
        return;
    } else if (!req.body) { // validate request body data
        res.status(400).json({ message: "Request body can not be empty!" });
        return;
    }

    const badge = new Badge({
        title: req.body.title,
        image: req.body.image,
        reqPoints: req.body.reqPoints
    })
    
    try {
        await badge.save(); // save User in the database
        console.log(badge)
        res.status(201).json({ success: true, msg: "New badge created.", URL: `/badges/${badge._id}` });
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
                    success: false, msg: err.message || "Ocorreu um erro ao criar este movie"
                });
        };
};

exports.getBadges = async (req, res) => { 
    if ( req.loggedUsername != req.params.name ) {
        res.status(400).json({ message: "Must be connected!" });
        return;
    }



    const perPage = 10, page = req.query.page;
    
    
    try {
        const user = await User
        .findOne({"name": req.params.name})
        .exec();


        if(req.loggedRole == 'admin'){
            let data = await Badge
            .find()
            .select('title image') // select the fields
            .skip(perPage * page)
            .limit(perPage)
            .exec();
            res.status(200).json({success: true, badges: data});
        } else {
            let data = await Badge
            .find({ reqPoints: { $lt: user.points } })
            .select('title image') // select the fields
            .skip(perPage * page)
            .limit(perPage)
            .exec();
            res.status(200).json({success: true, badges: data});
        }
        



        }
        catch (err) {
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while retrieving the movies."
            });
        };
}; 

exports.delete = async (req, res) => {
    if ( req.loggedUserRole === 'regular') {
        res.status(400).json({ message: "Must be an admin or advanced!" });
        return;
    }

    try {
    const badge = await Badge.deleteOne({"title": req.params.badgeTitle}).exec();
    if (!badge) // returns the deleted document (if any) to the callback
    res.status(404).json({
    message: `Not found Badge with title=${req.params.badgeTitle}.`
    });
    else
    res.status(200).json({
    message: `Badge id=${badgeTitle} was deleted successfully.`
    });
    } catch (err) {
    res.status(500).json({
    message: `Error deleting Badge with name=${req.params.badgeTitle}.`
    });
}}