console.log("Welcome!");
console.log("Please contact us at contact@meijerdesign.nl");

// Menu 
const button = document.querySelector("[aria-label='Navigation Menu']");
const nav = document.querySelector("nav.text");
const main = document.querySelector("main");

let navOpen = false;

button.addEventListener("click", () => {
  if (navOpen) {
    nav.classList.remove("navOpen");
    button.classList.remove("closeButton");
    main.classList.remove("fade");
  } else {
    nav.classList.add("navOpen");
    button.classList.add("closeButton");
    main.classList.add("fade");
  }
  navOpen = !navOpen;
});

const formBtn = <HTMLButtonElement> document.querySelector("form > button");
if (formBtn) {
    const submitted = sessionStorage.getItem("formSubmitted") === "submitted";
    if (submitted) {
        formBtn.disabled = true;
    }
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

const sendCWV = ({name,value,rating}) => {
    const website_id = (<HTMLInputElement>document.querySelector("[name='website_id']")).value;
    const article_id =  (<HTMLInputElement>document.querySelector("[name='article_id']")).value;
    const cwv_url =  (<HTMLInputElement>document.querySelector("[name='visit_url']")).value;

    const body =JSON.stringify( {referrer: document.referrer, website_id: website_id, article_id: article_id, cwv_name: name, cwv_value: value, cwv_rating: rating });
    //console.log(name,value,rating,document.referrer);
    (navigator.sendBeacon && navigator.sendBeacon(cwv_url, body)) || fetch(cwv_url, {body, method: 'POST', keepalive: true});
}