require('dotenv').config()

module.exports = async function() {
    try {
        answer = await fetch(process.env.FETCH_URL, {
            method: 'GET',
        });
        result = await answer.json();
        return { "articles": result};
    } catch (err) {
        console.log("error while fetching website parts: ", err);
    }
  };
