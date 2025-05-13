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
import React, { useEffect, useState } from "react";
import { object } from "yup";

import instancePicker from "../forms/instancePicker";
import checkbox from "../forms/checkbox";
import textField from "../forms/textField";
import fieldArray from "../forms/fieldArray";
import objectArray from "../forms/objectArray";
import form from "../forms/form";
import renderForm from "../forms/renderForm";
import configOverrides from "../forms/configOverrides";
import section from "../forms/section";
import conditional from "../forms/conditional";
import comboBox from "../forms/comboBox";
import { FIELD_NAMES } from "../components/overrides/utils";

// Sample advertisers data from API response
const MOCK_ADVERTISERS_DATA = [
  { id: "167534", name: "test" },
  { id: "167524", name: "Advertiser BF" },
  { id: "168872", name: "CTV_DV" },
  { id: "168724", name: "gdfg" },
  { id: "168726", name: "gdfgf" },
  { id: "167536", name: "test" },
  { id: "168732", name: "test20240925" },
  { id: "153472", name: "Uday Test Advisor" },
  { id: "168725", name: "united" },
  { id: "167535", name: "{{7*7}}" }
];

// Mock API function that simulates async fetch of advertisers
// TODO: Replace this with actual API call to get advertisers
const fetchAdvertisers = () => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve(MOCK_ADVERTISERS_DATA);
    }, 3500);
  });
};

/* 
TODO: Implement real API call to get advertisers list
Replace the mock function with something like:

const fetchAdvertisers = async () => {
  try {
    // Replace with actual API endpoint and authorization
    const response = await fetch('https://api.tubemogul.com/v1/provisioning/accounts/{accountId}/advertisers?sort_by=name&sort_order=asc', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch advertisers');
    }
    
    const data = await response.json();
    
    // Transform API response to the format needed for the dropdown
    return data.items.map(advertiser => ({
      id: advertiser.advertiser_id,
      name: advertiser.advertiser_name
    }));
  } catch (error) {
    console.error('Error fetching advertisers:', error);
    return []; // Return empty array on error
  }
};
*/

const wrapGetInitialValues =
  (getInitialValues) =>
  ({ initInfo }) => {
    const {
      advertiserId = "",
      enableAdvertisingSearch = false,
      enableAdvertisingDisplay = false,
      enableAdvertisingCreative = false,
      transactionId = "",
      customGoals = [""],
      conversions = [{ conversionName: "", revenue: "" }],
      instanceName = initInfo.extensionSettings.instances[0].name,
      edgeConfigOverrides,
    } = initInfo.settings || {};

    return getInitialValues({
      initInfo: {
        ...initInfo,
        settings: {
          advertiserId,
          enableAdvertisingSearch,
          enableAdvertisingDisplay,
          enableAdvertisingCreative,
          transactionId,
          customGoals,
          conversions,
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
      advertiserId,
      enableAdvertisingSearch,
      enableAdvertisingDisplay,
      enableAdvertisingCreative,
      transactionId,
      customGoals,
      conversions,
      edgeConfigOverrides,
    } = getSettings({ values });

    return {
      instanceName,
      advertiserId,
      enableAdvertisingSearch,
      enableAdvertisingDisplay,
      enableAdvertisingCreative,
      transactionId,
      customGoals,
      conversions,
      edgeConfigOverrides,
    };
  };

const hideFields = [
  FIELD_NAMES.sandbox,
  FIELD_NAMES.idSyncContainerOverride,
  FIELD_NAMES.targetPropertyTokenOverride,
];
const configOverrideFields = configOverrides(hideFields);

// Create advertiser field with async loading of options
const advertiserField = {
  getInitialValues({ initInfo }) {
    const { advertiserId = "" } = initInfo.settings || {};
    return { advertiserId };
  },
  getSettings({ values }) {
    return {
      advertiserId: values.advertiserId
    };
  },
  validationShape: {
    advertiserId: object(),
  },
  Component: ({ namePrefix = "" }) => {
    const [advertisers, setAdvertisers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      let mounted = true;
      
      const loadAdvertisers = async () => {
        try {
          const data = await fetchAdvertisers();
          if (mounted) {
            setAdvertisers(data);
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error loading advertisers:", error);
          if (mounted) {
            setIsLoading(false);
          }
        }
      };
      
      loadAdvertisers();
      
      return () => {
        mounted = false;
      };
    }, []);

    // Create placeholder item for loading state
    const items = isLoading 
      ? [{ value: "", label: "Loading advertisers..." }] 
      : advertisers.map(advertiser => ({
          value: advertiser.id,
          label: advertiser.name
        }));

    // Create comboBox with loaded data
    const advertiserComboBox = comboBox({
      name: "advertiserId",
      label: "Advertiser",
      description: "Select the advertiser for this conversion",
      items: items,
      allowsCustomValue: false
    });

    // Render the combo box component
    return <advertiserComboBox.Component namePrefix={namePrefix} isDisabled={isLoading} />;
  }
};

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

const transactionIdField = textField({
  name: "transactionId",
  label: "Transaction ID",
  description: "Enter the transaction ID for this conversion",
});

const customGoalsField = fieldArray({
  name: "customGoals",
  label: "Custom Goals",
  singularLabel: "Custom Goal",
  description: "Enter a custom goal to track with this conversion",
  dataElementDescription: "Provide a data element that returns an array of strings representing custom goals"
});

const conversionsField = objectArray(
  {
    name: "conversions",
    label: "Conversion Tracking",
    singularLabel: "Conversion",
    dataElementDescription: "Provide a data element that returns an array of conversion objects with conversionName and revenue properties",
    dataElementSupported: true,
    horizontal: true,
    isRowEmpty: ({ conversionName, revenue }) => conversionName === "" && revenue === "",
  },
  [
    textField({
      name: "conversionName",
      label: "Conversion Name",
      width: "size-3000",
      description: "Enter the name of the conversion"
    }),
    textField({
      name: "revenue",
      label: "Revenue",
      width: "size-3000",
      description: "Enter the revenue amount for this conversion"
    })
  ]
);

const sendAdconversionForm = form(
  {
    wrapGetInitialValues,
    wrapGetSettings,
    formHeading: "Send Adconversion",
    getValidationShape: () => ({}),
  },
  [
    instancePicker({ name: "instanceName" }),
    advertiserField,
    section(
      { label: "Advertising Conversion Types" },
      [
        enableAdvertisingSearchField,
        enableAdvertisingDisplayField,
        enableAdvertisingCreativeField,
      ]
    ),
    conditional(
      {
        args: "enableAdvertisingCreative",
        condition: (enableAdvertisingCreative) => enableAdvertisingCreative,
      },
      [
        section(
          { label: "Conversion Properties" },
          [
            transactionIdField,
            customGoalsField,
            conversionsField
          ]
        )
      ]
    ),
    configOverrideFields,
  ]
);

renderForm(sendAdconversionForm); 