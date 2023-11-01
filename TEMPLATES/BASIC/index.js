var _a;
console.log("Welcome!");
console.log("Please contact us at contact@meijerdesign.nl");
// Menu 
var button = document.querySelector("[aria-label='Navigation Menu']");
var nav = document.querySelector("nav.text");
var main = document.querySelector("main");
var navOpen = false;
button.addEventListener("click", function () {
    if (navOpen) {
        nav.classList.remove("navOpen");
        button.classList.remove("closeButton");
        main.classList.remove("fade");
    }
    else {
        nav.classList.add("navOpen");
        button.classList.add("closeButton");
        main.classList.add("fade");
    }
    navOpen = !navOpen;
});
var formBtn = document.querySelector("form > button");
if (formBtn) {
    var submitted = sessionStorage.getItem("formSubmitted") === "submitted";
    if (submitted) {
        formBtn.disabled = true;
    }
}
// Contact Form
var textareaStr = "";
var formElem = document.querySelector("form");
var formSpan = formElem === null || formElem === void 0 ? void 0 : formElem.querySelector("span");
(_a = document.querySelector("textarea")) === null || _a === void 0 ? void 0 : _a.addEventListener("input", function () {
    var _a;
    var area = document.querySelector("textarea");
    if (!area)
        return;
    if (area.value.length >= 400) {
        area.value = textareaStr;
        var formSpan_1 = (_a = formElem === null || formElem === void 0 ? void 0 : formElem.children) === null || _a === void 0 ? void 0 : _a.item(6);
        if (!formSpan_1)
            return;
        formSpan_1.classList.add("form-notification");
        formSpan_1.innerHTML = "Sorry, cannot add more.";
    }
    else {
        formSpan === null || formSpan === void 0 ? void 0 : formSpan.classList.remove("form-notification");
        textareaStr = (area === null || area === void 0 ? void 0 : area.value) || "";
    }
});
document.addEventListener("submit", function (e) {
    var _a, _b, _c;
    e.preventDefault();
    var formData = new FormData(formElem || undefined);
    (_a = formElem === null || formElem === void 0 ? void 0 : formElem.querySelector("button")) === null || _a === void 0 ? void 0 : _a.classList.add("submitting");
    var aws_gateway_url = (_b = formElem === null || formElem === void 0 ? void 0 : formElem.querySelector("button")) === null || _b === void 0 ? void 0 : _b.dataset.url;
    if (!aws_gateway_url) {
        if (formSpan) {
            formSpan.classList.add("form-notification");
            formSpan.innerHTML = "Cannot submit, please send an email.";
            (_c = formElem === null || formElem === void 0 ? void 0 : formElem.querySelector("button")) === null || _c === void 0 ? void 0 : _c.classList.remove("submitting");
        }
        throw new Error("no valid url found");
    }
    fetch(aws_gateway_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({
            name: formData.get("name"),
            email: formData.get("email"),
            message: formData.get("message"),
            contactEmail: formData.get("contactEmail"),
            signatureContactEmail: formData.get("signatureContactEmail")
        }),
    }).then(function (response) {
        var _a, _b;
        if (response.status) {
            sessionStorage.setItem("formSubmitted", "submitted");
            (_a = formElem === null || formElem === void 0 ? void 0 : formElem.querySelector("button")) === null || _a === void 0 ? void 0 : _a.classList.remove("submitting");
            (_b = document.querySelector("dialog")) === null || _b === void 0 ? void 0 : _b.showModal();
            var formBtn_1 = document.querySelector("form > button");
            formBtn_1.disabled = true;
            return;
        }
        throw new Error("Could not submit request");
    }).catch(function (error) {
        var _a;
        if (!formSpan)
            return;
        formSpan.classList.add("form-notification");
        formSpan.innerHTML = "Cannot submit, please send an email.";
        (_a = formElem === null || formElem === void 0 ? void 0 : formElem.querySelector("button")) === null || _a === void 0 ? void 0 : _a.classList.remove("submitting");
        console.error(error);
    });
});
var popupClose = document.querySelector("dialog button.close");
popupClose === null || popupClose === void 0 ? void 0 : popupClose.addEventListener("click", function () {
    var _a;
    (_a = document.querySelector("dialog")) === null || _a === void 0 ? void 0 : _a.close();
});
var sendCWV = function (_a) {
    var name = _a.name, value = _a.value, rating = _a.rating;
    var website_id = document.querySelector("[name='website_id']").value;
    var article_id = document.querySelector("[name='article_id']").value;
    var cwv_url = document.querySelector("[name='visit_url']").value;
    var body = JSON.stringify({ referrer: document.referrer, website_id: website_id, article_id: article_id, cwv_name: name, cwv_value: value, cwv_rating: rating });
    //console.log(name,value,rating,document.referrer);
    (navigator.sendBeacon && navigator.sendBeacon(cwv_url, body)) || fetch(cwv_url, { body: body, method: 'POST', keepalive: true });
};
