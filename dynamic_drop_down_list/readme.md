# Dynamic Drop Down Lists
This code will allow you to use an authentication collected from the user prior to this screen 
to call the API of that service for fields that you wish to populate in the Config Wizard UI 
in either drop down lists for single selection, or data mapping to other fields.  

*Note that this is not necessary if the service you are using has a connector available in the Tray Builder - (e.g. selecting a Slack channel/recipient, selecting a Salesforce record type, etc.) - that has a drop down field selection built into the connector as you can make that choice a config variable which will then show up on a screen in the solution editor screen.* 
 
The logical flow is as follows:

The config slot is mounted, triggering the CONFIG_SLOT_MOUNT event to fire, which can then 
be used to make a Call Connector function call using the authentication collected prior to this screen to 
get the specific data required from the api that the user has access to.  This result is then 
formatted for display as a drop down list in the form of an enum.

The sample code has been parameterized (BASEURL, ENDPOINT, AUTHID) for using the HTTP-CLient with the Call Connector API.  

* [Sample Code](../dynamic_drop_down_list/dynamicDDLCallConnector.js)
* [Video Demo](https://www.loom.com/share/5277bf24cc2e4375b419d97a8afd8c4a)
