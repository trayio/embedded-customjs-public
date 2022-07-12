/* *****************************************************************************************************
// Advanced Data Mapping
// 
// This code will allow you to populate two separate dropdown lists for a simple data mapper object
// in the config wizard. For this example, one list will be populated by using a simple hardcoded
// list of options, and the second list will be populated by using the tray.callConnector function
// used to pull data from connectors using Custom JS
*/

// The result of this action will be saved to the slotID name that is specified in the code editor window.
// e.g. previousWizardState.values.external_slotID_name

BASEURL = "" //if not part of an existing connector you can manually specify an API address
ENDPOINT = "" // optional to specify an endpoint after the BASEURL value that will return a list of fields

//The CONFIG_SLOT_MOUNT event is fired when a config slot has loaded onto the screen.//
//this call updates the previousWizardState to include the jsonSchema from the getJsonSchema function
tray.on('CONFIG_SLOT_MOUNT', async ({ event, previousWizardState, previousSlotState }) => {

    // generate the schema needed to create the data mapper
    return await generateSchema({ event, previousWizardState, previousSlotState });

});

const generateSchema = async ({ event, previousWizardState, previousSlotState }) => {

    // get the first list of options
    const list1 = await getFirstList();

    // get the second list of options. Since we will be using the tray.callConnector function for
    // this second list of options, we will need the authentication used for that connector in
    // order to retrieve the list of values
    const list2 = await getSecondList(previousWizardState, event.data.value);

    // the returned value needs to be formatted as such. The jsonSchema type will need to be an
    // array with one item of type OBJECT that holds the properties of each list. The KEY of this 
    // object will be the first list of options and the VALUE of the object
    return {
        ...previousSlotState,
        status: "VISIBLE",
        jsonSchema: {
            title: "Mapping",
            default: [],
            type: "array",
            table: {
                key: "First List of Fields",
                value: "Second List of Fields",
            },
            items: {
                title: "Custom Field Mapping",
                type: "object",
                default: {},
                properties: {
                    key: {
                        type: "string",
                        title: "First Fields",
                        enum: list1,
                    },
                    value: {
                        type: list2.type,
                        title: "Second Fields",
                        enum: list2.enum,
                    },
                },
                customValues: false,
                additionalItems: true,
                additionalProperties: false,
            },
        },
    };
};

// This first function will just be returning a hardcoded list of options.
const getFirstList = async () => {

    // every list that is returned needs to be an array that returns a list of objects that contain
    // two fields: the text field which is what the UI will show as the option in the dropdown list,
    // and the value field which is what the actual value of the option will be.
    result = [
        {
            text: 'Option 1',
            value: '1'
        },
        {
            text: 'Option 2',
            value: '2'
        },
        {
            text: 'Option 3',
            value: '3'
        },
        {
            text: 'Option 4',
            value: '4'
        },
        {
            text: 'Option 5',
            value: '5'
        }
    ];
    console.log("first list:");
    console.dir(result);
    return result;

};

// This second function will be using an example of an tray.callConnecter and using the http-request connector to build out the
// api call needed to grab a list of results to return. This example actually uses a previous use case and shows how to implement
// it into this data mapping example
const getSecondList = async (previousWizardState) => {

    // change "external_service_authentication" to the correct name of the external slot ID of the service you are using
    AUTHID = previousWizardState.values.external_service_authentication || "";

    // log the state before the call (can also use console.log(previousWizardState), either will display in the browser console)
    console.dir(previousWizardState)
    console.log(`Calling ${BASEURL}/${ENDPOINT}`);
    const response = await tray.callConnector({
        connector: 'http-client',
        version: '5.5',
        operation: 'get_request',
        // grab the authId from the auth slot specified above
        authId: previousWizardState.values[AUTHID],
        input: {
            "status_code": {
                "range": {
                    "from": 200,
                    "to": 299
                }
            },
            "follow_redirect": false,
            "case_sensitive_headers": false,
            // this will vary depending on the API requirements/Authenitcation method if needed 
            // "auth": {
            //     "basic_auth_username": {
            //         // interpolate the Acme API key into the request
            //         "username": "{$.auth.api_key}"
            //     }
            // },
            "parse_response": "true",
            "follow_keep_method": false,
            "follow_authorization_header": false,
            "url": `${BASEURL}/${ENDPOINT}`,
            "reject_unauthorized": true
        }
    })
        .then(response => JSON.parse(JSON.parse(response).response.body));
    result = {
        // the allowed values for this slot are of type 'string'
        // This will need to be configured based on the data you are receiving from the API 
        // see the comments below
        type: 'string',
        /*
        / the 'enum' property renders the slot as a dropdown
        / 'enum' takes an array of objects with properties 'text' and 'value'
        / 'text' defines the human-readable value to show to the user in the config wizard dropdown
        / 'value' defines the underlying value to set for the config slot which is then used in the workflow
        / if 'text' and 'value' are the same then instead of specifying the enum value as an object { text, value } you can just specify the va
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
    return result;

};