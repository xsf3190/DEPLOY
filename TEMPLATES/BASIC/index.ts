console.log("Welcome!");
console.log("Please contact us at contact@meijerdesign.nl");

const wrapper = document.body.children.item(0);
const footer = wrapper?.children.item(2);
const nav = document.body.children.item(1);
const button = document.body.children.item(2);
const website_id = document.querySelector("[name='website_id']");
const article_id = document.querySelector("[name='article_id']");
const visit_url = document.querySelector("[name='visit_url']");
var navOpen = false;

// Menu logic
if (wrapper && nav && button) {
    button.addEventListener("click", () => {
        if (!wrapper || !nav || !button) return;

        if (navOpen) {
            wrapper.classList.remove("fade");
            nav.classList.remove("navOpen");
            button.classList.remove("closeButton");
        } else {
            wrapper.classList.add("fade");
            nav.classList.add("navOpen");
            button.classList.add("closeButton");
        }
        navOpen = !navOpen;
    });

    wrapper.addEventListener("click", (e: Event) => {
        if (!wrapper || !nav || !button) return;

        if (navOpen) {
            navOpen = !navOpen;
            wrapper.classList.remove("fade");
            nav.classList.remove("navOpen");
            button.classList.remove("closeButton");
            e.preventDefault();
        }
    });

    const firstChildHeader = wrapper.children.item(0)?.children.item(0);
    if (firstChildHeader?.tagName === "IMG") {
        firstChildHeader.addEventListener("click", () => {
            if(navOpen) return;
            firstChildHeader.classList.add("openImage");
            setTimeout(() => {
                firstChildHeader.classList.remove("openImage");
            }, 3000);
        });
    }
}

const submitted = sessionStorage.getItem("formSubmitted") === "submitted";
if (submitted) {
    const formBtn = <HTMLButtonElement> document.querySelector("form > button");
    formBtn.disabled = true;
}

// Contact Form
var textareaStr = "";
const formElem = document.querySelector("form");
const formSpan = formElem?.querySelector("span");
document.querySelector("textarea")?.addEventListener("input", () => {
    const area = document.querySelector("textarea");
    if (!area) return;

    if (area.value.length >= 400) {
        area.value = textareaStr;
        const formSpan = formElem?.children?.item(6);
        if (!formSpan) return;
        formSpan.classList.add("form-notification");
        formSpan.innerHTML = "Sorry, cannot add more."
    } else {
        formSpan?.classList.remove("form-notification");
        textareaStr = area?.value || "";
    }
});

document.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();

    const formData = new FormData(formElem || undefined);
    formElem?.querySelector("button")?.classList.add("submitting");

    const aws_gateway_url = (formElem?.querySelector("button") as HTMLButtonElement)?.dataset.url

    if(!aws_gateway_url){
        if (formSpan){
            formSpan.classList.add("form-notification");
            formSpan.innerHTML = "Cannot submit, please send an email.";
            formElem?.querySelector("button")?.classList.remove("submitting");
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
    }).then((response) => {
        if (response.status) {
            sessionStorage.setItem("formSubmitted", "submitted");
            formElem?.querySelector("button")?.classList.remove("submitting");
            document.querySelector("dialog")?.showModal();
            const formBtn = <HTMLButtonElement> document.querySelector("form > button");
            formBtn.disabled = true;
            return;
        }
        throw new Error("Could not submit request");
    }).catch( (error) => {
        if (!formSpan) return;
        formSpan.classList.add("form-notification");
        formSpan.innerHTML = "Cannot submit, please send an email.";
        formElem?.querySelector("button")?.classList.remove("submitting");
        console.error(error);
    });
});

const popupClose = document.querySelector("dialog button.close");
popupClose?.addEventListener("click", () => {
    document.querySelector("dialog")?.close();
})

// Set correct year in footer
const copyRightDiv = footer?.children.item(2)?.children.item(1);
if (copyRightDiv) {
    copyRightDiv.innerHTML = new Date().getFullYear().toString();
}

const sendCWV = ({name,value,rating}) => {
        const url = visit_url.value;
        const body =JSON.stringify( {referrer: document.referrer, website_id: website_id.value, article_id: article_id.value, cwv_name: name, cwv_value: value, cwv_rating: rating });
        //console.log(body);
        (navigator.sendBeacon && navigator.sendBeacon(url, body)) || fetch(url, {body, method: 'POST', keepalive: true});
}