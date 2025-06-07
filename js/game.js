class Game {
    constructor () {
        // Sprites
        this.arrow = null
        this.enemies = []
        this.projectiles = []
        this.circle = null

        // Elements
        this.map = document.getElementById("map")
        
        this.pauseButton = document.getElementById("pause-button")
        this.pauseIcon = document.getElementById("pause-icon")
        this.homeButton = document.getElementById("home-button")

        this.home = document.getElementById("home")
        this.playButton = document.getElementById("play-button")
        this.resumeButton = document.getElementById("resume-button")
        this.rules = document.getElementById("rules")
        this.rulesButton = document.getElementById("rules-button")

        this.backButton = document.getElementById("back-button")
        this.score = document.getElementById("score")
        this.highScore = document.getElementById("high-score")
        this.veil = document.getElementById("veil")

        // State
        this.arrowCanShoot = true
        this.paused = false
        this.autoShoot = false
        this.gameOver = false

        // Data
        this.keysDown = []
        this.wave = 0
        this.noClick = [this.pauseButton, this.homeButton]

        // Event listeners

        // Key down
        this.keyDownListener = ["keydown", event => {
            if (event.keyCode in KEY_TO_NAME) {
                event.preventDefault()
                // Only add key if not already in list of keys down
                if (!this.keysDown.includes(KEY_TO_NAME[event.keyCode])) {
                    this.keysDown.push(KEY_TO_NAME[event.keyCode])
                    this.arrow.keysDown = this.keysDown
                }
                if (KEY_TO_NAME[event.keyCode] === "space") {
                    this.arrowShoot()
                }
            }
        }]

        // Key up
        this.keyUpListener = ["keyup", event => {
            if (event.keyCode in KEY_TO_NAME) {
                const index = this.keysDown.indexOf(KEY_TO_NAME[event.keyCode])
                if (index > -1) {
                    this.keysDown.splice(index, 1)
                    this.arrow.keysDown = this.keysDown
                }
            } else if (event.keyCode === 67 && !event.shiftKey && !event.ctrlKey) {
                this.autoShoot = !this.autoShoot
            }
        }]

        // Prevent context menu from opening over map
        this.contextMenuListener = ["contextmenu", event => {
            event.preventDefault()
        }]

        // Mouse down
        this.mouseDownListener = ["mousedown", event => {
            console.log(event.target)
            if (!this.keysDown.includes("space") && !this.noClick.includes(event.target)) {
                this.keysDown.push("space")
                this.arrow.keysDown = this.keysDown
            }
        }]

        // Mouse up
        this.mouseUpListener = ["mouseup", () => {
            const index = this.keysDown.indexOf("space")
            if (index > -1) {
                this.keysDown.splice(index, 1)
                this.arrow.keysDown = this.keysDown
            }
        }]

        // Pause / play game
        this.pauseButton.addEventListener("click", () => this.pause())
        
        document.addEventListener("keyup", event => {
            console.log(event.keyCode)
            // P key pressed
            if (event.keyCode === 80) {
                this.pause()
            }
            // H key pressed
            if (event.keyCode === 72) {
                this.homeToggle()
            }
        })

        // Start game
        this.playButton.addEventListener("click", () => {
            this.start()
            this.home.style.display = "none"
        })

        // Toggle home page
        this.homeButton.addEventListener("click", () => this.homeToggle())
        this.resumeButton.addEventListener("click", () => this.homeToggle())

        // Open rules page
        this.rulesButton.addEventListener("click", () => {
            this.home.style.display = "none"
            this.rules.style.display = "flex"
            this.backButton.style.display = "flex"
        })

        // Hide rules page and open home page
        this.backButton.addEventListener("click", () => {
            this.home.style.display = "flex"
            this.rules.style.display = "none"
            this.backButton.style.display = "none"
        })
 
        // Initial
        this.disableButtons()
        this.updateScore()
    }

    start() {
        // Clear map
        this.map.textContent = ""
        
        // Reset sprites
        this.arrow = new Arrow()
        this.enemies = []
        this.projectiles = []
        this.circle = new Circle()

        // Reset data / state
        this.wave = 0
        this.paused = false
        this.gameOver = false

        // Initial
        this.addListeners()
        this.enableButtons()
        this.updateScore()

        this.resumeButton.style.display = "flex"
        this.veil.style.display = "none"
        this.playButton.innerText = "Restart"

        this.frame = () => {
            // Game over
            if (this.circle.health === 0 && !this.gameOver) {
                this.end()
            }

            // Arrow
            this.updateArrowPosition()
            this.arrow.draw()

            if ((this.keysDown.includes("space") || this.autoShoot) && this.arrowCanShoot) {
                this.arrowShoot()
            }

            // Delete projectiles
            const deletedProjectiles = []
            for (let i = 0; i < this.projectiles.length; i++) {
                if (this.projectiles[i].shouldDelete) {
                    // Add index of projectile to be deleted to list
                    deletedProjectiles.push(i)
                } else {
                    this.projectiles[i].draw()
                }
            }
            // Projectiles to be deleted
            if (deletedProjectiles.length) {
                // Sort indexes in decreasing order
                deletedProjectiles.sort((a, b) => b - a)
                for (const index of deletedProjectiles) {
                    this.projectiles.splice(index, 1)
                }
            }

            // Delete enemies
            const deletedEnemies = []
            for (let i = 0; i < this.enemies.length; i++) {
                if (this.enemies[i].shouldDelete) {
                    // Add index of enemy to be deleted to list
                    deletedEnemies.push(i)
                }
            }
            // Enemies to be deleted
            if (deletedEnemies.length) {
                // Sort indexes in increasing order
                deletedEnemies.sort((a, b) => b - a)
                for (const index of deletedEnemies) {
                    this.enemies.splice(index, 1)
                }
            }

            // Check for collision between projectile and another sprite
            for (let i = 0; i < this.projectiles.length; i++) {
                // Projectile fired by enemy hits circle
                if (distance(this.projectiles[i].position, this.circle.position) < 50 && this.projectiles[i].shotBy === "enemy") {
                    this.circle.isHit(this.projectiles[i].power)
                    this.projectiles[i].shouldDelete = true
                    this.projectiles[i].element.remove()
                }
                // Projectile fired by enemy hits arrow
                if (distance(this.projectiles[i].position, this.arrow.position) < this.arrow.size && this.projectiles[i].shotBy === "enemy" && this.arrow.alive) {
                    this.arrow.isHit(this.projectiles[i].power)
                    this.projectiles[i].shouldDelete = true
                    this.projectiles[i].element.remove()
                }

                for (let j = 0; j < this.enemies.length; j++) {
                    // Projectule fired by arrow hits enemy
                    if (distance(this.projectiles[i].position, this.enemies[j].position) < this.enemies[j].size && this.projectiles[i].shotBy === "arrow") {
                        this.enemies[j].isHit(this.projectiles[i].power)
                        this.projectiles[i].shouldDelete = true
                        this.projectiles[i].element.remove()
                    }
                }
            }

            // Enemies
            for (let i = 0; i < this.enemies.length; i++) {
                this.drawEnemy(this.enemies[i])
            }

            // Next wave
            if (this.enemies.length === 0) {
                // Increment number of enemies in wave by 1
                this.wave++
                for (let w = 0; w < this.wave; w++) {
                    this.enemies.push(new Enemy())
                }
            }

            // Next frame
            if (!this.paused) {
                this.loop = requestAnimationFrame(this.frame)
            }
        }

        // First frame
        this.loop = requestAnimationFrame(this.frame)
    }

    end() {
        // Fade out game, disable buttons
        this.gameOver = true
        this.map.style.transitionDuration = "1s"
        this.map.style.opacity = "0"
        this.playButton.innerText = "Play"
        this.resumeButton.style.display = "none"
        this.disableButtons()

        setTimeout(() => {
            // End game, open home page, display score
            this.paused = true
            cancelAnimationFrame(this.loop)
            this.removeListeners()

            this.map.textContent = ""
            this.map.style.transitionDuration = "0s"
            this.map.style.opacity = "1"

            this.home.style.display = "flex"
            this.updateScore(this.wave)
        }, 1100)      
    }

    pause() {
        if (this.paused) {
            // Play
            this.paused = false
            this.loop = requestAnimationFrame(this.frame)
            this.pauseIcon.className = "fas fa-pause"
            // Home or rules pages visible
            if (this.home.style.display === "flex" || this.rules.style.display === "flex") {
                this.home.style.display = "none"
                this.veil.style.display = "none"
                this.rules.style.display = "none"
                this.backButton.style.display = "none"
            } 
        } else {
            // Pause
            this.paused = true
            cancelAnimationFrame(this.loop)
            this.pauseIcon.className = "fas fa-play"
        }
    }

    homeToggle() {
        if (this.home.style.display === "flex") {
            // Close home page
            this.home.style.display = "none"
            this.veil.style.display = "none"
        } else {
            // Open home page, hide rules page
            this.home.style.display = "flex"
            this.veil.style.display = "flex"
            this.rules.style.display = "none"
            this.backButton.style.display = "none"
        }
        // Pause game
        this.paused = false
        this.pause()
    }

    arrowShoot() {
        if (this.arrowCanShoot && this.arrow.alive) {
            this.arrowCanShoot = false
            
            setTimeout(() => {
                this.arrowCanShoot = true
            }, this.arrow.shootInterval)

            this.projectiles.push(new Projectile({
                position: {
                    x: this.arrow.position.x,
                    y: this.arrow.position.y
                },
                direction: this.arrow.direction,
                power: this.arrow.power,
                shotBy: "arrow"
            }))
        }
    }

    updateArrowPosition() {
        // Currently, this function is not adding any functionality
        // But it gives the option to use data from other sprites
        // To determine the position of the arrow
        if (this.arrow.alive) {
            const pos = this.arrow.updatePosition()
            let can_update = true
            
            if (can_update) {
                this.arrow.position = pos
            }
        }
    }

    drawEnemy(enemy) {
        if (enemy.canMove) {
            // Enemy stops moving, can now shoot
            if (distance(enemy.position, this.circle.position) < HEIGHT / 2 + 200) {
                enemy.canMove = false
                enemy.canShoot = true
            }
            enemy.updatePosition()
        } else {
            // Determine enemy target: circle or arrow
            // Target is sprite that is closer
            if (this.arrow.alive) {    
                enemy.target = distance(enemy.position, this.circle.position) < distance(enemy.position, this.arrow.position) ? this.circle : this.arrow
            } else {
                enemy.target = this.circle
            }
            enemy.updateDirection()

            // Shoot
            if (enemy.canShoot) {
                enemy.canShoot = false
                setTimeout(() => {
                    enemy.canShoot = true
                }, enemy.shootInterval)

                this.projectiles.push(new Projectile({
                    position: {
                        x: enemy.position.x,
                        y: enemy.position.y
                    },
                    direction: enemy.direction,
                    power: enemy.power,
                    shotBy: "enemy"
                }))
            }
        }

        enemy.draw()
    }

    addListeners() {
        // Game listeners
        document.addEventListener(...this.keyDownListener)
        document.addEventListener(...this.keyUpListener)
        this.map.addEventListener(...this.contextMenuListener)
        document.addEventListener(...this.mouseDownListener)
        document.addEventListener(...this.mouseUpListener)
        // Arrow listeners
        this.arrow.addListeners()
    }

    removeListeners() {
        // Game listeners
        document.removeEventListener(...this.keyDownListener)
        document.removeEventListener(...this.keyUpListener)
        this.map.removeEventListener(...this.contextMenuListener)
        document.removeEventListener(...this.mouseDownListener)
        document.removeEventListener(...this.mouseUpListener)
        // Arrow listeners
        this.arrow.removeListeners()
    }

    disableButtons() {
        // Make buttons unclickable, reduce opacity
        this.pauseButton.style.pointerEvents = "none"
        this.homeButton.style.pointerEvents = "none"
        this.pauseButton.style.opacity = "0.5"
        this.homeButton.style.opacity = "0.5"
    }

    enableButtons() {
        // Make buttons clickable, full opacity
        this.pauseButton.style.pointerEvents = "all"
        this.homeButton.style.pointerEvents = "all"
        this.pauseButton.style.opacity = "1"
        this.homeButton.style.opacity = "1"
    }

    updateScore(score) {
        // JavaScript's localStorage API used to save high score
        // Persists even after page refreshes
        let highScore = +localStorage.getItem("high_score")
        if (isFinite(score) && isFinite(highScore) && score > highScore) {
            // Update high score
            localStorage.setItem("high_score", score + "")
            highScore = score
        }

        this.score.innerText = `Score: ${score || "-"}`
        this.highScore.innerText = `Best: ${highScore || "-"}`
    }
}