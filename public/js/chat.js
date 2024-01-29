const socket = io()
var user
var typing = false;
var timeout = undefined;

// Elements du message
const $messageForm = document.querySelector('#message-form')
const $messageInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

// Elements des templates
const renderMessage = document.querySelector('#render-message-template').innerHTML
const renderSiderbar = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room, avatarUrl } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// AutoScroll

const autoScroll = () => {
    // Récupération des nouveaux messages
    const $newElement = $messages.lastElementChild

    // Hauteur du nouveau message
    const newMessageStyle = getComputedStyle($newElement)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newElement.offsetHeight + newMessageMargin

    // Hauteur visible
    const visibleHeight = $messages.offsetHeight

    // Hauteur du container
    const containerHeight = $messages.scrollHeight
    // Lieux max du scroll
    const scrollOffSet = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffSet) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

// Affichage des messages
socket.on('message', (message) => {
    const html = Mustache.render(renderMessage, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

// Affichage des utilisateurs
socket.on('roomData', ({ room, users, avatarUrl }) => {
    const html = Mustache.render(renderSiderbar, {
        room,
        users,
        avatarUrl
    })

    document.querySelector('#sidebar').innerHTML = html
})

// Envoi du message
$messageForm.addEventListener('submit', (e) => {

    $messageFormButton.setAttribute('disabled', 'disabled')
    // Empêche le rafraichissement de la page
    let message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()
        if (error) {
            return console.log(error)
        }

        console.log("Your Message is Devlivered!")
    })
    e.preventDefault()
})

socket.emit('join', { username, room, avatarUrl }, (error) => {
    if (error) {
        alert(error)
    }
})

// Code pour "est en train d'écrire" et "a quitté la conversation"

$(document).ready(function () {
    $('#message-box-check').keypress((e) => {
        if (e.which != 13) {
            typing = true
            socket.emit('typing', { user: username, typing: true })
            clearTimeout(timeout)
            timeout = setTimeout(typingTimeout, 3000)
        } else {
            clearTimeout(timeout)
            typingTimeout()
        }
    })

    socket.on('display', (data) => {
        if (data.typing == true)
            $('.typing').text(`${data.user} is typing...`)
        else
            $('.typing').text("")
    })
})



function typingTimeout() {
    typing = false
    socket.emit('typing', { user: user, typing: false })
}