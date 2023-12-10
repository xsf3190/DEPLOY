/*
 *  Send Core Web Vital statistics for the page to Oracle database
*/
const sendCWV = ({name,value,rating}) => {
    const website_id = (<HTMLInputElement>document.querySelector("[name='website_id']")).value;
    const article_id =  (<HTMLInputElement>document.querySelector("[name='article_id']")).value;
    const cwv_url =  (<HTMLInputElement>document.querySelector("[name='visit_url']")).value;

    const body =JSON.stringify( {referrer: document.referrer, website_id: website_id, article_id: article_id, cwv_name: name, cwv_value: value, cwv_rating: rating });
    (navigator.sendBeacon && navigator.sendBeacon(cwv_url, body)) || fetch(cwv_url, {body, method: 'POST', keepalive: true});
}