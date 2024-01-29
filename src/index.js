const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { messageGenerator } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom, getAllUsers } = require('./utils/users')

const app = express()
const server = http.createServer(app)

const io = socketio(server)

const port = process.env.PORT || 3000
const publicPathDir = path.join(__dirname, '../public')

app.use(express.static(publicPathDir))

// Connection d'un utilisateur
io.on('connection', (socket) => {

    

    socket.emit('userList', getAllUsers());

    socket.on('join', (options, callback) => {

        console.log(options)
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        io.emit('userList', getAllUsers());
        // Rejoindre une room
        socket.join(user.room)

        // Envoi d'un message à l'utilisateur
        socket.emit('message', messageGenerator('Admin', 'Welcome!', user.avatarUrl))

        // Envoi d'un message à tous les utilisateurs sauf l'utilisateur
        socket.broadcast.to(user.room).emit('message', messageGenerator('Admin', `${user.username} has Joined :)`))

        // Envoi des utilisateurs de la room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    // Affichage du "est en train d'écrire..."
    socket.on('typing', (data) => {

        if (data.typing == true)
            io.emit('display', data)
        else
            io.emit('display', data)
    })

    // Filtrage des messages
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Merci de rester poli!')
        }

        const user = getUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', messageGenerator(user.username, message))
            callback('Envoyé!')
        }
    })

    // Déconnexion d'un utilisateur
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', messageGenerator('Admin', `${user.username} has left :(`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            io.emit('userList', getAllUsers());
        }

    })
})
io.on('disconnect', (socket) =>{
    socket.emit('userList', getAllUsers());
})

server.listen(port, () => {
    console.log("Successfully running on Port " + port)
})