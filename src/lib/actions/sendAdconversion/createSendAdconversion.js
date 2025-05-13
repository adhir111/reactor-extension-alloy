/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const clone = require("../../utils/clone");

module.exports =
  ({ instanceManager, sendEventCallbackStorage, getConfigOverrides }) =>
  (settings) => {
    const { 
      instanceName, 
      enableAdvertisingSearch,
      enableAdvertisingDisplay,
      enableAdvertisingCreative,
      transactionId,
      ...otherSettings 
    } = settings;
    const configOverrides = getConfigOverrides(otherSettings);
    
    const instance = instanceManager.getInstance(instanceName);

    if (!instance) {
      throw new Error(
        `Failed to send adconversion for instance "${instanceName}". No matching instance was configured with this name.`,
      );
    }

    // Only proceed if at least one of the advertising types is enabled
    if (!enableAdvertisingSearch && !enableAdvertisingDisplay && !enableAdvertisingCreative) {
      return Promise.resolve();
    }

    // Create the base XDM data for adconversion
    const xdm = {
      eventType: "advertising.conversion",
      timestamp: new Date().toISOString(),
      advertising: {
        conversion: {
          conversionComplete: true,
        }
      }
    };

    // Add specific advertising types that are enabled
    if (enableAdvertisingSearch) {
      xdm.advertising.conversion.search = {
        enabled: true
      };
    }

    if (enableAdvertisingDisplay) {
      xdm.advertising.conversion.display = {
        enabled: true
      };
    }

    if (enableAdvertisingCreative) {
      xdm.advertising.conversion.creative = {
        enabled: true
      };
      
      // Add transaction ID if provided
      if (transactionId) {
        xdm.advertising.conversion.transactionID = transactionId;
      }
    }

    const sendEventSettings = {
      xdm,
      edgeConfigOverrides: configOverrides
    };

    // Send the event
    return instance("sendEvent", sendEventSettings).then((result) => {
      sendEventCallbackStorage.triggerEvent(result);
    });
  }; 