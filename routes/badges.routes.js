const express = require('express');
const authController = require("../controllers/auth.controller");
const badgeController = require("../controllers/badges.controller");

// express router
let router = express.Router();


router.route('/')    
    .post(authController.verifyToken, badgeController.createBadge);

router.route('/users/:name')
    .get(authController.verifyToken, moviesController.getBadges)

router.route('/:badgeTitle/users/:name/remove')
    .delete(authController.verifyToken, badgeController.delete)

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: 'Badges: what???' });
})

module.exports = router;