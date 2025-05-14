// test/unit/lib/actions/sendAdConversionEvent/createSendAdConversionEvent.spec.js
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

import { describe, it, expect, beforeEach, vi } from "vitest";
import createSendAdConversionEvent from "../../../../../src/lib/actions/sendAdConversionEvent/createSendAdConversionEvent";

describe("Send Ad Conversion Event", () => {
  let getConfigOverrides;

  beforeEach(() => {
    getConfigOverrides = vi.fn();
  });

  it("executes sendAdConversionEvent command and notifies sendEventCallbackStorage", () => {
    const instance = vi.fn().mockResolvedValue({ foo: "bar" });
    const instanceManager = {
      getInstance: vi.fn().mockReturnValue(instance),
    };
    const sendEventCallbackStorage = {
      triggerEvent: vi.fn(),
    };

    const action = createSendAdConversionEvent({
      instanceManager,
      sendEventCallbackStorage,
      getConfigOverrides,
    });

    const adConversionData = {
      adPlatform: "Google Ads",
      conversionValue: 100.5,
    };

    const promiseReturnedFromAction = action({
      instanceName: "myinstance",
      conversionType: "purchase",
      conversionId: "conv123",
      xdm: adConversionData,
    });

    expect(instanceManager.getInstance).toHaveBeenCalledWith("myinstance");
    expect(instance).toHaveBeenCalledWith("sendAdConversionEvent", {
      conversionType: "purchase",
      conversionId: "conv123",
      edgeConfigOverrides: undefined,
      xdm: {
        adPlatform: "Google Ads",
        conversionValue: 100.5,
      },
    });

    // Ensure the XDM object was cloned
    const xdmOption = instance.mock.calls[0][1].xdm;
    expect(xdmOption).not.toBe(adConversionData);
    expect(xdmOption).toEqual(adConversionData);

    return promiseReturnedFromAction;
  });

  it("throws an error when no matching instance found", () => {
    const instanceManager = {
      getInstance: vi.fn(),
    };
    const action = createSendAdConversionEvent({
      instanceManager,
      getConfigOverrides,
    });

    expect(() => {
      action({
        instanceName: "myinstance",
        conversionType: "purchase",
        xdm: {
          adPlatform: "Facebook",
        },
      });
    }).toThrow(
      'Failed to send ad conversion event for instance "myinstance". No matching instance was configured with this name.',
    );
  });
});
