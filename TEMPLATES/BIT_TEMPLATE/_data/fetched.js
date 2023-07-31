module.exports = async function() {
    try {
        answer = await fetch("https://hl7offzwezq2cal-db202103270929.adb.uk-london-1.oraclecloudapps.com/ords/api/public/content/markrussellbrown.com", {
            method: 'GET',
        });
        result = await answer.json();
        return { "articles": result};
    } catch (err) {
        console.log("error while fetching website parts: ", err);
    }
  };
