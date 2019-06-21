var express = require('express');
var router = express.Router();

var Reflection = require('../controllers/reflection');
var UserWithDb = require('../controllers/user');
var Auth = require('../middleware/auth');

router.post('/reflections', Auth.verifyToken, Reflection.create);
router.get('/reflections', Auth.verifyToken, Reflection.getAll);
router.get('/reflections/:id', Auth.verifyToken, Reflection.getOne);
router.put('/reflections/:id', Auth.verifyToken, Reflection.update);
router.delete('/reflections/:id', Auth.verifyToken, Reflection.delete);
router.post('/users/create', UserWithDb.create);
router.post('/users/login',UserWithDb.login);
router.post('/users/updateuserinfo',Auth.verifyToken, UserWithDb.updateUserinfo);
router.delete('/users/me', Auth.verifyToken, UserWithDb.delete);
router.delete('/users/:id', Auth.verifyToken, UserWithDb.delete);
router.get('/users', UserWithDb.getList);//Auth.verifyToken, 

router.post('/users/monitor_server_game_list', Auth.verifyToken, UserWithDb.updateMonitorServers_Games);
router.get('/users/monitor_server_game_list', Auth.verifyToken, UserWithDb.getMonitorServers_Games);
router.post('/users/update_gameinfo', Auth.verifyToken, UserWithDb.update_gameinfo);
module.exports = router;
