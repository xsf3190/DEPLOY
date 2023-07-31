require('dotenv').config()

module.exports = (eleventyConfig) => {

    eleventyConfig.addPassthroughCopy("TEMPLATES/" + process.env.TEMPLATE + "/style.css");
    eleventyConfig.addPassthroughCopy("TEMPLATES/" + process.env.TEMPLATE + "/index.js");
    eleventyConfig.addFilter("addCss", (url) => {
        return url + "?v=" + Date.now();
    })
    eleventyConfig.addFilter("addScript", (url) => {
        return url + "?v=" + Date.now();
    });

    return {
        dir: {
            input: process.env.TEMPLATE ? "TEMPLATES/" + process.env.TEMPLATE : "/",
            output: process.env.BUILD_PATH ? process.env.BUILD_PATH : "local"
        }
    };
};
