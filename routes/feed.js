const express = require('express');
const router = express.Router();

const {languages, getNewsData} = require('../lib/feed')

/* GET feed listing. */
router.get('/rss', async function (req, res, next) {
    debugger
    let {lang, tag} = req.query
    if (!lang) {
        lang = languages[0][0]
    }

    if (tag) {
        try {
            tag = JSON.parse(tag)
        }
        catch (err) {
            console.log('Fail to parse tag filter', err)
            tag = null
        }
    }

    let newsData = await getNewsData(lang, tag)
    debugger

    res.type('text/xml')
    res.render('feed', newsData)
});

router.get('/languages', function (req, res, next) {
    res.send(languages).end();
});

module.exports = router;
