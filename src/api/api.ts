import { postApi, getApi, deleteApi, getApiWithoutLoading } from "./http";

const baseURL = import.meta.env.VITE_APP_BASE_API;
const testApi = (data: any) => postApi("/test", data);

// modbusList api
// 查询modbus列表
const queryModbusListApi = (data: any) =>
  getApi(baseURL + "/modbus/getModbusList", data);
// 新增/编辑地图
const updateModbusApi = (data: any) =>
  postApi(baseURL + "/modbus/updateModbus", data);
// 删除地图
const deleteModbusApi = (id: any) =>
  deleteApi(baseURL + `/modbus/deleteModbus/${id}`);

// modbusDetail api
// 获取modbus数据类型
const getModbusDataTypeApi = () =>
  getApi(baseURL + "/modbus/getModbusDataType");

// 获取modbus配置
const getModbusConfigApi = (data: any) =>
  getApi(baseURL + "/modbus/getModbusConfig", data);
// 保存modbus配置
const saveModbusConfigApi = (data: any) =>
  postApi(baseURL + "/modbus/saveOrUpdateModbusConfig", data);

// 读取modbus数据
const getModbusValueApi = (data: any) =>
  getApiWithoutLoading(baseURL + "/modbus/getModbusValue", data);

// 写入modbus数据
const setModbusValueApi = (data: any) =>
  postApi(baseURL + "/modbus/setModbusValue", data);
// 连接modbus
const modbusConnect = (data: any) =>
  getApi(baseURL + "/modbus/startConection", data);
// 重连modbus
const modbusReconnected = (data: any) =>
  postApi(baseURL + "/modbus/reconnected", data);
// 关闭modbus
const modbusClose = (data: any) =>
  postApi(baseURL + "/modbus/closeConnect", data);

export {
  testApi,
  queryModbusListApi,
  updateModbusApi,
  deleteModbusApi,
  getModbusDataTypeApi,
  getModbusConfigApi,
  saveModbusConfigApi,
  getModbusValueApi,
  setModbusValueApi,
  modbusConnect,
  modbusReconnected,
  modbusClose,
};
