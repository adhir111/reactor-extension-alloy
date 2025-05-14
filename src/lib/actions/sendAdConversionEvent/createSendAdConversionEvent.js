/*
Copyright 2023 Adobe. All rights reserved.
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
    console.log("sendAdConversionEventSettings", settings);
    const { instanceName, ...sendAdConversionEventSettings } = settings;
    sendAdConversionEventSettings.edgeConfigOverrides = getConfigOverrides(
      sendAdConversionEventSettings,
    );

    const instance = instanceManager.getInstance(instanceName);

    if (!instance) {
      throw new Error(
        `Failed to send ad conversion event for instance "${instanceName}". No matching instance was configured with this name.`,
      );
    }

    // Clone objects to ensure they don't change before being sent
    if (sendAdConversionEventSettings.xdm) {
      sendAdConversionEventSettings.xdm = clone(
        sendAdConversionEventSettings.xdm,
      );
    }
    if (sendAdConversionEventSettings.data) {
      sendAdConversionEventSettings.data = clone(
        sendAdConversionEventSettings.data,
      );
    }

    return instance(
      "sendAdConversionEvent",
      sendAdConversionEventSettings,
    ).then((result) => {
      sendEventCallbackStorage.triggerEvent(result);
    });
  };
