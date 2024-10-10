<template>
  <el-dialog
    :title="addFlag ? '新增modbus连接' : '编辑modbus连接'"
    :model-value="modalVisible"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <el-form
      ref="modbusFormRef"
      :model="modbusForm"
      :rules="formRules"
      label-width="auto"
      status-icon
    >
      <el-form-item label="modbusIp" prop="modbusIp">
        <el-input
          v-model="modbusForm.modbusIp"
          :formatter="(value: string) => value.replace(/[^0-9.]/g, '')"
          placeholder="请输入modbusIp"
        ></el-input>
      </el-form-item>
      <el-form-item label="端口号" prop="modbusPort">
        <el-input
          v-model.number="modbusForm.modbusPort"
          :formatter="(value: string) => value.replace(/[^0-9]/g, '')"
          placeholder="请输入端口号"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleModalClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { reactive, ref, nextTick } from "vue";
import { FormInstance, FormRules } from "element-plus";
import { updateModbusApi } from "@/api/api";

const emit = defineEmits<{
  (e: "handleAddComplete"): void;
}>();

const addFlag = ref<boolean>(true);
const modalVisible = ref<boolean>(false);
const modbusFormRef = ref<FormInstance>();
const modbusForm = reactive({
  modbusIp: undefined,
  modbusPort: undefined,
});
const formRules = reactive<FormRules>({
  modbusIp: [{ required: true, message: "请输入modbusIp" }],
  modbusPort: [{ required: true, message: "请输入端口号" }],
});

const handleModalClose = () => {
  modalVisible.value = false;
};
const handleConfirm = () => {
  modbusFormRef.value!.validate((valid: boolean) => {
    if (valid) {
      let params;
      if (addFlag.value) {
        params = {
          modbusIp: modbusForm.modbusIp,
          modbusPort: modbusForm.modbusPort,
        };
      } else {
        params = {
          ...modbusForm,
        };
      }
      updateModbusApi(params).then((res: any) => {
        if (res.code !== 200) {
          ElMessage.error(res.msg);
        } else {
          ElMessage.success(res.msg);
          emit("handleAddComplete");
          handleModalClose();
        }
      });
    }
  });
};

const handleAdd = (record: any = null) => {
  addFlag.value = !record;
  modalVisible.value = true;

  nextTick(() => {
    modbusFormRef.value!.resetFields();
    if (!!record) {
      Object.assign(modbusForm, {
        ...record,
      });
    } else {
      Object.assign(modbusForm, {
        id: null,
      });
    }
  });
};

defineExpose({
  handleAdd,
});
</script>
<style lang="less" scoped></style>
