<template>
  <div class="modbus-detail-page">
    <el-scrollbar>
      <el-card>
        <el-row>
          <el-col :span="12"
            >当前连接的modbusIp：<template v-if="modbusDetailInfo.modbusIp"
              >{{ modbusDetailInfo.modbusIp }}:{{
                modbusDetailInfo.modbusPort
              }}</template
            ></el-col
          >
          <el-col :span="12" style="text-align: right">
            <el-button type="primary" @click="handleConnectedModbus">{{
              requestInfo.connectModbusTime === 0 ? "连接modbus" : "重连modbus"
            }}</el-button>
            <el-button type="primary" @click="handleSave">保存配置</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            当前连接状态：<el-tag
              :type="modbusDetailInfo.modbusConnected ? 'success' : 'danger'"
              >{{
                modbusDetailInfo.modbusConnected ? "已连接" : "未连接"
              }}</el-tag
            >
          </el-col>
          <el-col :span="6"> 请求次数：{{ requestInfo.requestTime }} </el-col>
        </el-row>
        <el-collapse v-model="activeNames">
          <el-collapse-item
            v-for="collapseItem in readInputRegisterList"
            :title="collapseItem.label"
            :name="collapseItem.key"
            :key="collapseItem.key + 'read'"
          >
            <div class="collapse-btn">
              <el-button
                type="primary"
                @click="handleAddRegister(collapseItem.key)"
                >新增</el-button
              >
            </div>
            <el-row class="row-content">
              <el-col
                v-for="item in inputRegisterList.filter(
                  (i) => i.registerType === collapseItem.key
                )"
                :key="`${collapseItem.key}x${item.registerAddr}${item.registerAddrLength}`"
                :span="item.span || 6"
              >
                <div class="item-overlay">
                  <el-button
                    link
                    type="primary"
                    @click="handleAddRegister(collapseItem.key, item)"
                    >编辑</el-button
                  >
                  <el-popconfirm
                    title="是否确定删除?"
                    @confirm="handleDelete(item.id!)"
                  >
                    <template #reference>
                      <el-button link type="danger">删除</el-button>
                    </template>
                  </el-popconfirm>
                </div>
                <span
                  class="label"
                  :style="{ width: item.labelWidth + 'px' }"
                  >{{ item.label }}</span
                >: {{ item.value }}
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
        <el-divider>操作栏</el-divider>
        <el-collapse v-model="activeWriteNames">
          <el-collapse-item
            v-for="collapseItem in writeRegisterMap"
            :title="collapseItem.label"
            :name="collapseItem.key"
            :key="collapseItem.key + 'write'"
          >
            <div class="collapse-btn">
              <el-button
                type="primary"
                @click="handleAddWriteRegister(collapseItem.key)"
                >新增</el-button
              >
            </div>
            <el-row class="row-content">
              <el-tooltip
                placement="top"
                v-for="item in writeRegisterList.filter(
                  (i) => i.registerType === collapseItem.key
                )"
                :key="item.id"
              >
                <template #content>
                  <p>寄存器地址：{{ item.registerAddr }}</p>
                  <p>寄存器值：{{ item.registerValue }}</p>
                  <p style="text-align: right">
                    <el-button
                      type="danger"
                      link
                      @click="handleWriteDelete(item.id!)"
                      >删除</el-button
                    >
                  </p>
                </template>
                <el-button type="info" @click="handleWriteRegister(item)">{{
                  item.label
                }}</el-button>
              </el-tooltip>
            </el-row>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </el-scrollbar>
    <AddOrEditModal
      ref="editModalRef"
      :registerDataTypeList="registerDataTypeList"
      @handleConfirm="handleModalConfirm"
    />
    <WriteRegisterModal
      ref="writeRegisterModalRef"
      :registerDataTypeList="registerDataTypeList"
      @handleConfirm="handleWriteModalConfirm"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive, watch, onUnmounted } from "vue";
import {
  getModbusDataTypeApi,
  modbusConnect,
  modbusReconnected,
  modbusClose,
  getModbusValueApi,
  saveModbusConfigApi,
  getModbusConfigApi,
  setModbusValueApi,
} from "@/api/api";
import WebSocketClient from "@/utils/websocket";
import AddOrEditModal from "./components/AddOrEditModal.vue";
import WriteRegisterModal from "./components/WriteRegisterModal.vue";
import {
  ModbusDetailInfo,
  InputRegisterInfo,
  RegisterDataType,
  WriteRegisterInfo,
  RequestInfo,
} from ".";

const readInputRegisterList = [
  { label: "离散输入寄存器（1x）", key: "1" },
  { label: "输入寄存器（3x）", key: "3" },
  { label: "保持寄存器（4x）", key: "4" },
];
const writeRegisterMap = [
  { label: "线圈（0x）", key: "0" },
  { label: "保持寄存器（4x）", key: "4" },
];

const props = defineProps<{
  id: string;
}>();

const ws = new WebSocketClient(
  `${import.meta.env.VITE_APP_WS_URL}/${props.id}/modbusStatus`
);
const unsubscribe = ws.on("message", (event) => {
  // connected error close
  modbusDetailInfo.modbusConnected = event.data === "connected";
});

const activeNames = ref<string[]>([]);
const activeWriteNames = ref(["0", "4"]);
const editModalRef = ref(); // 新增/编辑弹窗组件
const writeRegisterModalRef = ref(); // 新增写入寄存器弹窗组件

const modbusDetailInfo = reactive<ModbusDetailInfo>({
  modbusConnected: false,
  modbusIp: "",
  modbusPort: "",
}); // 当前连接的modbus信息
const inputRegisterList = ref<InputRegisterInfo[]>([]); // 读取寄存器列表
const writeRegisterList = ref<WriteRegisterInfo[]>([]); // 写入寄存器列表
const registerDataTypeList = ref<RegisterDataType[]>([]); // 寄存器存储数据类型

const requestInfo = reactive<RequestInfo>({
  connectModbusTime: 0,
  requestInterval: undefined,
  requestTime: 0,
});

watch(
  () => modbusDetailInfo.modbusConnected,
  (value) => {
    if (value) {
      handleRequest();
    } else {
      requestInfo.requestInterval && clearInterval(requestInfo.requestInterval);
    }
  }
);

const handleAddRegister = (
  type: string,
  record: InputRegisterInfo | null = null
) => {
  editModalRef.value.handleAdd(type, record);
};

const handleDelete = (id: number) => {
  inputRegisterList.value = inputRegisterList.value.filter((i) => i.id !== id);
};

const handleModalConfirm = (info: InputRegisterInfo) => {
  if (info.id && info.id > 0) {
    const index = inputRegisterList.value.findIndex((i) => i.id === info.id);
    inputRegisterList.value.splice(index, 1, info);
  } else {
    inputRegisterList.value.push({ ...info });
  }
};

// 添加写入寄存器
const handleAddWriteRegister = (type: string) => {
  writeRegisterModalRef.value.handleAdd(type);
};

const handleWriteModalConfirm = (info: WriteRegisterInfo) => {
  if (info.id && info.id > 0) {
    const index = writeRegisterList.value.findIndex((i) => i.id === info.id);
    writeRegisterList.value.splice(index, 1, info);
  } else {
    writeRegisterList.value.push({ ...info });
  }
};

const handleWriteDelete = (id: number) => {
  writeRegisterList.value = writeRegisterList.value.filter((i) => i.id !== id);
};

// 写入寄存器
const handleWriteRegister = (info: WriteRegisterInfo) => {
  const params = {
    id: props.id,
    addr: info.registerAddr,
    value: info.registerValues,
    type: info.registerType + "x",
  };
  setModbusValueApi(params).then(() => {
    ElMessage.success("操作成功");
  });
};

// 获取modbus数据类型
const getModbusDataType = () => {
  getModbusDataTypeApi().then((res) => {
    registerDataTypeList.value = res.data ?? [];
  });
};
const getModbusDetail = () => {
  getModbusConfigApi({
    id: props.id,
  }).then((res: any) => {
    modbusDetailInfo.modbusIp = res.data.modbusIp;
    modbusDetailInfo.modbusPort = res.data.modbusPort;
    inputRegisterList.value = res.data.registerList;
    activeNames.value = [
      ...new Set(
        res.data.registerList?.map((item: any) => item.registerType) as string[]
      ),
    ];
    writeRegisterList.value = res.data.writeRegisterList?.map((item: any) => ({
      ...item,
      registerValues: item.registerValue.split(",").map(Number),
    }));

    // handleConnectedModbus();
  });
};

const handleConnectedModbus = () => {
  if (requestInfo.connectModbusTime === 0) {
    const params = {
      id: props.id,
      modbusIp: modbusDetailInfo.modbusIp,
      modbusPort: modbusDetailInfo.modbusPort,
    };
    modbusConnect(params).then((res: any) => {
      ElMessage.info(res.msg);
    });
    requestInfo.connectModbusTime++;
  } else {
    handleReconnect();
  }
};
const handleReconnect = () => {
  modbusReconnected({ id: props.id }).then((res: any) => {
    ElMessage({
      message: res.msg,
      type: "success",
      duration: 3 * 1000,
    });
    requestInfo.connectModbusTime++;
  });
};

const handleRequest = () => {
  requestInfo.requestInterval && clearInterval(requestInfo.requestInterval);
  requestInfo.requestInterval = setInterval(() => {
    let promiseList: any[] = [],
      activeRegisterInfos: any[] = [];
    activeNames.value.forEach((key) => {
      const registerList = inputRegisterList.value.filter(
        (item) => item.registerType === key
      );
      if (registerList.length === 0) return;
      const registerAddrList = registerList
        .map((item) => ({
          registerAddr: item.registerAddr,
          registerAddrLength: item.registerAddrLength,
        }))
        .sort((a, b) => a.registerAddr - b.registerAddr);
      const lastItem = registerAddrList[registerAddrList.length - 1];
      // 读取寄存器的长度
      const count =
        lastItem.registerAddr -
        registerAddrList[0].registerAddr +
        lastItem.registerAddrLength -
        1;
      activeRegisterInfos.push({
        type: key,
        minAddr: registerAddrList[0].registerAddr,
        maxAddr: lastItem.registerAddr,
      });
      const params = {
        addr: registerAddrList[0].registerAddr,
        count: registerList.length === 1 ? 1 : count,
        type: key + "x",
        id: props.id,
      };
      const _promise = getModbusValueApi(params)
        .then((res) => ({ type: key, value: res.data }))
        .catch((err) => {
          console.log(err);
        });
      promiseList.push(_promise);
    });
    Promise.all(promiseList).then((results) => {
      inputRegisterList.value.forEach((item) => {
        if (!activeNames.value.includes(item.registerType)) return;
        const res =
          results.find((result) => result.type === item.registerType)?.value ??
          [];
        const activeItem = activeRegisterInfos.find(
          (i) => i.type === item.registerType
        );
        const index = item.registerAddr - activeItem.minAddr;
        console.log("index::::", index, res);
        item.value = res[index];
      });
      requestInfo.requestTime = requestInfo.requestTime + 1;
    });
  }, 500);
};

const handleSave = () => {
  const params = {
    ...modbusDetailInfo,
    listId: props.id,
    registerList: inputRegisterList.value.map((item) => ({
      ...item,
      id: item.id && item.id > 0 ? item.id : null,
    })),
    writeRegisterList: writeRegisterList.value.map((item) => ({
      ...item,
      id: item.id && item.id > 0 ? item.id : null,
    })),
  };
  saveModbusConfigApi(params).then((res: any) => {
    ElMessage.success(res.msg);
  });
};

const handleCloseConnect = () => {
  modbusClose({ id: props.id }).then((res: any) => {
    ElMessage.info(res.msg);
  });
};

onMounted(() => {
  getModbusDataType();
  getModbusDetail();
});
onUnmounted(() => {
  requestInfo.requestInterval && clearInterval(requestInfo.requestInterval);
  unsubscribe();
  ws.close();
  handleCloseConnect();
});
</script>
<style lang="less" scoped>
.modbus-detail-page {
  width: 100%;
  height: 100%;
  padding: 16px;

  .el-collapse {
    :deep(.el-collapse-item__header) {
      font-weight: bold;
      font-size: 16px;

      &.is-active {
        color: cornflowerblue;
      }
    }
  }

  .el-row {
    margin-bottom: 16px;
  }

  .row-content {
    font-size: 20px;

    & > .el-button {
      margin-top: 8px;
    }
    .el-col {
      margin-top: 8px;
      position: relative;

      .label {
        display: inline-block;
        text-align: right;
      }

      .item-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        text-align: center;
        background-color: rgba(0, 0, 0, 0.3);
        display: none;
      }

      &:hover {
        .item-overlay {
          display: block;
        }
      }
    }
  }
}
</style>
