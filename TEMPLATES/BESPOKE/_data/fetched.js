require('dotenv').config()

module.exports = async function() {
    console.log(process.env.APEX_SESSION);
    console.log(process.env.FETCH_URL);
    try {
        answer = await fetch(process.env.FETCH_URL, {
            method: 'GET',
            headers: {"Apex-Session": process.env.APEX_SESSION},
        });
        const result = await answer.json();
        //console.log(result);
        return result;
    } catch (err) {
        console.log("Error fetching website data: ", err);
    }
  };
