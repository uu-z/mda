import Mhr, { $get, $set } from "menhera";
import IO from "socket.io";
import http from "http";

const port = 2333;
const server = http.createServer();
let io = IO(server);

const test = {
  name: "test",
  data: {
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
      enums: {
        running: "running",
        stop: "stop"
      },
      val: "running"
    },
    listen: {
      type: "function",
      val() {
        this.server = http.createServer();
        this.server.listen(this.port, () => {
          console.log(`server running on port: ${this.port}`);
        });
      }
    }
  }
};

Mhr.$use({
  _hooks: {
    data: {
      _({ cp }) {
        if (!cp["$data"]) {
          cp["$data"] = {};
        }
      },
      $({ _key, _val, cp }) {
        const { val } = _val;
        if (typeof val === "function") {
          cp["$data"][_key] = "function";
          return;
        }
        cp["$data"][_key] = val;
      }
    }
  },
  _mount: {
    test
  }
});

io.on("connection", socket => {
  socket.on("$use", o => {
    console.log(o);
    if (o.$use) {
      Mhr.$use(o.$use);
    }
    if (o.$get) {
      o.$get = $get(Mhr, o.$get);
      socket.emit("$get", o);
    }
    if (o.$set) {
      o.$set = $set(Mhr, o.$set);
      socket.emit("$set", o);
    }
  });
});

server.listen(port, () => {
  console.log(`server listen on ${port}`);
});
