const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parsePnPUtilDevices,
  parseMacKeyboardInventory,
  collapseDeviceEntries,
  filterPhysicalKeyboards,
  pickBestKeyboardName,
  isStrongPhysicalKeyboardCandidate,
  scoreDetectionConfidence,
  buildDetectionComparison
} = require("../src/modules/device-detector");

const keyboardInventory = `
Microsoft PnP Utility

Instance ID:                HID\\VID_1234&PID_ABCD&MI_00\\7&11111111&0&0000
Device Description:         HID Keyboard Device
Class Name:                 Keyboard
Manufacturer Name:          (Standard keyboards)
Status:                     Started

Instance ID:                ACPI\\FUJ7401\\4&11493e97&0
Device Description:         Standard PS/2 Keyboard
Class Name:                 Keyboard
Manufacturer Name:          (Standard keyboards)
Status:                     Started

Instance ID:                HID\\VID_046D&PID_C092&MI_01&Col01\\8&906adf7&0&0000
Device Description:         HID Keyboard Device
Class Name:                 Keyboard
Manufacturer Name:          (Standard keyboards)
Status:                     Started
`;

const connectedInventory = `
Microsoft PnP Utility

Instance ID:                USB\\VID_1234&PID_ABCD\\7&10a31c3f&0&1
Device Description:         HP USB Multimedia Keyboard
Class Name:                 USB
Manufacturer Name:          HP
Status:                     Started

Instance ID:                USB\\VID_046D&PID_C092\\206C32854D47
Device Description:         G203 LIGHTSYNC
Class Name:                 USB
Manufacturer Name:          Logitech
Status:                     Started

Instance ID:                ACPI\\FUJ7401\\4&11493e97&0
Device Description:         Standard PS/2 Keyboard
Class Name:                 Keyboard
Manufacturer Name:          (Standard keyboards)
Status:                     Started
`;

const macUsbInventory = {
  SPUSBDataType: [
    {
      _items: [
        {
          _name: "HP USB Keyboard",
          vendor_id: "0x03f0",
          product_id: "0x034a",
          manufacturer: "HP"
        },
        {
          _name: "USB Optical Mouse",
          vendor_id: "0x046d",
          product_id: "0xc05a",
          manufacturer: "Logitech"
        }
      ]
    }
  ]
};

const macBluetoothInventory = {
  SPBluetoothDataType: [
    {
      device_title: "Magic Keyboard",
      device_minorType: "Keyboard",
      device_address: "AA-BB-CC-DD-EE-FF"
    }
  ]
};

test("device detector parses Windows inventory and filters non-keyboard side devices", () => {
  const keyboardDevices = collapseDeviceEntries(parsePnPUtilDevices(keyboardInventory));
  const relatedDevices = parsePnPUtilDevices(connectedInventory);
  const filtered = filterPhysicalKeyboards(keyboardDevices, relatedDevices);

  assert.equal(filtered.length, 2);
  assert.ok(filtered.some((device) => device.InstanceId.startsWith("ACPI\\FUJ7401")));
  assert.ok(filtered.some((device) => device.InstanceId.includes("VID_1234&PID_ABCD")));
  assert.ok(!filtered.some((device) => device.InstanceId.includes("VID_046D&PID_C092")));
});

test("device detector prefers branded related names over generic keyboard labels", () => {
  const [externalKeyboard] = collapseDeviceEntries(parsePnPUtilDevices(keyboardInventory)).filter((device) =>
    device.InstanceId.includes("VID_1234&PID_ABCD")
  );
  const relatedDevices = parsePnPUtilDevices(connectedInventory);
  const name = pickBestKeyboardName(externalKeyboard, relatedDevices);

  assert.equal(name, "HP USB Multimedia Keyboard");
});

test("device detector rejects duplicate-looking generic HID side interfaces when no keyboard signal exists", () => {
  const genericSideInterface = {
    InstanceId: "HID\\VID_048D&PID_C994&MI_02\\7&11111111&0&0000",
    DeviceDescription: "USB Input Device",
    FriendlyName: "USB Input Device",
    Name: "USB Input Device",
    DeviceDesc: "USB Input Device",
    BusReportedDeviceDesc: "USB Input Device",
    Class: "Keyboard",
    Manufacturer: "(Standard keyboards)"
  };

  const relatedDevices = [
    {
      InstanceId: "USB\\VID_048D&PID_C994\\7&10a31c3f&0&1",
      DeviceDescription: "USB Composite Device",
      FriendlyName: "USB Composite Device",
      Name: "USB Composite Device",
      DeviceDesc: "USB Composite Device",
      BusReportedDeviceDesc: "USB Composite Device",
      Class: "USB",
      Manufacturer: "Unknown"
    }
  ];

  assert.equal(isStrongPhysicalKeyboardCandidate(genericSideInterface, relatedDevices, "usb input device"), false);
});

test("device detector assigns higher confidence to branded keyboard metadata and compares scans", () => {
  const keyboardDevices = collapseDeviceEntries(parsePnPUtilDevices(keyboardInventory));
  const relatedDevices = parsePnPUtilDevices(connectedInventory);
  const externalKeyboard = keyboardDevices.find((device) => device.InstanceId.includes("VID_1234&PID_ABCD"));

  assert.equal(scoreDetectionConfidence(externalKeyboard, relatedDevices), "High confidence");

  const comparison = buildDetectionComparison(
    [{ fingerprint: "a", name: "Old Keyboard" }],
    [{ fingerprint: "b", name: "New Keyboard" }]
  );

  assert.deepEqual(comparison.added, ["New Keyboard"]);
  assert.deepEqual(comparison.removed, ["Old Keyboard"]);
});

test("device detector parses macOS USB, Bluetooth, and built-in keyboard inventory", () => {
  const devices = parseMacKeyboardInventory({
    usbInventory: macUsbInventory,
    bluetoothInventory: macBluetoothInventory,
    builtInInventory: "| |   \"IOClass\" = \"AppleEmbeddedKeyboard\""
  });

  assert.equal(devices.some((device) => device.name === "HP USB Keyboard"), true);
  assert.equal(devices.some((device) => device.name === "Magic Keyboard"), true);
  assert.equal(devices.some((device) => device.name === "Built-in Keyboard"), true);
  assert.equal(devices.some((device) => /mouse/i.test(device.name)), false);
});
