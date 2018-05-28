import Mhr, { $, get, set, $get, $set } from "menhera";
import IO from "socket.io";
import http from "http";
import { observable, observe } from "@nx-js/observer-util";

const port = 2333;
const server = http.createServer();
let io = IO(server);
const matchEnum = /|/;

const testRaw = {
  number: 6666,
  boolean: true,
  array: [1, 2, 3],
  object: { 1: 1, 2: 2, 3: 3 },
  enum: `>stop|pending|running`,
  function() {
    this.enum.val = "running";
  }
};

const MDA = {
  name: "MDA",
  mounts: {},
  _hooks: {
    MDA: {
      mountRaw: {
        $({ _key, _val, _, cp }) {
          $(_val, (k, _v) => {
            let v = {
              type: typeof _v,
              val: _v
            };
            if (v.type == "string") {
              v._val = "";
              v.enums = [];
              if (/|/.test(v)) {
                v.val.split("|").forEach(i => {
                  if (i.startsWith(">")) {
                    i = i.replace(">", "");
                    v._val = i;
                  }
                  v.enums.push(i);
                });
                v.type = "enum";
                v.val = v._val;
                delete v._val;
              }
            }

            if (v.type == "function") {
              v.val = v.val.bind(_val);
            }

            if (v.type == "object") {
              if (Array.isArray(v.val)) {
                v.type = "array";
              }
            }

            _val[k] = v;
            _val[k] = observable(v);
            observe(() => {
              io.emit("$use", {
                "MDA.run": {
                  [`${_key}.${k}`]: _val[k].val
                }
              });
            });
          });
          this.mounts[_key] = _val;
          _val._ = _;
        }
      },
      mount: {
        $({ _key, _val, _, cp }) {
          this.mounts[_key] = _val;
          _val._ = _;
          $(_val, (k, v) => {
            if (v.type == "function") {
              v.val = v.val.bind(_val);
            }
            _val[k] = observable(v);
            observe(() => {
              io.emit("$use", {
                "MDA.run": {
                  [`${_key}.${k}`]: _val[k].val
                }
              });
            });
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
    mountRaw: {
      testRaw
    },
    mount: {
      // test,
      // test1: test
    }
  }
});

// for (let [key, val] of Object.entries(Mhr)) {
//   if (typeof val == "function") {
//     Mhr._events.on(key, o => {
//       io.emit(key, o);
//     });
//   }
// }

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
