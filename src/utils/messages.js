const messageGenerator = (username, text, avatarUrl) => {
    return {
        username,
        text,
        avatarUrl,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    messageGenerator
}