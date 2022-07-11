# Tray Embedded Config Wizard Custom JavaScript Examples
The [Embedded Configuration Wizard](https://tray.io/documentation/embedded/building-integrations/the-config-wizard/) is used to collect authentications and user/client specific configuration options as needed by your solution.  As currently implemented, any variable in a workflow that is part of a project/solution can be set to be a ["config variable"](https://tray.io/documentation/embedded/core-topics/config-data/setting-config-data/).  This adds the variable to the Solution tab, and is added to the Config Wizard.  Default UI elements are used with the configuration varable/slot based on data type or API option (e.g. a text box for a string, a drop down list for a single choice like a Slack channel, data mapping, etc).  The default behavior does not satisfy all use cases, thus Custom JS is a method to further customize the configuration wizard to meet your specific use cases. 

  The Configuration Wizard for Tray Embedded allows for custom JS code to be added
  to enable advanced functionality (A.K.A. "Advanced Configuration Wizard" - inclusion of this feature is determined by which product you purchase - *if you do not have access to Custom JS and require it, contact your Account Manager*).  
  
  Example use cases include:
  * [Dynamic Drop Down Lists from APIs that do not have a Tray Connector available.](./dynamic_drop_down_list/readme.md)
  * [Advanced data mapping template](./adv_data_mapping/readme.md)
  * [Custom validation of authentications](./authentication_checking/readme.md)

Also included is a compliation of the code used in the example from documentation.
  * [Documentation Example Code](./documentation_example/readme.md) 
   
## References
  The Tray documentation contains very useful information about how custom JS works in the 
  Config Wizard that we recommend be reviewed before using the code samples here. 
  (Please note the navigation on the left to get to additional pages on each topic.)
  * [Tray Embedded Overview](https://tray.io/documentation/embedded/getting-started/overview/)
  * [Setting Config Data](https://tray.io/documentation/embedded/core-topics/config-data/setting-config-data/)
  * [Intro to Custom JS](https://tray.io/documentation/embedded/advanced-topics/custom-js/custom-js-intro/)
  * [The Call Connector API](https://tray.io/documentation/embedded/advanced-topics/call-connector)
  * [Config Wizard Data Validation](https://tray.io/documentation/embedded/core-topics/config-wizard-data-validation/)
  * [Data Mapping](https://tray.io/documentation/embedded/advanced-topics/data-mapping/intro/)
 