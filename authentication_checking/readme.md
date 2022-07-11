# Authentication Checking

One of the primary objectives of the Config Wizard is to collect end user authentications to allow Tray to access their data.  For OAuth2 authentications, it is immediately clear if the authentication succeeded or not.  For token based APIs, however, it is not immediately clear if the provided credentials are correct.  In this instance, you may wish to validate that the credentials are good before proceeding with the Config Wizard steps.  

This sample code illustrates how you can collect token-based API credentials, and then use the Call Connector API to either make a call to a Tray connector for the service, if it exists, or to call the service using the universal HTTP-Client connector.  The call should ideally be related to the required permissions for your solution (e.g. creating and deleting a record, listing entries in a specific table, etc.) so that your user can avoid errors after the completion of the Config Wizard and address the issue promptly.  

This code also illustrates another method of passing configuration values to the script by using an object "customJSVariables" to hold the values needed for this script to work for your use case. You will need to modify this accordingly in both examples. 

There are two examples provided, one using the HTTP-Client connector and one using an existing Tray connector.  See the documentation for the [Call Connector API](https://tray.io/documentation/embedded/advanced-topics/call-connector/) and the [HTTP-Client connector](https://tray.io/documentation/connectors/core/http-client/) for further information about their utilization. 

* [Sample Code - HTTP Client](../authentication_checking/auth_testing_http-client.js)
* [Sample Code - Tray Connector](../authentication_checking/auth_testing_tray_connector.js)
* [Video Demo](https://www.loom.com/share/aec2bdb688e94554b7e6e4b1b7bdfe53)
