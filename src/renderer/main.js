import Vue from "vue";
import axios from "axios";
import Mhr from "./menhera";
import "iview/dist/styles/iview.css";

import {
  Input,
  Select,
  Option,
  Button,
  Table,
  Sider,
  Menu,
  Submenu,
  MenuItem,
  Layout,
  Card,
  Icon,
  Header,
  Content,
  Breadcrumb,
  BreadcrumbItem
} from "iview";
let Components = {
  Input,
  Select,
  Option,
  Button,
  Table,
  Sider,
  Menu,
  Submenu,
  MenuItem,
  Layout,
  Card,
  Icon,
  Header,
  Content,
  Breadcrumb,
  BreadcrumbItem
};
for ([key, val] of Object.entries(Components)) {
  Vue.component(key, val);
}

import App from "./App";
import router from "./router";
import store from "./store";

if (!process.env.IS_WEB) Vue.use(require("vue-electron"));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

Vue.use(Mhr);

/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  template: "<App/>"
}).$mount("#app");
