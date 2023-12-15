/*
 *  Send Core Web Vital statistics for the page to Oracle database
*/
var sendCWV = function (_a) {
    var name = _a.name, value = _a.value, rating = _a.rating;
    var website_id = document.querySelector("[name='website_id']").value;
    var article_id = document.querySelector("[name='article_id']").value;
    var cwv_url = document.querySelector("[name='visit_url']").value;
    var body = JSON.stringify({ referrer: document.referrer, website_id: website_id, article_id: article_id, cwv_name: name, cwv_value: value, cwv_rating: rating });
    (navigator.sendBeacon && navigator.sendBeacon(cwv_url, body)) || fetch(cwv_url, { body: body, method: 'POST', keepalive: true });
};
