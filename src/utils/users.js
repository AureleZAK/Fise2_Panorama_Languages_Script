const users = []

// addUser , removeUser , getUser , getUsersInRoom

// Ajout d'un utilisateur
const addUser = ({ id, username, room, avatarUrl = 'img/avatar.jpg' }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    avatarUrl = avatarUrl.trim().toLowerCase()
    if (!username || !room) {
        return {
            error: "Username and Room should be provided!"
        }
    }
    // Vérification d'un utilisateur déjà existant
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: "Username is already in use!"
        }
    }

    // Stockage des users
    const user = { id, username, room, avatarUrl }
    users.push(user)
    return { user }
}

// Suppression d'un utilisateur
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

// Récupération d'un utilisateur
const getUser = (id) => {
    return users.find(user => user.id === id)
}

// Récupération des utilisateurs d'une room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter(user => user.room === room)
}

const getAllUsers = () =>
{
    return users;
}

const getUserByUsername = (username) => {
    username = username.trim().toLowerCase();
    return users.find(user => user.username === username);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getAllUsers,
    getUserByUsername 
}