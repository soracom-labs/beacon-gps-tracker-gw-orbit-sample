import {
  getInputBuffer,
  setOutputJSON,
  orbit_get_userdata,
  orbit_get_userdata_len,
  getUserdata,
} from "orbit-sdk-assemblyscript";
import { JSONDecoder, JSONHandler } from "./lib/decoder";
import { JSONEncoder } from "./lib/encoder";

export function uplink(): i32 {
  const data = new Data();
  const decoder = new JSONDecoder<Data>(data);
  decoder.deserialize(getInputBuffer());

  const encoder = new JSONEncoder();

  // Common parameter
  encoder.setInteger("type", data.type);

  if (data.bat < 1 || data.bat > 3) {
    // The device is being charged
    data.bat = -1;
  }
  encoder.setInteger("bat", data.bat);

  encoder.setString("timestamp", data.timestamp);

  if (data.imei != "") {
    encoder.setString("imei", data.imei);
  }

  // send different parameter by type
  if (data.type == 1) {
    setLocationInfo(data, encoder);
  } else if (data.type == 2) {
    // Set monitoring info but nothing to add
  } else if (data.type == 3) {
    setBeaconInfo(data, encoder);
  } else if (data.type == 4) {
    setBleSensorInfo(data, encoder);
  }

  setOutputJSON(encoder.toString());
  return 0;
}

function setLocationInfo(data: Data, encoder: JSONEncoder): void {
  encoder.setString("loc_data", data.loc_data);

  // When Located in West longtitude or South latitude, use negative
  let lat: f64;
  let lon: f64;

  if (data.ns == "S") {
    lat = -data.lat;
  } else {
    lat = data.lat;
  }
  encoder.setFloat("lat", lat);

  if (data.ew == "W") {
    lon = -data.lon;
  } else {
    lon = data.lon;
  }
  encoder.setFloat("lon", lon);

  encoder.setInteger("major_axis", data.major_axis);
  encoder.setInteger("minor_axis", data.minor_axis);
}

function setBeaconInfo(data: Data, encoder: JSONEncoder): void {
  encoder.setString("uuid", data.uuid);
  encoder.setString("major", data.major);
  encoder.setString("minor", data.minor);

  encoder.setString("rssi_b", data.rssi_b);

  // as rssi_b is ASCII of HEX, converted to decimal
  const rssi_dec: f64 = parseInt(data.rssi_b, 16);
  encoder.setFloat("rssi", rssi_dec);

  encoder.setInteger("attr", data.attr);
}

function setBleSensorInfo(data: Data, encoder: JSONEncoder): void {
  // adv_add is changed from 1234567890AB to AB9078563412 in device. Fix the order here
  const adv_add_arr: string[] = [];
  for (let i = 0; i < data.adv_add.length; i += 2) {
    adv_add_arr.unshift(data.adv_add.slice(i, i + 2));
  }
  const adv_add_reversed: string = adv_add_arr.join("");
  encoder.setString("adv_add", adv_add_reversed);

  encoder.setInteger("sns_valid_no", data.sns_valid_no);

  // choose which sensor data to send by sns_valid_no
  const sns_valid_no_bin = data.sns_valid_no.toString(2);
  const sns_valid_no_arr: number[] = sns_valid_no_bin
    .split("")
    .map<number>((t) => parseInt(t))
    .reverse();
  let sns_key_arr: string[] = [
    // eslint-disable-next-line prettier/prettier
    "sns1", "sns2", "sns3", "sns4", "sns5", "sns6", "sns7", "sns8", "sns9", "sns10",
    // eslint-disable-next-line prettier/prettier
    "sns11", "sns12", "sns13", "sns14", "sns15", "sns16", "sns17", "sns18", "sns19", "sns20",
    // eslint-disable-next-line prettier/prettier
    "sns21", "sns22", "sns23", "sns24"
  ];
  const sns_val_arr: number[] = [
    // eslint-disable-next-line prettier/prettier
    data.sns1, data.sns2, data.sns3, data.sns4, data.sns5,
    // eslint-disable-next-line prettier/prettier
    data.sns6, data.sns7, data.sns8, data.sns9, data.sns10,
    // eslint-disable-next-line prettier/prettier
    data.sns11, data.sns12, data.sns13, data.sns14, data.sns15,
    // eslint-disable-next-line prettier/prettier
    data.sns16, data.sns17, data.sns18, data.sns19, data.sns20,
    // eslint-disable-next-line prettier/prettier
    data.sns21, data.sns22, data.sns23, data.sns24
  ];

  // modify Sensor data keys by User data
  if (getUserdata() != "") {
    sns_key_arr = updateSnsKeyArr(sns_key_arr);
  } else {
    // No modifying because no userdata or metadata is not enabled.
    // If you want to get userdata but cannot, please check your SIM group configuration.
  }

  for (let i = 0; i < sns_valid_no_arr.length; i++) {
    if (sns_valid_no_arr[i]) {
      encoder.setFloat(sns_key_arr[i], sns_val_arr[i]);
    }
  }
}

function updateSnsKeyArr(arr: string[]): string[] {
  const user_defined_sns_key_arr: string[] = arr;
  const user_data = new UserData();
  const user_data_decoder = new JSONDecoder<UserData>(user_data);
  const user_data_buffer: Uint8Array = getUserdataAsBuffer();
  user_data_decoder.deserialize(user_data_buffer);
  const user_data_arr: string[] = [
    // eslint-disable-next-line prettier/prettier
    user_data.sns1, user_data.sns2, user_data.sns3, user_data.sns4, user_data.sns5,
    // eslint-disable-next-line prettier/prettier
    user_data.sns6, user_data.sns7, user_data.sns8, user_data.sns9, user_data.sns10,
    // eslint-disable-next-line prettier/prettier
    user_data.sns11, user_data.sns12, user_data.sns13, user_data.sns14, user_data.sns15,
    // eslint-disable-next-line prettier/prettier
    user_data.sns16, user_data.sns17, user_data.sns18, user_data.sns19, user_data.sns20,
    // eslint-disable-next-line prettier/prettier
    user_data.sns21, user_data.sns22, user_data.sns23, user_data.sns24
  ];
  for (let i = 0; i < user_data_arr.length; i++) {
    if (user_data_arr[i] != "") {
      user_defined_sns_key_arr[i] = user_data_arr[i];
    }
  }
  return user_defined_sns_key_arr;
}

class Data extends JSONHandler {
  // name and type of keys which defined by Binary parsor format
  public type: i64;
  public bat: i64;
  public major_axis: i64;
  public minor_axis: i64;
  public attr: i64;
  public sns_valid_no: i64;
  public loc_data: string = "";
  public ns: string = "";
  public ew: string = "";
  public uuid: string = "";
  public major: string = "";
  public minor: string = "";
  public rssi_b: string = "";
  public timestamp: string = "";
  public imei: string = "";
  public adv_add: string = "";
  public lat: f64;
  public lon: f64;
  public sns1: f64;
  public sns2: f64;
  public sns3: f64;
  public sns4: f64;
  public sns5: f64;
  public sns6: f64;
  public sns7: f64;
  public sns8: f64;
  public sns9: f64;
  public sns10: f64;
  public sns11: f64;
  public sns12: f64;
  public sns13: f64;
  public sns14: f64;
  public sns15: f64;
  public sns16: f64;
  public sns17: f64;
  public sns18: f64;
  public sns19: f64;
  public sns20: f64;
  public sns21: f64;
  public sns22: f64;
  public sns23: f64;
  public sns24: f64;

  // snsX data will be sent as i64 OR f64. Define both.
  setInteger(name: string, value: i64): void {
    if (name == "type") {
      this.type = value;
    } else if (name == "bat") {
      this.bat = value;
    } else if (name == "major_axis") {
      this.major_axis = value;
    } else if (name == "minor_axis") {
      this.minor_axis = value;
    } else if (name == "attr") {
      this.attr = value;
    } else if (name == "sns_valid_no") {
      this.sns_valid_no = value;
    } else if (name == "sns1") {
      this.sns1 = value as f64;
    } else if (name == "sns2") {
      this.sns2 = value as f64;
    } else if (name == "sns3") {
      this.sns3 = value as f64;
    } else if (name == "sns4") {
      this.sns4 = value as f64;
    } else if (name == "sns5") {
      this.sns5 = value as f64;
    } else if (name == "sns6") {
      this.sns6 = value as f64;
    } else if (name == "sns7") {
      this.sns7 = value as f64;
    } else if (name == "sns8") {
      this.sns8 = value as f64;
    } else if (name == "sns9") {
      this.sns9 = value as f64;
    } else if (name == "sns10") {
      this.sns10 = value as f64;
    } else if (name == "sns11") {
      this.sns11 = value as f64;
    } else if (name == "sns12") {
      this.sns12 = value as f64;
    } else if (name == "sns13") {
      this.sns13 = value as f64;
    } else if (name == "sns14") {
      this.sns14 = value as f64;
    } else if (name == "sns15") {
      this.sns15 = value as f64;
    } else if (name == "sns16") {
      this.sns16 = value as f64;
    } else if (name == "sns17") {
      this.sns17 = value as f64;
    } else if (name == "sns18") {
      this.sns18 = value as f64;
    } else if (name == "sns19") {
      this.sns19 = value as f64;
    } else if (name == "sns20") {
      this.sns20 = value as f64;
    } else if (name == "sns21") {
      this.sns21 = value as f64;
    } else if (name == "sns22") {
      this.sns22 = value as f64;
    } else if (name == "sns23") {
      this.sns23 = value as f64;
    } else if (name == "sns24") {
      this.sns24 = value as f64;
    }
  }

  setString(name: string, value: string): void {
    if (name == "loc_data") {
      this.loc_data = value;
    } else if (name == "ns") {
      this.ns = value;
    } else if (name == "ew") {
      this.ew = value;
    } else if (name == "uuid") {
      this.uuid = value;
    } else if (name == "major") {
      this.major = value;
    } else if (name == "minor") {
      this.minor = value;
    } else if (name == "rssi_b") {
      this.rssi_b = value;
    } else if (name == "timestamp") {
      this.timestamp = value;
    } else if (name == "imei") {
      this.imei = value;
    } else if (name == "adv_add") {
      this.adv_add = value;
    }
  }

  // snsX data will be sent as i64 OR f64. Define both.
  setFloat(name: string, value: f64): void {
    if (name == "lat") {
      this.lat = value;
    } else if (name == "lon") {
      this.lon = value;
    } else if (name == "sns1") {
      this.sns1 = value;
    } else if (name == "sns2") {
      this.sns2 = value;
    } else if (name == "sns3") {
      this.sns3 = value;
    } else if (name == "sns4") {
      this.sns4 = value;
    } else if (name == "sns5") {
      this.sns5 = value;
    } else if (name == "sns6") {
      this.sns6 = value;
    } else if (name == "sns7") {
      this.sns7 = value;
    } else if (name == "sns8") {
      this.sns8 = value;
    } else if (name == "sns9") {
      this.sns9 = value;
    } else if (name == "sns10") {
      this.sns10 = value;
    } else if (name == "sns11") {
      this.sns11 = value;
    } else if (name == "sns12") {
      this.sns12 = value;
    } else if (name == "sns13") {
      this.sns13 = value;
    } else if (name == "sns14") {
      this.sns14 = value;
    } else if (name == "sns15") {
      this.sns15 = value;
    } else if (name == "sns16") {
      this.sns16 = value;
    } else if (name == "sns17") {
      this.sns17 = value;
    } else if (name == "sns18") {
      this.sns18 = value;
    } else if (name == "sns19") {
      this.sns19 = value;
    } else if (name == "sns20") {
      this.sns20 = value;
    } else if (name == "sns21") {
      this.sns21 = value;
    } else if (name == "sns22") {
      this.sns22 = value;
    } else if (name == "sns23") {
      this.sns23 = value;
    } else if (name == "sns24") {
      this.sns24 = value;
    }
  }
}

class UserData extends JSONHandler {
  public sns1: string = "";
  public sns2: string = "";
  public sns3: string = "";
  public sns4: string = "";
  public sns5: string = "";
  public sns6: string = "";
  public sns7: string = "";
  public sns8: string = "";
  public sns9: string = "";
  public sns10: string = "";
  public sns11: string = "";
  public sns12: string = "";
  public sns13: string = "";
  public sns14: string = "";
  public sns15: string = "";
  public sns16: string = "";
  public sns17: string = "";
  public sns18: string = "";
  public sns19: string = "";
  public sns20: string = "";
  public sns21: string = "";
  public sns22: string = "";
  public sns23: string = "";
  public sns24: string = "";

  setString(name: string, value: string): void {
    if (name == "sns1") {
      this.sns1 = value;
    } else if (name == "sns2") {
      this.sns2 = value;
    } else if (name == "sns3") {
      this.sns3 = value;
    } else if (name == "sns4") {
      this.sns4 = value;
    } else if (name == "sns5") {
      this.sns5 = value;
    } else if (name == "sns6") {
      this.sns6 = value;
    } else if (name == "sns7") {
      this.sns7 = value;
    } else if (name == "sns8") {
      this.sns8 = value;
    } else if (name == "sns9") {
      this.sns9 = value;
    } else if (name == "sns10") {
      this.sns10 = value;
    } else if (name == "sns11") {
      this.sns11 = value;
    } else if (name == "sns12") {
      this.sns12 = value;
    } else if (name == "sns13") {
      this.sns13 = value;
    } else if (name == "sns14") {
      this.sns14 = value;
    } else if (name == "sns15") {
      this.sns15 = value;
    } else if (name == "sns16") {
      this.sns16 = value;
    } else if (name == "sns17") {
      this.sns17 = value;
    } else if (name == "sns18") {
      this.sns18 = value;
    } else if (name == "sns19") {
      this.sns19 = value;
    } else if (name == "sns20") {
      this.sns20 = value;
    } else if (name == "sns21") {
      this.sns21 = value;
    } else if (name == "sns22") {
      this.sns22 = value;
    } else if (name == "sns23") {
      this.sns23 = value;
    } else if (name == "sns24") {
      this.sns24 = value;
    }
  }
}

// get userdata as Uint8Array from environment
function getUserdataAsBuffer(): Uint8Array {
  const arr = new Uint8Array(orbit_get_userdata_len());
  orbit_get_userdata(uint8ArrayToPointer(arr), arr.length);
  return arr;
}

function uint8ArrayToPointer(arr: Uint8Array): i32 {
  // @ts-ignore (as documented but not in .d.ts)
  return arr.dataStart as i32;
}
