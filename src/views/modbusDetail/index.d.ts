interface ModbusDetailInfo {
  modbusIp: string;
  modbusPort: string;
  modbusConnected: boolean;
}

interface RegisterItem {
  label: string;
  labelWidth: number;
  registerAddr: number;
  registerAddrLength: number;
  registerDataType: number;
  span: number;
}

interface InputRegisterInfo extends RegisterItem {
  id?: number;
  registerType: string;
  value?: string | number | boolean;
}

interface RegisterDataType {
  type: number;
  typeName: string;
}

interface WriteRegisterItem {
  label: string;
  registerAddr: number;
  registerValue: string;
}

interface WriteRegisterInfo extends WriteRegisterItem {
  id?: number;
  registerType: string;
  registerValues: number[];
}

interface RequestInfo {
  connectModbusTime: number;
  requestInterval: Node.timeout;
  requestTime: number;
}

export {
  ModbusDetailInfo,
  RegisterItem,
  InputRegisterInfo,
  RegisterDataType,
  WriteRegisterItem,
  WriteRegisterInfo,
  RequestInfo,
};
