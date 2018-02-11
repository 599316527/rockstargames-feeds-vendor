const fetch = require('node-fetch')
const compileFilter = require('mongo-query-compiler')
const cache = require('memory-cache')
const cheerio = require('cheerio')

const cacheExpire = 10 * 60 * 1e3

const languages = require('./languages.json')
exports.languages = languages

exports.getNewsData = async function getNewsData(language, tagFilter) {
    if (!isAllowedLanguage(language)) {
        throw new Error('Not allowed languages')
    }

    let tagFilterFunc = tagFilter ? getFilterFunc(tagFilter) : null

    let data = await fetchNewsList(language)

    if (tagFilterFunc) {
        data.posts = filterPostByTag(data.posts, tagFilterFunc)
        data.meta.lang = language
    }

    data.posts = data.posts.map(function (post) {
        post.tags = post.primary_tags.map(tag => tag.name).join(', ')
        return post
    })

    return data
}

async function fetchNewsList(lang) {
    let data = cache.get(lang)
    if (data) {
        let {meta, posts} = data
        // return new object literal to avoid modifying cached object
        return {meta, posts}
    }
    let response = await fetch(getNewsApiUrl({lang}))
    data = await response.json()
    data.posts = await Promise.all(data.posts.map(fullfilPreviewVideoSrc))
    cache.put(lang, data, cacheExpire)
    let {meta, posts} = data
    return {meta, posts}
}

function getNewsApiUrl({lang, pageNo = 1}) {
    lang = lang === 'en' ? '' : `${lang}/`
    return `https://www.rockstargames.com/${lang}newswire/get-posts.json?page=${pageNo}`
}

function isAllowedLanguage(lang) {
    return languages.some(function ([code]) {
        return code === lang
    })
}

function getFilterFunc(filter) {
    let filterFunc
    try {
        filterFunc = compileFilter(filter)
    }
    catch (err) {
        console.log('Fail to compile filter.', err)
        throw err
    }
    return filterFunc
}

function filterPostByTag(posts, tagFilter) {
    return posts.filter(function ({primary_tags: tags}) {
        return tags.some(tagFilter)
    })
}

async function fullfilPreviewVideoSrc(post) {
    let videoPlayer = post.preview_video_player
    if (!videoPlayer) {
        return post
    }
    let $ = cheerio.load(videoPlayer)
    let videoPageUrl = $('iframe').attr('src')
    let response = await fetch(videoPageUrl)
    let content = await response.text()
    $ = cheerio.load(content)
    let videoSrc = $('video source').attr('src')
    post.preview_video_src = videoSrc
    return post
}


