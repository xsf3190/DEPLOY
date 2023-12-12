require('dotenv').config()

module.exports = async function() {
    console.log(process.env.APEX_SESSION);
    console.log(process.env.FETCH_URL);
    try {
        answer = await fetch(process.env.FETCH_URL, {
            method: 'GET',
            headers: {"Apex-Session": process.env.APEX_SESSION},
        });
        if (answer.status !== 200) {
            console.error("Status: "+answer.status+" .. aborting process.");
            return null;
        }
        const result = await answer.json();
        return result;
    } catch (err) {
        console.error("Error fetching website data: ", err);
    }
  };
