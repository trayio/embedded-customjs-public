

/* *****************************************************************************************************
// Authorization Checking - (non-OAuth, without existing Tray connector)
// 
// This script demonstrates how custom JS can be used to check that the authorization provided by the user 
// is valid (by using the call connector and the http-client connecotr to do a basic list action).  Other 
// actions could be used to verify that the authorization provided has the required permissions for the 
// solution being configured (create, read, update, delete, etc.).  
//
// This code also illustrates another method of passing configuration values to the script by using an object
// "customJSVariables" to hold the values needed for this script to work for your use case. 
//
//
// First, add a config slot (empty object) above the auth slot you wish to validate, (this can be a variable on a 
// javascrip Script connector in a workflow, that has then been made a config variable).
// Add this custom JS script to the slot you just added
// configure the use case by editing the customJSVaribles object
*/


//Use case configuration
const customJSVaribles = {
	validationSlotTitle: 'ACME API Validated', //Displayed string as the title of this slot - Displayed after verification 
	// completes. 
	authSlotExternalId: "external_acme_api-key_authentication", //The external ID of the auth slot you are validating
	connector: "http-client", //The connector you will be using
	version: "5.5",
	operation: "get_request",
	input: {
			"status_code": {
				"range": {
					"from": 200,
					"to": 299
				}
			},
			"follow_redirect": false,
			"case_sensitive_headers": false,
			// this will vary depending on the API requirements - the Auth in this example uses an "api-key" token which is 
			// then available via {$.auth.api-key} - if there are additional parameters, they would be similarly available 
			// once the auth is created. 
			"headers": [
				{
					"key": "api-key",
					"value": "{$.auth.api-key}"
				}
			],
			"parse_response": "true",
			"follow_keep_method": false,
			"follow_authorization_header": false,
			"url": `https://516xxxx-xxxx-xxxx-xxxx-xxxxxx23db7.trayapp.io/objects`, //the endpoint you want to verify access to
			"reject_unauthorized": true
		},
	validationLogic(response) {
		return response
	},
	validationMessages: {
		connectionError: 'Error: There was an issue connecting to the external service.',
		credentialsError: 'Error, incorrect credentials',
		awaitingValidation: 'Awaiting authentication validation.'
	}
}


//The validation function uses
const validateAuth = async ({ authId }, previousWizardState) => {
	console.log("Attempting validateAuth");
	try {
		//Use the call connector function to validate the authId
    console.log("calling call connector with authId: ");
    console.dir(authId);
		const validation = JSON.parse(await tray.callConnector({
			connector: customJSVaribles.connector,
			version: customJSVaribles.version,
			operation: customJSVaribles.operation,
			authId: authId,
			input: customJSVaribles.input
		}));
    console.log("call connector result: ");
    console.log(validation);
		//Use the validationLogic function to return true or false,
		//true value shows success, as no validation in a slot schema shows no errors
		//false vlue will return a validation object displaying an error
		return (
			customJSVaribles.validationLogic(validation) ?
				undefined :
				{
					status: 'ERROR',
					message: customJSVaribles.validationMessages.credentialsError
				}
		);

	} catch (error) {
    console.log("Validation error");
    console.log(error);
		//If there is an error with the callConnector function return a validation object displaying an error
		return {
			status: 'ERROR',
			message: customJSVaribles.validationMessages.connectionError
		};

	}

};
tray.on('CONFIG_SLOT_MOUNT', async ({ event, previousWizardState }) => {
  console.log(event);
	//If the event triggering slot is not the validation slot, return undefined
	if (event.data.externalId !== tray.env.slotExternalId) {
    console.log("not my slot");
    return;
  };
	//If the auth slot is undefined, the auth has not been completed
	//in this case, we are waiting for the user to authenticated with the service, no errors to display at this stage.
	if (previousWizardState.values[customJSVaribles.authSlotExternalId] === undefined) {
    console.log("no auth exists yet, hiding validation slot");
    return {
		...event.data,
		status: 'HIDDEN',
		value: undefined,
		jsonSchema: {
			type: 'object',
			title: customJSVaribles.validationSlotTitle,
			additionalProperties: false
		}
	};};
	//If the auth slot has an authId, it means a user has authenticated with the service
	//in this case, we want to set the slot status to loading to block completing the wizard before the auth has been validated
	console.log("Auth exists, setting Loading status")
  return {
		...event.data,
		status: 'LOADING',
		value: undefined,
		validation: {
			status: 'ERROR',
			message: customJSVaribles.validationMessages.awaitingValidation
		},
		jsonSchema: {
			type: 'object',
			title: customJSVaribles.validationSlotTitle,
			additionalProperties: false
		}
	};

});

tray.on('AUTH_SLOT_VALUE_CHANGED', async ({ event, previousWizardState }) => {
  console.log(event);
	//If the event triggering slot is not the authentication slot, return undefined
	if (event.data.externalId !== customJSVaribles.authSlotExternalId) {
    console.log("not my slot");
    return;
  };
	//If the auth slot is undefined, return undefined
	//in this case, the auth has changed its value to waiting for an authentication,
	//so we will return undefind (no change to the validation slot status)
	if (event.data.value === undefined) {
    console.log("auth slot undefined");
    return;
  };
	//The only possibility left is that an authentication has been provided
	//in this case, we set the status to LOADING to block completion before a validation has been completed
  console.log("Auth slot has value, set to LOADING"); 
	return {
		...event.data,
		status: 'LOADING',
		value: undefined,
		validation: {
			status: 'ERROR',
			message: customJSVaribles.validationMessages.awaitingValidation
		},
		jsonSchema: {
			type: 'object',
			title: customJSVaribles.validationSlotTitle,
			additionalProperties: false
		}
	};

});

tray.on('CONFIG_SLOT_STATUS_CHANGED', async ({ event, previousWizardState }) => {
  console.log(event);
	//If the event triggering slot is not the validation slot, return undefined
	if (event.data.externalId !== tray.env.slotExternalId) {
    console.log("not my validation slot");
    return;
  };
	//If the validation has previously been validated, return to not re-validate
	// if (event.data.value !== undefined) return;

	const authId = previousWizardState.values[customJSVaribles.authSlotExternalId]
  console.log("status changed event, authId:");
  console.log(authId);
	//If the authentication has not been provided, do not change the validation slot
	if (authId === undefined) {
    console.log("auth undefined, no change");
    return;
  };
	//Get the validation
  console.log("auth slot has value, validating - previousWizardState: ");
  console.dir(previousWizardState);
	const validation = await validateAuth({ authId }, previousWizardState);
	//Change status to visible
	//Set validation to an error or undefined (success)
	return {
		...event.data,
		status: 'VISIBLE',
		value: {},
		validation,
		jsonSchema: {
			type: 'object',
			title: customJSVaribles.validationSlotTitle,
			additionalProperties: false
		}
	};

});
