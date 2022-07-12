

/* *****************************************************************************************************
// Script connector in a workflow in the solution
// there are variables set to config here including data_mapping (to hold the results
// of the data_mapping from the config wizard) and boolean_option (for the check box to 
// use the default mapping instead in the config wizard)
// Note: you can add as many variables to one script connector as you like and not use them in the script; 
// setting them to Config variables pushes them into the config wizard. 
// ***************************************************************************************************** */

exports.step = ({ data_mapping, boolean_option }) => {
	//if the data_mapping array has >0 length and the boolean_option is not true (do not use defaults), return data_mapping
    if (data_mapping.length && !boolean_option) {
      return data_mapping;
    } 
	// else use the default below
	else {
      return [
        {
          lhs: 'Email',
          rhs: 'email'
        },
        {
          lhs: 'FirstName',
          rhs: 'first_name'
        },
        {
          lhs: 'LastName',
          rhs: 'last_name'
        }
      ];
    }
    
  };





/* *****************************************************************************************************
// Config Wizard Screen 4, slotExternalId = external_destination_object
// this is a drop-down list of fields from the acme api call to use for mapping record type from acme to salesforce. 
/ *****************************************************************************************************
/
/ *****************************************************************************************************
/  The code below is loaded into the custom JS for the external_destination_object slot.  
/  We use the CONFIG_SLOT_MOUNT event to load the dropdown schema when the screen has loaded
/  As the only properties we need to amend are the status and jsonSchema, we assign these to the existing slot state in event.data
/ ***************************************************************************************************** */

//The CONFIG_SLOT_MOUNT event is fired when a config slot has loaded onto the screen.//
tray.on('CONFIG_SLOT_MOUNT', async({event, previousWizardState}) => ({
    ...event.data,
        status: 'VISIBLE',
        jsonSchema: await getJsonSchema({
            previousWizardState
        }),
	}));

async function getJsonSchema({previousWizardState}) {
    	// log the state before the call (can also use console.dir(previousWizardState), for an interactive view in the console.)
		console.log(previousWizardState)
		// use the Http Client connector to call the Acme API
		const response = await tray.callConnector({
				connector: 'http-client',
				version: '5.5',
				operation: 'get_request',
				// grab the authId from the Acme API auth slot
				authId: previousWizardState.values.external_acme_authentication,
				input: {
					"status_code": {
						"range": {
							"from": 200,
							"to": 299
						}
					},
					"follow_redirect": false,
					"case_sensitive_headers": false,
					// this will vary depending on the API requirements
					"auth": {
						"basic_auth_username": {
							// interpolate the Acme API key into the request
							"username": "{$.auth.api_key}"
						}
					},
					"parse_response": "true",
					"follow_keep_method": false,
					"follow_authorization_header": false,
					"url": `https://baed3e39-xxxx-xxxx-xxxx-xxxxxxxx35ac.trayapp.io/objects/`,
					"reject_unauthorized": true
				}
			})
			.then(response => JSON.parse(JSON.parse(response).response.body));
		return {
			// the allowed values for this slot are of type 'string'
			type: 'string',
			/*
			/the 'enum' property renders the slot as a dropdown
			/'enum' takes an array of objects with properties 'text' and 'value'
			/'text' defines the human-readable value to show to the user in the config wizard dropdown
			/'value' defines the underlying value to set for the config slot which is then used in the workflow
			/if 'text' and 'value' are the same then instead of specifying the enum value as an object { text, value } you can just specify the va
			/e.g. enum: [ 1, 2, 3 ] will render a dropdown list where the user can pick from the 3 options 1, 2 or 3.
			/this is identical to specifying enum: [ { text: 1, value: 1 }, ... ] in this scenario
			*/
			enum: response.results.map(({
				name, typename
			}) => ({
				text: name,
				value: typename
			}))
		};
	}	



/* *****************************************************************************************************
// Config Wizard Screen 5, slotExternalId = external_acme-fields
// this is a drop-down list of record-type fields from the salesforce trigger in the solution workflow.  
// ***************************************************************************************************** */

//The CONFIG_SLOT_MOUNT event is fired when a config slot has loaded onto the screen.//
tray.on('CONFIG_SLOT_MOUNT', async ({ event, previousWizardState }) => {
	//this line ignores events not related to this specific slot.
	if (event.data.externalId !== tray.env.slotExternalId) return;

	// this call is dependent on the object selected on the previous screen of the wizard
	const acmeObject = previousWizardState.values.external_destination_object;
	
	// use the Http Client connector to call the Acme API
	const response = await tray.callConnector({
		connector: 'http-client',
		version: '5.5',
		operation: 'get_request',
		input: {
			"status_code": {
				"range": {
					"from": 200,
					"to": 299
				}
			},
			"follow_redirect": false,
			"case_sensitive_headers": false,
			"auth": {},
			"parse_response": "true",
			"follow_keep_method": false,
			"follow_authorization_header": false,
			// interpolate the Acme object into the request path
			"url": `https://baed3e39-xxxx-xxxx-xxxx-xxxxxxxx35ac.trayapp.io/objects/${acmeObject}/fields`,
			"reject_unauthorized": true
		}
	})
	.then(response => JSON.parse(JSON.parse(response).response.body));
	
	return {
		...event.data,
		// hide the slot from view in the wizard
		status: 'HIDDEN',
		// output the list of fields to pick from in the data mapping component
		value: response.results.map(({ name, typename }) => ({ text: name, value: typename }))
	};
	
});



/* *****************************************************************************************************
// Config Wizard Screen 6, slotExternalId = external_data_mapping
// this is a drop-down list of record-type fields from the salesforce trigger in the solution workflow.  
// ***************************************************************************************************** */

/*  Note on screen:
/ "This screen shows an alternative way to achieve the data mapping on the previous screen, 
/ with the added complexity that the Data Mapping can be shown or hidden dynamically. 
/ This necessitates building a Data Mapping component similar to the native feature."
*/

// this is a different way of declaring an async function  than used above 

const getJsonSchema = async (previousWizardState) => {
	
	const acmeObject = previousWizardState.values.external_destination_object;

	const salesforceAuth = previousWizardState.values.external_salesforce_authentication;
	const salesforceObject = previousWizardState.values.external_salesforce_entity;

  // use Promise.all in order to parallelise requests
	const [ acmeFields, salesforceFields ] = await Promise.all([
   	await tray.callConnector({
    	connector: 'http-client',
      version: '5.5',
      operation: 'get_request',
      input: {
        "status_code": {
          "range": {
            "from": 200,
            "to": 299
          }
        },
        "follow_redirect": false,
        "case_sensitive_headers": false,
        "parse_response": "true",
        "follow_keep_method": false,
        "follow_authorization_header": false,
        "url": `https://baed3e39-xxxx-xxxx-xxxx-xxxxxxxx35ac.trayapp.io/objects/${acmeObject}/fields`,
        "reject_unauthorized": true
      }
    })
    .then(response => JSON.parse(JSON.parse(response).response.body))
		.then(result => result.results.map(({ name, typename }) => ({ text: name, value: typename }))),
		await tray.callConnector({
			connector: 'salesforce',
			version: '8.4',
			operation: 'so_object_describe',
			authId: salesforceAuth,
			input: {
				object: salesforceObject
			}
		})
		.then(res => JSON.parse(res))
		.then(result => result.fields.map(({ label, name }) => ({ text: label, value: name })))
	]);

	console.log('acmeFields', acmeFields);
	console.log('salesforceFields', salesforceFields);
	
	return {
    /* note when using custom javascript, we define the mapping dictionary as an array type
    instead of the object type used in the native data mapping feature
    this is because the array type supports the 'table' property which allows us to present a UX-friendly component
    the 'table' property defines the column titles to show in the wizard
    the key names inside the 'properties' property define the keys set in the config slot when the user has entered their mappings
    */
		type: 'array',
		table: { lhs: 'Salesforce field', rhs: 'Acme field' },
		items: {
			title: 'mapping',
			type: 'object',
			properties: {
				lhs: {
					title: 'Salesforce field',
					type: 'string',
          // display the dropdown of options to the user
					enum: salesforceFields
				},
				rhs: {
					title: 'Acme field',
					type: 'string',
					enum: acmeFields
				}
			},
      // limit the user to only the specified columns
			additionalProperties: false
		}
	};
	
}
//The CONFIG_SLOT_MOUNT event is fired when a config slot has loaded onto the screen.//
tray.on('CONFIG_SLOT_MOUNT', async ({ event, previousWizardState }) => {

	console.log('previousWizardState', previousWizardState);
	
	if (previousWizardState.values.external_use_default_mapping === true) {
		
		return {
			...event.data,
			status: 'HIDDEN'
		};
		
	} else {
		
		return {
			...event.data,
			status: 'VISIBLE',
			jsonSchema: await getJsonSchema(previousWizardState)
		};
		
	}
	
});

//The CONFIG_SLOT_VALUE_CHANGED event is fired when the value of a config slot has been changed.//
tray.on('CONFIG_SLOT_VALUE_CHANGED', ({ event, previousWizardState, previousSlotState }) => {

	console.log('event', event);
	//this is a status toggle for the mapping interface if the default is checked or not
	if (event.data.externalId === 'external_use_default_mapping' && event.data.value === false) {
		
		return {
			...previousSlotState,
			status: 'LOADING'
		};
		
	} else if (event.data.externalId === 'external_use_default_mapping' && event.data.value === true) {
		
		return {
			...previousSlotState,
			status: 'HIDDEN'
		};
		
	}
	
});
//The CONFIG_SLOT_STATUS_CHANGED event is fired when the status of a config slot has been changed. (e.g. "LOADING", "VISIBLE", "HIDDEN")//
tray.on('CONFIG_SLOT_STATUS_CHANGED', async ({ event, previousWizardState }) => {

	console.log('event', event);
	// this is checking for status "LOADING" to trigger the getJsonSchema function
	if (event.data.externalId === tray.env.slotExternalId && event.data.status === 'LOADING') {

		return {
			...event.data,
			status: 'VISIBLE',
			jsonSchema: await getJsonSchema(previousWizardState)
		};
		
	}
	
});

