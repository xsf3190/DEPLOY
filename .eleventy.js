require('dotenv').config()

module.exports = (eleventyConfig) => {

    eleventyConfig.addCollection("pages", async () => {

        try {
            answer = await fetch("https://hl7offzwezq2cal-db202103270929.adb.uk-london-1.oraclecloudapps.com/ords/api/public/content/believeintalking.com", {
                method: 'GET',
            });
            result = await answer.json();
            return result;
        } catch (err) {
            console.log("error while fetching website parts: ", err);
        }
    });

    eleventyConfig.addPassthroughCopy("TEMPLATES/" + process.env.TEMPLATE + "/style.css");
    eleventyConfig.addPassthroughCopy("TEMPLATES/" + process.env.TEMPLATE + "/index.js");
    eleventyConfig.addFilter("addCss", (url) => {
        return url + "?v=" + Date.now();
    })
    eleventyConfig.addFilter("addScript", (url) => {
        return url + "?v=" + Date.now();
    });
    eleventyConfig.addPassthroughCopy("TEMPLATES/" + process.env.TEMPLATE + "/*.jpg");
    eleventyConfig.addPassthroughCopy("TEMPLATES/" + process.env.TEMPLATE + "/*.png");
    eleventyConfig.addPassthroughCopy("TEMPLATES/" + process.env.TEMPLATE + "/*.svg");
    eleventyConfig.addPassthroughCopy("TEMPLATES/" + process.env.TEMPLATE + "/*.ico");
    eleventyConfig.addPassthroughCopy("TEMPLATES/" + process.env.TEMPLATE + "/*.webmanifest");

    return {
        dir: {
            input: process.env.TEMPLATE ? "TEMPLATES/" + process.env.TEMPLATE : "/",
            output: process.env.BUILD_PATH ? process.env.BUILD_PATH : "local"
        }
    };
};