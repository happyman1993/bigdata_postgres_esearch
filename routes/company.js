var express = require('express');
var router = express.Router();

var Company = require('../controllers/company');

router.get('/companies', Company.getList);
router.post('/company/add',Company.add);
router.delete('/company/delete', Company.delete);

module.exports = router;
