
var langSelect = document.querySelector('#language')
var feedUrlText = document.querySelector('#feed-url')
var tagFilterText = document.querySelector('#tag-filter')

updateFeedUrl()

langSelect.addEventListener('change', function () {
    updateFeedUrl()
})
tagFilterText.addEventListener('change', function () {
    updateFeedUrl()
})

feedUrlText.addEventListener('click', function () {
    this.select()
})

function updateFeedUrl() {
    let lang = langSelect.value
    let tag = tagFilterText.value
    let url = location.href + 'feed/rss?lang=' + encodeURIComponent(lang)
    if (tag) {
        url += '&tag=' + encodeURIComponent(tag)
    }
    feedUrlText.value = url
}
