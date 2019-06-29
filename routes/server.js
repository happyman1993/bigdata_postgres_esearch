var express = require('express');
var router = express.Router();

var Server = require('../controllers/server');
var Auth = require('../middleware/auth');

router.get('/servers', Auth.verifyToken, Server.getList);
router.post('/server/add', Auth.verifyToken,Server.add);
router.delete('/server/delete', Auth.verifyToken, Server.delete);

module.exports = router;
