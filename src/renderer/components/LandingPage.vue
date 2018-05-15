<template lang="pug">
  div(id="wrapper")
    Sider(:style="{position: 'fixed', height: '100vh', left: 0, overflow: 'auto'}")
      Menu(active-name="test" theme="dark" width="auto" @on-select="onSelect")
        MenuItem(v-for="(val, key) in Mhr"  :name="key") 
          Icon(type="record" size="10" color="")
          span {{key}}
          
    Layout(:style="{marginLeft: '200px'}")
      Card
        div(style="height: 600px")
          Menu(active-name="test" width="auto")
            MenuItem.menu-item(v-if='val.type !== "object"' v-for="(val, key) in currentData.data"  :name="key") 
              div.stringItem(v-if='val.type === "enum"')
                span {{key}}:                                 
                Select(:disabled="false")
                  Option(v-for='e in val.enums' :value="e") 
              div.stringItem(v-if='val.type === "string"')
                span {{key}}:                                 
                Input(v-model="currentData.$data[key]")  
              Button(v-if='val.type == "function"') {{key}}
          
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";

export default {
  name: "landing-page",
  data() {
    return {
      currentData: {}
    };
  },
  Mhr: {
    $get: {
      test: {},
      test1: {}
    }
  },
  methods: {
    onSelect(name) {
      this.currentData = this.Mhr[name];
    }
  },
  computed: {
    ...mapGetters(["Mhr"])
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
