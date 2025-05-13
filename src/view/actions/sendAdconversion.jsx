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
import React from "react";
import { object } from "yup";

import instancePicker from "../forms/instancePicker";
import checkbox from "../forms/checkbox";
import form from "../forms/form";
import renderForm from "../forms/renderForm";
import configOverrides from "../forms/configOverrides";
import { FIELD_NAMES } from "../components/overrides/utils";

const wrapGetInitialValues =
  (getInitialValues) =>
  ({ initInfo }) => {
    const {
      enableTracking = false,
      instanceName = initInfo.extensionSettings.instances[0].name,
      edgeConfigOverrides,
    } = initInfo.settings || {};

    return getInitialValues({
      initInfo: {
        ...initInfo,
        settings: {
          enableTracking,
          instanceName,
          edgeConfigOverrides,
        },
      },
    });
  };

const wrapGetSettings =
  (getSettings) =>
  ({ values }) => {
    const {
      instanceName,
      enableTracking,
      edgeConfigOverrides,
    } = getSettings({ values });

    return {
      instanceName,
      enableTracking,
      edgeConfigOverrides,
    };
  };

const hideFields = [
  FIELD_NAMES.sandbox,
  FIELD_NAMES.idSyncContainerOverride,
  FIELD_NAMES.targetPropertyTokenOverride,
];
const configOverrideFields = configOverrides(hideFields);

const enableTrackingField = checkbox({
  name: "enableTracking",
  label: "Enable Adconversion Tracking",
  description: "Enable tracking of Adconversions through the Adobe Experience Platform Web SDK.",
  defaultValue: false,
});

const sendAdconversionForm = form(
  {
    wrapGetInitialValues,
    wrapGetSettings,
    formHeading: "Send Adconversion",
    getValidationShape: () => ({}),
  },
  [
    instancePicker({ name: "instanceName" }),
    enableTrackingField,
    configOverrideFields,
  ]
);

renderForm(sendAdconversionForm); 