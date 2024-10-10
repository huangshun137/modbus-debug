<template>
  <el-dialog
    title="新增寄存器"
    :model-value="modalVisible"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    class="modbus-info-modal"
  >
    <el-form
      ref="modbusWriteFormRef"
      :model="modbusForm"
      :rules="formRules"
      label-width="auto"
      status-icon
    >
      <el-form-item label="标签名称" prop="label">
        <el-input
          v-model="modbusForm.label"
          placeholder="请输入标签名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="寄存器地址" prop="registerAddr">
        <el-input-number
          v-model="modbusForm.registerAddr"
          :min="0"
          :controls="false"
          placeholder="请输入寄存器地址"
        />
      </el-form-item>
      <el-form-item label="寄存器值" prop="registerValue">
        <el-input
          v-model="modbusForm.registerValue"
          :formatter="(value: string) => value.replace(/[^0-9,]/g, '')"
          placeholder="请输入寄存器值（如有多个以逗号隔开）"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleModalClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { reactive, ref, nextTick } from "vue";
import { FormInstance, FormRules } from "element-plus";
import { WriteRegisterInfo, RegisterDataType, WriteRegisterItem } from "..";

defineProps<{
  registerDataTypeList: RegisterDataType[];
}>();
const emit = defineEmits<{
  (e: "handleConfirm", registerInfo: WriteRegisterInfo): void;
}>();

const defaultFormData: any = {
  label: undefined,
  registerAddr: undefined,
  registerValue: undefined,
};
const addFlag = ref<boolean>(true);
const modalVisible = ref<boolean>(false);
const modbusWriteFormRef = ref<FormInstance>();
const registerType = ref<string>();
const modbusForm = reactive<WriteRegisterItem>({
  ...defaultFormData,
});
const formRules = reactive<FormRules>({
  label: [{ required: true, message: "请输入标签名称" }],
  registerAddr: [{ required: true, message: "请输入寄存器地址" }],
  registerValue: [{ required: true, message: "请输入寄存器值" }],
});

const handleModalClose = () => {
  modalVisible.value = false;
};
const handleConfirm = () => {
  modbusWriteFormRef.value!.validate((valid: boolean) => {
    if (valid) {
      const registerValues = modbusForm.registerValue.split(",").map(Number);
      let params: WriteRegisterInfo = {
        ...modbusForm,
        registerType: registerType.value!,
        registerValues: registerValues,
      };
      if (addFlag.value) {
        params.id = -Math.random();
      }
      emit("handleConfirm", params);
      handleModalClose();
    }
  });
};

const handleAdd = (type: string, record: any = null) => {
  registerType.value = type;
  addFlag.value = !record;
  modalVisible.value = true;

  nextTick(() => {
    modbusWriteFormRef.value!.resetFields();
    if (!!record) {
      Object.assign(modbusForm, {
        ...record,
      });
    } else {
      Object.assign(modbusForm, {
        ...defaultFormData,
      });
    }
  });
};

defineExpose({
  handleAdd,
});
</script>
<style lang="less" scoped>
.modbus-info-modal {
  .el-input-number {
    width: 95%;

    :deep(.el-input__inner) {
      text-align: left;
    }
  }
  .el-input,
  .el-select {
    width: 95%;
  }
}
</style>
