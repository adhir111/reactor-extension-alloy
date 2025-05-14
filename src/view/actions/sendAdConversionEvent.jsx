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

import checkbox from "../forms/checkbox";
import instancePicker from "../forms/instancePicker";
import form from "../forms/form";
import section from "../forms/section";

import renderForm from "../forms/renderForm";

const getInitialValues = ({ initInfo }) => {
  const {
    instanceName = initInfo.extensionSettings.instances[0].name,
    enableViewThruConversion = false,
    enableClickThruConversion = false,
  } = initInfo.settings || {};

  return {
    instanceName,
    enableViewThruConversion,
    enableClickThruConversion,
  };
};

const getSettings = ({ values }) => {
  const { instanceName, enableViewThruConversion, enableClickThruConversion } =
    values;

  const settings = {
    instanceName,
    enableViewThruConversion,
    enableClickThruConversion,
    // Hard-coded value for simplicity
    conversionType: "purchase",
  };

  return settings;
};

const sendAdConversionForm = form(
  {
    getInitialValues,
    getSettings,
  },
  [
    instancePicker({ name: "instanceName" }),
    section({ label: "Conversion Settings" }, [
      checkbox({
        name: "enableViewThruConversion",
        label: "Enable View-Through Conversion",
        description: "Track conversions from ad impressions (views).",
        defaultValue: false,
      }),
      checkbox({
        name: "enableClickThruConversion",
        label: "Enable Click-Through Conversion",
        description: "Track conversions from ad clicks.",
        defaultValue: false,
      }),
    ]),
  ],
);

renderForm(sendAdConversionForm);
