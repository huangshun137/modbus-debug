import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

// vue项目自带路由
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/modbus-list",
  },
  {
    path: "/storeTest",
    name: "StoreTest",
    component: () => import("@/views/storeTest.vue"),
  },
  {
    path: "/modbus-list",
    name: "ModbusList",
    component: () => import("@/views/modbusList/index.vue"),
  },
  {
    path: "/modbus-detail/:id",
    name: "ModbusDetail",
    component: () => import("@/views/modbusDetail/index.vue"),
    props: true,
  },
  // {
  //   path: "/about",
  //   name: "About",
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../views/About.vue"),
  // },
];

const routers = [...routes];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_BASE_URL),
  routes: routers,
});

export default router;
