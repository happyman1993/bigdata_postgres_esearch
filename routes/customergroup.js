var express = require('express');
var router = express.Router();

var cgroup = require('../controllers/customergroup');
var Auth = require('../middleware/auth');

router.get('/customergroups', Auth.verifyToken, cgroup.getList);
router.post('/customergroup/add', Auth.verifyToken,cgroup.add);
router.delete('/customergroup/:id', Auth.verifyToken, cgroup.delete);

module.exports = router;
