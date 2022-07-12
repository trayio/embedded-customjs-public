# Tray.io Example Embedded Config Wizard Custom JavaScript

## Intro
This is a combined file of the different examples of Custom JS demonstrated in the [sample solution documented here](https://tray.io/documentation/embedded/advanced-topics/custom-js/examples/).  Please review the [documentation on Custom JS](https://tray.io/documentation/embedded/advanced-topics/custom-js/custom-js-intro/) for an overview of the intended use cases, a [description of the components](https://tray.io/documentation/embedded/advanced-topics/custom-js/components/), and [recommended best practices](https://tray.io/documentation/embedded/advanced-topics/custom-js/best-practices/).

*Custom JS is a feature that is not included with all accounts.  If you do not have access to it on your account and you require it for your use case, contact your Account Manager for assistance.* 

## File Structure
This file is a combined file of all the sample code included in the Example solution described on the [examples page](https://tray.io/documentation/embedded/advanced-topics/custom-js/examples/) collected with comments to clarify what the code is doing.  


Each config variable has a "slot" that can have custom JS code associated with it.  The file contains all of the different code in one, which slot and which screen it is associated with is indicated in comments.  Also included is JavaScript that is used in a workflow script connector. 

All configurable variables (also called slots) for a solution are added to the config wizard, and given an External ID to identify it in the script.
This includes authentictions required for connectors, usually in the first few screens, which can be used for Call Connector actions in later steps.  
For this example, here's a list of the screens and variables and their slot names:
* Screen 1 - no slots (used for instructions for user in this example)
* Screen 2 - Acme authentication = external_came_authenticaion ; Salesforce authentication = external_salesforce_authentication
* Screen 3 - Salesforce entitiy = external_salesforce_entity 
* Screen 4 - Acme entity = external_destination_object
* Screen 5 - acme-fields = external_acme-fields; simple-data-mapping = external_simple-data-mapping
* Screen 6 - Use default mapping? = external_use_default_mapping ; Field mappings = external_data_mapping
 (This section illustrates an alternate way to get the data mapping, including a toggle between a default set and customized mapping.)

## Illustrated Techniques
### Using the script connector to add configuration variables
The [script connector](https://tray.io/documentation/connectors/core/script/) enables JavaScript to be included as part of a workflow.  The input variables here can be turned into config variables, allowing the creation of complex objects or arrays in the Config Wizard as needed for your use case.  

### Using the Call Connector API to retrieve data from an external API and formatting it for a drop down list
On screen 4 in the example, the [Call Connector API](https://tray.io/documentation/embedded/advanced-topics/call-connector/) is used to make an HTTP request with the [HTTP Client connector](https://tray.io/documentation/connectors/core/http-client/) to an external service that does not have a Tray connector available.  The required fields for the input parameter are the most variable and will depend on the requirements of the API you are calling.  

### Using the Call Connector API to retrieve data from a Tray connector and creating a data mapper
On screen 6 in the example the Call Connector API is used twice to get data, once with the HTTP-Client connector and once with the Salesforce connector.  The data retrieval is pulled into a function that can be called by the event handlers.  This code also illustrates the use of the CONFIG_SLOT_VALUE_CHANGED triggereing a status change, and the CONFIG_SLOT_STATUS_CHANGED event as a trigger for retrieving data.  

* [Sample Code](../documentation_example/sampleScriptsAnnotated.js)
* [Sample Code - parameterized](../documentation_example/sampleScriptsAnnotated_parameterized.js)
