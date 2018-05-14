import Mhr, {
  $set
} from 'menhera'
import socket from 'socket.io-client'

global.Mhr = Mhr

let io = socket("http://localhost:2333")

Mhr._events.on("$use", o => {
  $set(o, {
    ipc: {
      type: "render"
    }
  })
  io.emit("$use", o)
})


export default (Vue) => {
  Vue.mixin({
    created() {
      const vm = this
      let MhrOptions = vm.$options.Mhr || {}
      const {
        $use
      } = MhrOptions
      if ($use) {
        Mhr.$use($use)
      }
    }
  })
}