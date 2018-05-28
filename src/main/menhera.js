import Mhr, { $, get, set, $get, $set } from "menhera";
import IO from "socket.io";
import http from "http";
import { observable, observe } from "@nx-js/observer-util";

const port = 2333;
const server = http.createServer();
let io = IO(server);

const test = {
  port: {
    type: "string",
    val: 6666
  },
  server: {
    type: "object",
    val: null
  },
  status: {
    type: "enum",
    disabled: true,
    sync: true,
    enums: {
      running: "running",
      stop: "stop"
    },
    val: "stop"
  },
  listen: {
    type: "function",
    val() {
      this.status.val = "running";
      console.log(this);
    }
  }
};

const MDA = {
  name: "MDA",
  mounts: {},
  _hooks: {
    MDA: {
      mount: {
        $({ _key, _val, _, cp }) {
          this.mounts[_key] = _val;
          _val._ = _;
          $(_val, (k, v) => {
            if (v.type == "function") {
              v.val = v.val.bind(_val);
            }
            if (v.sync) {
              _val[k] = observable(v);
              observe(() => {
                io.emit("$use", {
                  "MDA.run": {
                    [`${_key}.${k}`]: _val[k].val
                  }
                });
              });
            }
          });
        }
      },
      run: {
        $({ _key, _val }) {
          let val = get(this.mounts, _key);
          if (!val) {
            return console.log(`${_key} is not valid`);
          }
          if (val.type !== "function") {
            set(this.mounts, `${_key}.val`, _val);
          }
          if (val.type == "function") {
            val.val();
          }
        }
      }
    }
  }
};

Mhr.$use({
  _mount: { MDA },
  MDA: {
    mount: {
      test,
      test1: test
    }
  }
});

for (let [key, val] of Object.entries(Mhr)) {
  if (typeof val == "function") {
    Mhr._events.on(key, o => {
      io.emit(key, o);
    });
  }
}

io.on("connection", socket => {
  socket.emit("$init", Mhr.MDA);
  socket.on("$use", o => {
    console.log(o);
    Mhr.$use(o);
  });
});

server.listen(port, () => {
  console.log(`server listen on ${port}`);
});
