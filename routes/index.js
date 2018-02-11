const express = require('express');
const router = express.Router();
const {languages} = require('../lib/feed');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Rockstargames Feeds Vendor',
        languages
    });
});

module.exports = router;
