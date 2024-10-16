# THIS IS NOT AN OFFICIAL SCRIPT CREATED BY DYNATRACE
import os
import requests
import json

# Function to make a GET request
def get_api_data(url, headers):
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to retrieve data from {url}: {response.status_code}")
        return None

# First API request to get entity IDs
url1 = "https://sbu10597.sprint.dynatracelabs.com/api/v2/entities"
params = {
    "entitySelector": "type(host), tag(\"Monitoring_mode\")"
}
headers = {
    "Accept": "application/json",
    "Authorization": os.getenv('API_TOKEN')
}

# Make the API request
getHosts = requests.get(url1, headers=headers, params=params)

    
if getHosts.status_code == 200:
    first_api_response = getHosts.json()
    
    # Check if 'entities' exists and has values
    if first_api_response.get('entities'):
        # Extract entity IDs and names
        entity_ids = [entity['entityId'] for entity in first_api_response['entities']]
        entity_names = [entity['displayName'] for entity in first_api_response['entities']]

        # Print the extracted information
        print("Entity IDs from API 1:", entity_ids)
        print("Entity Names from API 1:", entity_names)
    else:
        print("No entities found in the response")
else:
    print(f"Failed with status code: {getHosts.status_code}")
    print(getHosts.text)

# Extract host IDs
host_ids = [entity['entityId'] for entity in first_api_response['entities']]
print(host_ids)
# Second API request to get host monitoring status. Returns either True or False
# Iterate through host_ids and call the second API for each host
for host_id in host_ids:
    url2 = "https://sbu10597.sprint.dynatracelabs.com/api/v2/settings/objects"
    params = {
        "schemaIds": "builtin:host.monitoring",
        "scopes": host_id,
        "fields": "value"
    }
    headers.update({
        "Content-Type": "application/json; charset=utf-8"
    })

    hostMonitoringStatus = requests.get(url2, headers=headers, params=params)
    
    if hostMonitoringStatus.status_code == 200:
        # Process the second API response
        second_api_response = hostMonitoringStatus.json()

        # Extract the 'enabled' value
        enabled_value = second_api_response['items'][0]['value']['enabled']
        print(f"Enabled value for {host_id}: {enabled_value}")

        # Toggle the 'enabled' value (True -> False, False -> True)
        new_enabled_value = not enabled_value

        # Data for the third API call
        data = [
            {
                "schemaId": "builtin:host.monitoring",
                "scope": host_id,
                "value": {
                    "enabled": new_enabled_value  # Use the toggled value
                }
            }
        ]

        # Third API request to change the monitoring mode
        updateMonitoring = requests.post(url2, headers=headers, data=json.dumps(data))

        # Output the result of the third API call
        print(f"Response for entity {host_id}: {updateMonitoring.status_code}")
        print(updateMonitoring.json())

    else:
        print(f"Failed to retrieve data for {host_id}, status code: {hostMonitoringStatus.status_code}")