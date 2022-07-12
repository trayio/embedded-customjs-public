# Advanced Data Mapping
The [Data Mapping functionality built into the Config Wizard](https://tray.io/documentation/embedded/advanced-topics/data-mapping/intro/) is very robust and will serve most use cases.  The documentation here is useful to review in any case.  There are use cases for which this functionality is not sufficient, and the code included here illustrates Advanced Data Mapping implementations.  

This code will allow you to populate two separate dropdown lists for a simple data mapper object
in the Config Wizard. For this example, one list will be populated by using a simple hardcoded
list of options, and the second list will be populated by using the [Call Connector API](https://tray.io/documentation/embedded/advanced-topics/call-connector/) to pull data from connectors.

*Note that this is not necessary if you are able to use the Data Mapper function in the Tray
Config Wizard. You may be able to use the Hardcoded Value option or the Operation Output to 
select a connector and the desired operation output to populate the lists.*

The logical flow is as follows:

The config slot is mounted, triggering the CONFIG_SLOT_MOUNT event to fire, which can then 
be used to make the Data Mapper. The generateSchema function is used to call two different helper
functions to individually populate the two lists being created for the data mapper. The first
helper function will return a list of hardcoded text and value options to create a list. The
second helper function will use the call connector call using the authentication collected prior 
to this screen to get the specific data required from the API that the user has access to.  This 
result is then formatted for display as a drop down list in the form of an enum.



This sample code has been parametarized for the BASEURL, and ENDPOINT which will need to be specified.  The generateSchema function also includes a few titles values for each list of fields that can be modified as desired.  

The getFirstList function returns a hard-coded list, but could easily be modified similarly to the getSecondList function to retrieve a dynamic list. 



* [Sample Code](../adv_data_mapping/adv_data_mapping_template.js)
* [Loom Video Example](https://www.loom.com/share/1c6d2fc9406f4848af2fd1218ddf91fa)

