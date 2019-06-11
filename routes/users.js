var express = require('express');
var router = express.Router();

var Reflection = require('../controllers/Reflection');
var UserWithDb = require('../controllers/user');
var Auth = require('../middleware/Auth');

router.post('/reflections', Auth.verifyToken, Reflection.create);
router.get('/reflections', Auth.verifyToken, Reflection.getAll);
router.get('/reflections/:id', Auth.verifyToken, Reflection.getOne);
router.put('/reflections/:id', Auth.verifyToken, Reflection.update);
router.delete('/reflections/:id', Auth.verifyToken, Reflection.delete);
router.post('/users/create', UserWithDb.create);
router.post('/users/login',UserWithDb.login);
router.post('/users/updatepassword',Auth.verifyToken, UserWithDb.updatePassword);
router.delete('/users/me', Auth.verifyToken, UserWithDb.delete);
router.delete('/users/:id', Auth.verifyToken, UserWithDb.delete);
router.get('/users', UserWithDb.getList);//Auth.verifyToken, 

router.post('/users/monitor_server_game_list', Auth.verifyToken, UserWithDb.updateMonitorServers_Games);
router.get('/users/monitor_server_game_list', Auth.verifyToken, UserWithDb.getMonitorServers_Games);

module.exports = router;
