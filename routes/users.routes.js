const express = require('express');
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/users.controller");

// express router
let router = express.Router();

router.route('/')
    .post(userController.createUser);

router.route('/login')
    .post(userController.login);

router.route('/ranking')
    .get(authController.verifyToken, userController.getRanking) 

router.route('/home')
    .get(userController.getHomeInfo) 

router.route('/:name')
    .get(authController.verifyToken, userController.getUserInfo)
    .patch(authController.verifyToken, userController.changeInfo);

router.route('/:name/movies/:movieTitle/favorites')
    .post(authController.verifyToken, userController.addMovieFav)
    .patch(authController.verifyToken, userController.removeMovieFav);

router.route('/:name/series/:serieTitle/favorites')
    .post(authController.verifyToken, userController.addSeriesFav)
    .patch(authController.verifyToken, userController.removeSerieFav)
    
router.route('/:name/movies/:movieTitle/seen')
    .post(authController.verifyToken, userController.addMovieSeen)
    .patch(authController.verifyToken, userController.removeMovieSeen);

router.route('/:name/series/:serieTitle/seen')
    .post(authController.verifyToken, userController.addSeriesSeen)
    .patch(authController.verifyToken, userController.removeSerieSeen)
    
router.route('/:name/quizzes/:quizzTitle')
    .patch(authController.verifyToken, userController.finishQuizz)

    router.all('*', function (req, res) {
    res.status(404).json({ message: 'USERS: what???' });
})

module.exports = router;