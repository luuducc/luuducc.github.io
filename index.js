const express = require("express");
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)

// random string generator
const {faker} = require("@faker-js/faker")

const port = 3000
app.use(express.static('./public'))

// create a list to store client information
let friendList = []

io.on('connection', (socket)=>{
  // generate a fake name
  const username = faker.person.firstName()

  // add new client to the list
  friendList.push({
    [username]: socket.id
  })
  console.log(friendList)

  // return name to the client and newly connected friends
  io.emit('returnName', friendList, username)

  // store info of receiver
  let receiver = null

  // server receive msg
  socket.on('chat', (msg, name)=>{
    friendList.forEach(element => {
      if(Object.keys(element)[0] === name) {
        receiver = element[name]
      }
    })

    // send msg to the receiver
    io.to(receiver).emit('sendMsg', username, msg) 
    
    // send msg back to the sender
    io.to(socket.id).emit('sendMsg', 'you', msg, name) 
  })
})



http.listen(port, ()=>{
  console.log(`server is listening at http://localhost:${port}`)
})