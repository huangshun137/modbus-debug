<template>
  <el-dialog
    :title="addFlag ? '新增寄存器' : '编辑寄存器'"
    :model-value="modalVisible"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    class="modbus-info-modal"
  >
    <el-form
      ref="modbusFormRef"
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
      <el-form-item label="标签宽度" prop="labelWidth">
        <el-input-number
          v-model="modbusForm.labelWidth"
          :min="10"
          :controls="false"
          placeholder="请输入标签宽度"
        >
          <template #suffix>
            <span>px</span>
          </template>
        </el-input-number>
      </el-form-item>
      <el-form-item label="寄存器地址" prop="registerAddr">
        <el-input-number
          v-model="modbusForm.registerAddr"
          :min="0"
          :controls="false"
          placeholder="请输入寄存器地址"
        />
      </el-form-item>
      <el-form-item label="寄存器地址长度" prop="registerAddrLength">
        <el-input-number
          v-model="modbusForm.registerAddrLength"
          :min="1"
          :controls="false"
          placeholder="请输入寄存器地址长度"
        />
      </el-form-item>
      <el-form-item label="寄存器数据类型" prop="registerDataType">
        <el-select
          v-model="modbusForm.registerDataType"
          placeholder="请选择寄存器数据类型"
        >
          <el-option
            v-for="item in registerDataTypeList"
            :key="item.type"
            :label="item.typeName"
            :value="item.type"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="占位长度" prop="span">
        <el-input-number
          v-model="modbusForm.span"
          :min="1"
          :max="24"
          :controls="false"
          placeholder="请输入占位长度"
        />
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
import { InputRegisterInfo, RegisterDataType, RegisterItem } from "..";

defineProps<{
  registerDataTypeList: RegisterDataType[];
}>();
const emit = defineEmits<{
  (e: "handleConfirm", registerInfo: InputRegisterInfo): void;
}>();

const defaultFormData: any = {
  label: undefined,
  labelWidth: 120,
  registerAddr: undefined,
  registerAddrLength: 1,
  registerDataType: undefined,
  span: 6,
};
const addFlag = ref<boolean>(true);
const modalVisible = ref<boolean>(false);
const modbusFormRef = ref<FormInstance>();
const registerType = ref<string>();
const modbusForm = reactive<RegisterItem>({
  ...defaultFormData,
});
const formRules = reactive<FormRules>({
  label: [{ required: true, message: "请输入标签名称" }],
  labelWidth: [{ required: true, message: "请输入标签宽度" }],
  registerAddr: [{ required: true, message: "请输入寄存器地址" }],
  registerAddrLength: [{ required: true, message: "请输入寄存器地址长度" }],
  registerDataType: [{ required: true, message: "请选择寄存器数据类型" }],
  span: [{ required: true, message: "请输入占位长度" }],
});

const handleModalClose = () => {
  modalVisible.value = false;
};
const handleConfirm = () => {
  modbusFormRef.value!.validate((valid: boolean) => {
    if (valid) {
      let params: InputRegisterInfo = {
        ...modbusForm,
        registerType: registerType.value!,
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
    modbusFormRef.value!.resetFields();
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
