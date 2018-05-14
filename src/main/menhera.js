import Mhr from 'menhera'
import IO from 'socket.io'
import http from 'http'



const port = 2333
const server = http.createServer()
let io = IO(server)


Mhr.$use({
  _hooks: {
    hello: {
      _() {
        console.log("hello")
      }
    }
  }
})

io.on("connection", socket => {
  socket.on("$use", o => {
    Mhr.$use(o)
  })
})


server.listen(port, () => {
  console.log(`server listen on ${port}`)
})