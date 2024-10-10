<template>
  <div class="modbus-list-container">
    <div class="list-content">
      <el-card class="search-form-content">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="modbusIp">
            <el-input
              v-model="searchForm.modbusIp"
              placeholder="请输入modbusIp"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="table-content">
        <div class="table-btn">
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
        <el-table
          :data="tableData"
          max-height="calc(100% - 48px)"
          style="width: 100%"
        >
          <el-table-column type="index" />
          <el-table-column prop="modbusIp" label="modbusIp" width="180" />
          <el-table-column prop="modbusPort" label="端口号" width="100" />
          <el-table-column prop="createTime" label="创建时间" width="200" />
          <el-table-column prop="updateTime" label="修改时间" width="200" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button type="primary" link @click="handleEdit(scope.row)"
                >编辑</el-button
              >
              <el-button
                type="primary"
                link
                @click="handleToDetail(scope.row.id)"
                >详情</el-button
              >
              <el-popconfirm
                title="是否确定删除?"
                confirm-button-text="确定"
                cancel-button-text="取消"
                placement="top"
                @confirm="handleDelete(scope.row.id)"
              >
                <template #reference>
                  <el-button type="danger" link>删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <EditModal ref="editModalRef" @handleAddComplete="handleRefresh" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { deleteModbusApi, queryModbusListApi } from "@/api/api";
import EditModal from "./components/EditModal.vue";

const router = useRouter();
const editModalRef = ref(); // 新增/编辑弹窗组件
const searchForm = reactive({
  modbusIp: undefined,
});
const tableData = ref([]);

const handleReset = () => {
  Object.assign(searchForm, {
    modbusIp: undefined,
  });
};
const handleSearch = () => {
  const params = {
    ...searchForm,
    // page: 1,
    // pageSize: 10,
  };
  queryModbusListApi(params).then((res: any) => {
    if (res.code !== 200) {
      ElMessage({
        type: "warning",
        message: res.msg,
      });
      return;
    }
    tableData.value = res.data;
  });
};

const handleAdd = () => {
  editModalRef.value.handleAdd();
};
const handleRefresh = () => {
  handleReset();
  handleSearch();
};
// modbus编辑
const handleEdit = (record: any) => {
  editModalRef.value.handleAdd(record);
};
// modbus详情
const handleToDetail = (id: number) => {
  router.push({
    name: "ModbusDetail",
    params: { id },
  });
};
// modbus删除
const handleDelete = (id: number) => {
  deleteModbusApi(id).then((res: any) => {
    ElMessage.success(res.msg);
    handleRefresh();
  });
};

onMounted(() => {
  handleSearch();
});
</script>
<style lang="less" scoped>
.modbus-list-container {
  height: 100%;
  width: 100%;
  padding: 16px;

  .list-content {
    height: calc(100% - 100px);
  }

  .search-form-content {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding-bottom: 2px;
    }
  }

  .table-content {
    height: calc(100% - 90px);
    width: 100%;

    .table-btn {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
    }

    :deep(.el-card__body) {
      height: 100%;
    }
    :deep(.el-table__header),
    :deep(.el-scrollbar__view),
    :deep(.el-table__body) {
      min-width: 100%;
    }
  }
}
</style>
