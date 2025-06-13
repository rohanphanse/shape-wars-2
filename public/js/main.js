document.addEventListener("DOMContentLoaded", () => {
    // Data
    let game_id = new URLSearchParams(window.location.search).get("g") || "none"
    let is_host = true
    let player_name = ""
    const welcomeMessage = document.getElementById("welcome-message")
    const enterName = document.getElementById("enter-name")
    // Invite elements
    const inviteLinkSection = document.getElementById("invite-link-section")
    const inviteLink = document.getElementById("invite-link")
    const copyInviteLink = document.getElementById("copy-invite-link")
    // Lobby elements
    const enterLobby = document.getElementById("enter-lobby")
    const lobby = document.getElementById("lobby")
    const lobbyText = document.getElementById("lobby-text")
    const startGame = document.getElementById("start-game")
    // Check if username is already taken
    function name_already_used(name) {
        for (const player of game.players) {
            if (name === player) {
                return true
            }
        }
        return false
    }
    // Initial
    if (game_id !== "none") {
        inviteLink.value = `${URL}/?g=${game_id}`
    }
    // Web sockets
    const socket = io(URL)
    let game = new Game(socket)
    socket.on("connect", () => {
        // Request information about game with `game_id`
        socket.emit("request_welcome", game_id)
        // Update to player list
        socket.on("players", (players, host_name, colors) => {
            lobby.innerHTML = ""
            if (players.length) {
                lobbyText.style.display = "flex"
            }
            game.players = players
            game.colors = colors
            for (let i = 0; i < players.length; i++) {
                // Create player icon
                const player = players[i]
                const avatar = document.createElement("div")
                avatar.classList.add("avatar")
                const avatarIcon = document.createElement("div")
                avatarIcon.classList.add("avatar-icon")
                avatarIcon.style.border = `4px solid ${colors[i]}`
                avatarIcon.innerText = player[0]
                const avatarText = document.createElement("div")
                avatarText.innerText = player === host_name ? `${player} (host)` : player
                avatarText.classList.add("avatar-text")
                avatar.append(avatarIcon)
                avatar.append(avatarText)
                lobby.append(avatar)
            }
        })
    })
    // Update to game host 
    socket.on("update_host", () => {
        inviteLink.value = `${URL}/?g=${game_id}`
        inviteLinkSection.style.display = "flex"
        welcomeMessage.innerText = `Welcome to game '${game_id}' hosted by ${player_name}!`
        startGame.style.display = "flex"
    })
    // Receive `game_id` of new game created
    socket.on("game_id", (_game_id) => {
        game_id = _game_id
        inviteLink.value = `${URL}/?g=${game_id}`
    })
    // Game has started
    socket.on("start_game", () => {
        socket.emit("window_size", { height: window.innerHeight, width: window.innerWidth })
        game.start()
        document.addEventListener("mousemove", (event) => {
            socket.emit("mouse_position", { x: event.clientX + 27, y: event.clientY })
        })
        window.addEventListener("resize", (event) => {
            socket.emit("window_size", { height: window.innerHeight, width: window.innerWidth })
        })
    })
    // Receive new frame to be rendered
    socket.on("frame", (frame) => {
        game.draw_frame(frame)
    })
    // Receive information about game being joined
    socket.on("welcome", (game_host) => {
        is_host = false
        gamemode_chosen = true
        welcomeMessage.innerText = `Welcome to game '${game_id}' hosted by ${game_host}!`
        enterLobby.innerText = "Join lobby"
    })
    // Copy invite link
    copyInviteLink.addEventListener("click", () => {
        inviteLink.select()
        document.execCommand("copy")
    })
    // Join game with given username
    enterLobby.addEventListener("click", () => {
        const name = enterName.value
        // Validate username
        if (name.length > 0 && name.length < 20 && !name_already_used(name) && !name.includes("(host)")) {
            const game_id = new URLSearchParams(window.location.search).get("g")
            if (is_host) {
            }
            socket.emit("join_game", name, game_id)
            enterLobby.style.display = "none"
            enterName.disabled = true
            // Locally save `lobby_id` and `name`
            sessionStorage.setItem("lobby_id", socket.id)
            sessionStorage.setItem("name", enterName.value)
            player_name = name
            if (is_host) { 
                inviteLinkSection.style.display = "flex"
                startGame.style.display = "flex"
            }
        } else {
            enterName.focus()
        }
    })
    // Host requests start of game
    startGame.addEventListener("click", () => {
        socket.emit("request_start_game")
    })
})