/* *****************************************************************************************************
// Dynamic Drop Down Lists
*/


// The result of this action will be saved to the slotID name that is specified in the code editor window.
// e.g. previousWizardState.values.external_slotID_name

// These variables only need to be populated if you are using the Call Connector to call the http-client
// Call Connector calls to existing Tray connectors (e.g. Slack, Salesforce, etc.) are preconfigured with the
// correct endpoints for the operation you specify.
BASEURL = "" // if not part of an existing connector you can manually specify an API address
ENDPOINT = "" // optional to specify an endpoint after the BASEURL value 

AUTHID = "external_service_authentication" //change this to the correct name (as a string) of the external slot ID of
//  the authentication for the API collected in a screen before this one. 

// The CONFIG_SLOT_MOUNT event is fired when a config slot has loaded onto the screen.
// This call updates the previousWizardState to include the jsonSchema from the getJsonSchema function
tray.on('CONFIG_SLOT_MOUNT', async({event, previousWizardState}) => ({
        ...event.data,
        status: 'VISIBLE',
        jsonSchema: await getJsonSchema({
            previousWizardState
        }),
	}));

async function getJsonSchema({previousWizardState}) {
    	// log the state before the call (console.dir works in chrome, you can also use console.log(previousWizardState), either will display in the browser console)
		console.dir(previousWizardState)
		// use the Http Client connector to call the API if there isn't a connector for the service 
        // (https://tray.io/documentation/embedded/advanced-topics/call-connector/)
		const response = await tray.callConnector({
				connector: 'http-client',
				version: '5.5',
				operation: 'get_request',
				// grab the authId from the auth slot collected prior
				authId: previousWizardState.values[AUTHID],
                // input varies depending on the connector you are calling - if it is a Tray connector the input is the required fields for the call
                // http-client connector has the most flexibility but requires more complex input. (https://tray.io/documentation/connectors/core/http-client/)
				input: {
					"status_code": {
						"range": {
							"from": 200,
							"to": 299
						}
					},
					"follow_redirect": false,
					"case_sensitive_headers": false,
					// this will vary depending on the API requirements/Authenitcation method 
					"auth": {
						"basic_auth_username": {
							// interpolate the Acme API key into the request
							"username": "{$.auth.api_key}"
						}
					},
					"parse_response": "true",
					"follow_keep_method": false,
					"follow_authorization_header": false,
					"url": `${BASEURL}/${ENDPOINT}`,
					"reject_unauthorized": true
				}
			})
			.then(response => JSON.parse(JSON.parse(response).response.body));
		return {
			// the allowed values for this slot are of type 'string'
			// This will need to be configured based on the data you are receiving from the API 
			// see the comments below
			type: 'string',
			/*
			/ the 'enum' property renders the slot as a dropdown
			/ 'enum' takes an array of objects with properties 'text' and 'value'
			/ 'text' defines the human-readable value to show to the user in the config wizard dropdown
			/ 'value' defines the underlying value to set for the config slot which is then used in the workflow
			/ if 'text' and 'value' are the same then instead of specifying the enum value as an object { text, value } you can just specify the value
			/ e.g. enum: [ 1, 2, 3 ] will render a dropdown list where the user can pick from the 3 options 1, 2 or 3.
			/ this is identical to specifying enum: [ { text: 1, value: 1 }, ... ] in this scenario
			*/
			enum: response.results.map(({
				name, typename
			}) => ({
				text: name,
				value: typename
			}))
		};
	}	

