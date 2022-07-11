/* *****************************************************************************************************
// Authorization Checking - (non-OAuth, with an existing Tray Connector)
// 
// This script demonstrates how custom JS can be used to check that the authorization provided by the user 
// is valid (by using the call connector and the authorized service to do a basic list action).  Other 
// actions could be used to verify that the authorization provided has the required permissions for the 
// solution being configured.  
//
// This code also illustrates another method of passing configuration values to the script by using an object
// "customJSVariables" to hold the values needed for this script to work for your use case. 
//
//
// First, add a config slot (empty object) above the auth slot you wish to validate
// Add this custom JS script to the slot you just added
// configure the use case by editing the customJSVaribles object
*/


//Use case configuration
const customJSVaribles = {
	validationSlotTitle: 'BigCommerce authentication', //Displayed string as the title of this slot
	authSlotExternalId: "external_bigcommerce_authentication", //The external ID of the auth slot you are validating
	connector: "bigcommerce", //The connector you will be using
	version: "2.4",
	operation: "list_orders",
	input: {
		"limit": 1,
		"page": 1
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
const validateAuth = async ({ authId }) => {

	try {
		//Use the call connector function to validate the authId
		const validation = JSON.parse(await tray.callConnector({
			connector: customJSVaribles.connector,
			version: customJSVaribles.version,
			operation: customJSVaribles.operation,
			authId,
			input: customJSVaribles.input
		}));
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
		//If there is an error with the callConnector function return a validation object displaying an error
		return {
			status: 'ERROR',
			message: customJSVaribles.validationMessages.connectionError
		};

	}

};

tray.on('CONFIG_SLOT_MOUNT', async ({ event, previousWizardState }) => {
	//If the event triggering slot is not the validation slot, return undefined
	if (event.data.externalId !== tray.env.slotExternalId) return; 
	//If the auth slot is undefined, the auth has not been completed
	//in this case, we are waiting for the user to authenticated with the service, no errors to display at this stage.
	if (previousWizardState.values[customJSVaribles.authSlotExternalId] === undefined) return {
		...event.data,
		status: 'VISIBLE',
		value: undefined,
		jsonSchema: {
			type: 'object',
			title: customJSVaribles.validationSlotTitle,
			additionalProperties: false
		}
	};
	//If the auth slot has an authId, it means a user has authenticated with the service
	//in this case, we want to set the slot status to loading to block completing the wizard before the auth has been validated
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
	//If the event triggering slot is not the authentication slot, return undefined
	if (event.data.externalId !== customJSVaribles.authSlotExternalId) return;
	//If the auth slot is undefined, return undefined
	//in this case, the auth has changed its value to waiting for an authentication,
	//so we will return undefind (no change to the validation slot status)
	if (event.data.value === undefined) return;
	//The only possibility left is that an authentication has been provided
	//in this case, we set the status to LOADING to block completion before a validation has been completed
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

tray.on('CONFIG_SLOT_VALUE_CHANGED', async ({ event, previousWizardState }) => {
	//If the event triggering slot is not the validation slot, return undefined
	if (event.data.externalId !== tray.env.slotExternalId) return;
	//If the validation has previously been validated, return to not re-validate
	if (event.data.value !== undefined) return;

	const authId = previousWizardState.values[customJSVaribles.authSlotExternalId]
	//If the authentication has not been provided, do not change the validation slot
	if (authId === undefined) return;
	//Get the validation
	const validation = await validateAuth({ authId });
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