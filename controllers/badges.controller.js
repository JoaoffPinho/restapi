const db = require("../models/index.js");
const Badge = db.badges;

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

exports.delete = async (req, res) => {
    try {
    const badge = await Badge.findOneAndRemove(req.params.badgeTitle).exec();
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