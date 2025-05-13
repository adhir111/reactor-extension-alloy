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
import section from "../forms/section";
import { FIELD_NAMES } from "../components/overrides/utils";

const wrapGetInitialValues =
  (getInitialValues) =>
  ({ initInfo }) => {
    const {
      enableAdvertisingSearch = false,
      enableAdvertisingDisplay = false,
      enableAdvertisingCreative = false,
      instanceName = initInfo.extensionSettings.instances[0].name,
      edgeConfigOverrides,
    } = initInfo.settings || {};

    return getInitialValues({
      initInfo: {
        ...initInfo,
        settings: {
          enableAdvertisingSearch,
          enableAdvertisingDisplay,
          enableAdvertisingCreative,
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
      enableAdvertisingSearch,
      enableAdvertisingDisplay,
      enableAdvertisingCreative,
      edgeConfigOverrides,
    } = getSettings({ values });

    return {
      instanceName,
      enableAdvertisingSearch,
      enableAdvertisingDisplay,
      enableAdvertisingCreative,
      edgeConfigOverrides,
    };
  };

const hideFields = [
  FIELD_NAMES.sandbox,
  FIELD_NAMES.idSyncContainerOverride,
  FIELD_NAMES.targetPropertyTokenOverride,
];
const configOverrideFields = configOverrides(hideFields);

const enableAdvertisingSearchField = checkbox({
  name: "enableAdvertisingSearch",
  label: "Enable Advertising Search",
  description: "Enabling Search will enable auto tracking of Click through event",
  defaultValue: false,
});

const enableAdvertisingDisplayField = checkbox({
  name: "enableAdvertisingDisplay",
  label: "Enable Advertising Display",
  description: "Enabling Display will enable auto tracking of Click through and View through events",
  defaultValue: false,
});

const enableAdvertisingCreativeField = checkbox({
  name: "enableAdvertisingCreative",
  label: "Enable Advertising Creative-2.0",
  description: "Enabling Creative-2.0 will enable auto tracking of conversion event",
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
    section(
      { label: "Advertising Conversion Types" },
      [
        enableAdvertisingSearchField,
        enableAdvertisingDisplayField,
        enableAdvertisingCreativeField,
      ]
    ),
    configOverrideFields,
  ]
);

renderForm(sendAdconversionForm); 