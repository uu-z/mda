<template lang="pug">
  div(id="wrapper")
    Sider(:style="{position: 'fixed', height: '100vh', left: 0, overflow: 'auto'}")
      Menu(active-name="test" theme="dark" width="auto" @on-select="onSelect")
        MenuItem(v-for="(val, key) in MDA.mounts"  :name="key") 
          Icon(type="record" size="10" color="")
          span {{key}}
          
    Layout(:style="{marginLeft: '200px'}")
      Card
        div(style="height: 600px")
          Menu(active-name="test" width="auto")
            MenuItem.menu-item(v-if='val.type !== "object"' v-for="(val, key) in currentMda"  :name="key") 
              div.stringItem(v-if='val.type === "enum"')
                span {{key}}: {{val.val}}                                 
                //- Select(:disabled="false")
                //-   Option(v-for='e in val.enums' :value="e") 
              div.stringItem(v-if='val.type === "string"')
                span {{key}}:                                 
                Input(v-model="val.val" @on-change="runFun(key)")  
              Button(v-if='val.type == "function"' @click="runFun(key)") {{key}}
          
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import Mhr, { $use, set, get, $set, $ } from "menhera";
import io from "socket.io-client";

export default {
  name: "landing-page",
  data() {
    return {
      mhr: {},
      MDA: {
        mounts: {}
      },
      currentMount: ""
    };
  },
  Mhr: {},
  mounted() {
    const _this = this;
    const MDA_Client = {
      name: "MDA",
      mounts: {},
      _hooks: {
        MDA: {
          run: {
            $({ _key, _val }) {
              console.log(_key, _val);
              let val = get(_this.MDA.mounts, _key);
              if (!val) {
                return console.log(`${_key} is not valid`);
              }
              if (val.type !== "function") {
                set(_this.MDA.mounts, `${_key}.val`, _val);
              }
              if (val.type == "function") {
                // val.val();
              }
            }
          }
        }
      }
    };
    this.mhr = new Mhr({
      _mount: {
        MDA_Client
      }
    });
    global.mhr = this.mhr;

    let socket = io("http://localhost:2333");
    for (let [key, val] of Object.entries(this.mhr)) {
      if (typeof val == "function") {
        this.mhr._events.on(key, o => {
          socket.emit(key, o);
        });
      }
    }
    socket.on("$use", o => {
      console.log("Server Usee ", o);
      $use(this.mhr, o);
    });

    socket.on("$init", o => {
      this.MDA = o;
    });
  },
  methods: {
    onSelect(key) {
      this.currentMount = key;
    },
    runFun(key) {
      this.mhr.$use({
        "MDA.run": {
          [`${this.currentMount}.${key}`]: this.currentMda[key].val || null
        }
      });
    }
  },
  computed: {
    currentMda: {
      get() {
        return this.MDA.mounts[this.currentMount];
      }
    }
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

.stringItem {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
