let io

module.exports={
    init: httpServer =>{
        io = require('socket.io')(httpServer, {
            cors: {
              origin: "http://localhost:3000", // Allow your frontend's origin
              methods: ["GET", "POST","PATCH"]
            }
          })
        return io
    },
    getIO:()=>{
        if(!io){
            throw new Error('Socket.io not initialized')
        }
        return io
    }
}