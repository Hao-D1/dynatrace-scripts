const bearer_token = "process.env.BEARER_TOKEN";
const account_uuid = "process.env.ACCOUNT_UUID";

const myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer " + bearer_token);
myHeaders.append("Accept", "application/json");

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};

//Fetch the UUID of all groups within an account
async function fetchGroupUUIDs() {
  try {
    const response = await fetch(`https://api.dynatrace.com/iam/v1/accounts/${account_uuid}/groups`, requestOptions);
    const result = await response.json();

    if (result.items && Array.isArray(result.items)) {
      const groupInfoArray = result.items.map(item => ({
        uuid: item.uuid,
        name: item.name
      }));
      return groupInfoArray;
    } else {
      console.error("Unexpected response format:", result);
      return [];
    }
  } catch (error) {
    console.error("Error fetching UUIDs:", error);
    return [];
  }
}

//Fetch all users of a specific group
async function fetchGroupUsers(groupInfoArray) {
  for (const group of groupInfoArray) {
    const url = `https://api.dynatrace.com/iam/v1/accounts/${account_uuid}/groups/${group.uuid}/users`;

    try {
      const response = await fetch(url, requestOptions);
      const result = await response.json();
      const emails = result.items.map(item => item.email);
      console.log(`Users in "${group.name}" ${group.uuid}:`, emails);
    } catch (error) {
      console.error(`Error fetching users for group ${group.uuid}:`, error);
    }
  }
}

async function main() {
  const groupInfoArray = await fetchGroupUUIDs();
  await fetchGroupUsers(groupInfoArray); 
}

main();



