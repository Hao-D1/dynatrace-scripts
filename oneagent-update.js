// THIS IS NOT AN OFFICIAL SCRIPT CREATED BY DYNATRACE

// First API request to get entity IDs
const url = "https://sbu10597.sprint.dynatracelabs.com/api/v2/entities?entitySelector=type%28host%29%2C%20tag%28%22script%22%29&fields=properties.installerVersion";
const headers = {
    "Accept": "application/json",
    "Authorization": process.env.API_TOKEN
};

// Declare latestMinorVersion to use later
let latestMinorVersion;

fetch(url, { method: 'GET', headers: headers })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`Failed to retrieve data: ${response.status}`);
        }
    })
    .then(data => {
        // Replace with the string you want to check for
        const specific_string = "script";
        const entity_ids = [];
        const entity_names = [];
        const entity_version = [];

        data.entities.forEach(entity => {
            if (entity.displayName.includes(specific_string)) {
                entity_ids.push(entity.entityId);
                entity_names.push(entity.displayName);
                entity_version.push(entity.properties.installerVersion);
            }
        });

        console.log("Host ID:", entity_ids[0]);
        console.log("Host Name:", entity_names[0]);
        const entityMinorVersion = entity_version[0].split('.')[1];
        console.log("Entity Minor Version:", entityMinorVersion);

        // Second API request to get latest OneAgent version available within your environment
        const url2 = 'https://sbu10597.sprint.dynatracelabs.com/api/v1/deployment/installer/agent/unix/default/latest/metainfo?flavor=default&arch=all&bitness=all';
        fetch(url2, {
          method: 'GET',
          headers: headers,
        })
        .then(response => {
          return response.json();
        })
        .then(responseData => {
          latestMinorVersion = responseData.latestAgentVersion.split('.')[1];
          console.log("Latest Minor Version:", latestMinorVersion);

          // Now that we have both versions, compare them
          if (parseInt(entityMinorVersion) < parseInt(latestMinorVersion)) {
            console.log("Older version");
          } else {
            console.log("Latest version", entity_ids);
          }
        });
    })
    .catch(error => {
        console.error(error);
    });
