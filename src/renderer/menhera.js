import Mhr, { $set, $ } from "menhera";
import Vuex from "vuex";
import io from "socket.io-client";
import { globalAgent } from "https";
let socket = io("http://localhost:2333");

let Vue;

global.Mhr = Mhr;

Mhr._events.on("$use", o => {
  socket.emit("$use", o);
});

socket.on("$get", o => {
  const { $get: data, uuid } = o;
  let vm = vmMap[uuid];
  vm.$store.commit("set", data);
});

socket.on("$set", o => {
  const { $set: data, uuid } = o;
  let vm = vmMap[uuid];
  vm.$store.commit("set", data);
});

let vmMap = {};

export default _Vue => {
  Vue = _Vue;

  _Vue.mixin({
    beforeCreate() {
      const vm = this;
      const store = vm.$store;
      const uuid = vm._uid;

      let storeModules = {};
      vmMap[uuid] = vm;
      let MhrOptions = vm.$options.Mhr || {};
      // const { $use, $get, $set } = MhrOptions;
      if (MhrOptions.$use) {
        Mhr.$use({ $use: MhrOptions.$use });
      }
      if (MhrOptions.$get) {
        storeModules = {
          Mhr: {
            mutations: {
              set(state, data) {
                $(data, (k, v) => {
                  if (!state[k]) {
                    state[k] = {};
                  }
                  $set(state[k], v);
                  state[k] = { ...state[k] };
                });
              }
            },
            getters: {
              Mhr: state => state
            }
          }
        };
        storeModules.Mhr.state = MhrOptions.$get;
        Mhr.$use({ uuid, $get: MhrOptions.$get });
      }
      if (MhrOptions.$set) {
        Mhr.$use({ uuid, $set: MhrOptions.$set });
      }

      $(storeModules, (k, v) => {
        store.registerModule(k, v);
      });
    }
  });
};
