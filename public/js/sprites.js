// Globals
const HEIGHT = 500
const WIDTH = 800

const KEY_TO_NAME = {
    32: "space",
    38: "up",
    87: "up",
    40: "down",
    83: "down",
    39: "right",
    68: "right",
    37: "left",
    65: "left"
}


class Arrow {
    constructor (name, color, initial_pos) {
        // Data
        this.position = initial_pos || {
            x: 0,
            y: 0
        }
        console.log(this.position)
        this.direction = 0

        this.speed = 180
        this.edgeOffset = 25
        this.image = "images/arrow.png"
        this.shootInterval = 200
        this.size = 40
        this.maxHealth = 100
        this.health = this.maxHealth
        this.power = 10
        this.name = name
        this.color = color

        this.mouse = {
            x: null,
            y: null,
        }
        this.keysDown = []

        // State 
        this.alive = true

        // Elements
        this.arrow = null
        this.arrowImage = null
        this.map = document.getElementById("map")
        this.nameLabel = null

        // Mouse position
        this.mouseMoveListener = ["mousemove", event => {
            this.mouse = {
                x: event.clientX,
                y: event.clientY
            }
        }]

        this.create()
        this.draw()
    }

    create() {
        // Arrow
        this.arrow = document.createElement("div")
        this.arrow.className = "sprite arrow"

        // Arrow image
        this.arrowImage = document.createElement("img")
        this.arrowImage.className = "sprite-image arrow-image"
        this.arrowImage.src = this.image
        this.arrowImage.draggable = false

        this.arrow.append(this.arrowImage)
        this.map.append(this.arrow)
        
        this.healthBar = new HealthBar(this.arrow)

        this.nameLabel = document.createElement("div")
        this.nameLabel.innerText = this.name
        this.nameLabel.style.color = this.color
        this.nameLabel.className = "name-label"
        this.arrow.append(this.nameLabel)
    }

    updateDirection() {
        // Change in X and Y directions between arrow sprite and mouse
        const x = this.mouse.x - (window.innerWidth / 2 + this.position.x)
        const y = this.mouse.y - (window.innerHeight / 2 - this.position.y)

        // Angle
        let angle = -radToDeg(Math.atan(y / x))
        if (x < 0) {
            angle += 180
        }
        if (angle < 0) {
            angle += 360
        }
        this.direction = angle 
    }

    draw() {
        if (this.alive) {
            // this.updateDirection(dt)
            this.arrow.style.left = `${WIDTH / 2 + this.position.x}px`
            this.arrow.style.top = `${HEIGHT / 2 - this.position.y}px`
            // CSS 'transform: rotate(...);' rotates clockwise instead of standard counterclockwise
            // Adjust by multiplying angle by -1
            this.arrowImage.style.transform = `translate(-50%, -50%) rotate(${-this.direction}deg)`
        }
    }

    isHit(power) {
        if (this.health > 0) {
            this.health -= power
            if (this.health < 0) {
                this.health = 0
            }

            this.healthBar.update(this.health / this.maxHealth * 100)

            if (this.health === 0) {
                // Hide arrow, reset health, change status to not alive
                this.arrow.style.opacity = "0"
                this.alive = false
                this.health = this.maxHealth
                this.healthBar.update(this.health / this.maxHealth * 100)
                this.position.x = WIDTH / 2 - this.size
                this.position.y = (HEIGHT / 2 - this.size) * [1, -1][Math.floor
                (randomNumber(0, 2))]
                setTimeout(() => {
                    // Reveal arrow and change status to alive
                    this.alive = true
                    this.arrow.style.opacity = "1"  
                }, 4000)
            }
        }
    }

    addListeners() {
        document.addEventListener(...this.mouseMoveListener)
    }

    removeListeners() {
        document.removeEventListener(...this.mouseMoveListener)
    }
}


class Projectile {
    constructor (params) {
        // Data
        this.position = params.position
        this.direction = params.direction

        this.speed = params.speed || 300 // Pixels per second
        this.edgeOffset = 10
        this.image = params.image || "images/ball.svg"
        this.size = 10
        this.power = params.power || 10
        this.shotBy = params.shotBy

        // State
        this.shouldDelete = false

        // Elements
        this.element = null
        this.map = document.getElementById("map")

        this.create()
    }

    create() {
        // Projectile element
        const element = document.createElement("img")
        const id = generateId() 
        element.id = `projectile-${id}`
        element.className = "sprite"
        element.src = this.image
        element.draggable = false

        this.map.append(element)
        this.element = document.getElementById(`projectile-${id}`)

        // Initial styles
        this.element.style.transform = `translate(-50%, -50%) rotate(${-this.direction}deg)`
        this.element.style.width = `${this.size}px`
    }

    updatePosition(dt) {
        this.position.x += this.speed * dt * Math.cos(degToRad(this.direction))
        this.position.y += this.speed * dt * Math.sin(degToRad(this.direction))

        // Projectile off the map
        if (
            this.position.x > WIDTH / 2 - this.edgeOffset ||
            this.position.x < -WIDTH / 2 + this.edgeOffset ||
            this.position.y > HEIGHT / 2 - this.edgeOffset ||
            this.position.y < -HEIGHT / 2 + this.edgeOffset
        ) {
            this.shouldDelete = true
            this.element.remove()
        }
    }

    draw(dt) {
        this.updatePosition(dt)
        this.element.style.left = `${WIDTH / 2 + this.position.x}px`
        this.element.style.top = `${HEIGHT / 2 - this.position.y}px`
    }
}

class Circle {
    constructor () {
        // Data
        this.position = {
            x: 320,
            y: 0
        }

        this.maxHealth = 500
        this.health = this.maxHealth
        this.image = "images/circle.svg"
        
        // Elements
        this.circle = null
        this.map = document.getElementById("map")
        
        this.create()

        this.circle.style.left = `${WIDTH / 2 + this.position.x}px`
        this.circle.style.top = `${HEIGHT / 2 - this.position.y}px`
    }

    create() {
        // Circle
        const circle = document.createElement("div")
        circle.className = "sprite"
        circle.id = "circle"

        // Circle image
        const circleImage = document.createElement("img")
        circleImage.id = "circle-image"
        circleImage.className = "sprite-image"
        circleImage.src = this.image
        circleImage.draggable = false

        circle.append(circleImage)
        this.map.append(circle)
        this.circle = document.getElementById("circle")
        this.circleImage = document.getElementById("circle-image")
        
        this.healthBar = new HealthBar(this.circle)
    }

    isHit(power) {
        if (this.health > 0) {
            this.health -= power
            if (this.health < 0) {
                this.health = 0
            }

            this.healthBar.update(this.health / this.maxHealth * 100)

            if (this.health === 0) {
                this.circle.style.opacity = "0"
            }
        }
    }
}

class HealthBar {
    constructor (sprite) {
        // Sprite
        this.sprite = sprite

        // Color
        this.colors = {
            green: [0, 255, 0],
            yellow: [255, 230, 0],
            red: [255, 0, 0]
        }
        this.color = this.colors.green

        // Elements
        this.container = null
        this.bar = null

        this.create()
        this.update(100)
    }

    create() {
        // Container
        const container = document.createElement("div")
        const id = generateId()
        container.id = `health-bar-container-${id}`
        container.className = "health-bar-container"

        // Bar
        const bar = document.createElement("div")
        bar.id = `health-bar-${id}`
        bar.className = "health-bar"

        container.append(bar)
        this.sprite.append(container)
        this.container = document.getElementById(`health-bar-container-${id}`)
        this.bar = document.getElementById(`health-bar-${id}`)
    }

    update(percent) {
        // Use percent to determine the color value
        // Either green, yellow, red, or any intermediate colors
        // Calculated with vector math
        // As RGB colors are 3D vectors
        if (percent > 50 && percent <= 100) {
            // Initial: 50 < n <= 100
            // Scaled:  1  > n >= 0
            const scale = 1 - (percent - 50) / 50
            // Subtract yellow from green vector
            const difference = vector_subtract(this.colors.yellow, this.colors.green)
            // Add green vector to scalar product of difference vector and scale
            this.color = vector_add(this.colors.green, vector_scalar_product(difference, scale))
        } else if (percent > 10 && percent <= 50) {
            // Initial: 10 < n <= 50
            // Scaled:  1  > n >= 0
            const scale = 1 - (percent - 10) / 40
            // Subtract yellow from red vector
            const difference = vector_subtract(this.colors.red, this.colors.yellow)
            // Add yellow vector to scalar product of difference vector and scale
            this.color = vector_add(this.colors.yellow, vector_scalar_product(difference, scale))
        } else if (percent >= 0 && percent <= 10) {
            this.color = this.colors.red
        }

        this.bar.style.backgroundColor = `rgb(${this.color.join(",")})`
        this.bar.style.width = `${percent}%`
    }

}

class Enemy {
    constructor () {
        // Data
        this.position = {
            x: 0,
            y: 0
        }
        this.direction = 0
        this.target = null

        this.speed = 70
        this.edgeOffset = 50
        this.image = "images/enemy.png"
        this.shootInterval = 2000 + Math.round(randomNumber(-500, 500))
        this.size = 40
        this.radius = 50
        this.maxHealth = 100
        this.health = this.maxHealth
        this.power = 10

        // State
        this.canMove = true
        this.canShoot = false
        this.shouldDelete = false

        // Elements
        this.enemy = null
        this.enemyImage = null
        this.map = document.getElementById("map")

        // Initial position
        this.position.x = -WIDTH / 2
        this.position.y = randomNumber(-HEIGHT / 2 + this.edgeOffset, HEIGHT / 2 - this.edgeOffset)

        this.create()
        this.draw()
    }

    create() {
        // Enemy
        const enemy = document.createElement("div")
        const id = generateId()
        enemy.id = `enemy-${id}`
        enemy.className = "sprite enemy"

        // Enemy image
        const enemyImage = document.createElement("img")
        enemyImage.id = `enemy-image-${id}`
        enemyImage.className = "sprite-image enemy-image"
        enemyImage.src = this.image
        enemyImage.draggable = false

        enemy.append(enemyImage)
        this.map.append(enemy)
        this.enemy = document.getElementById(`enemy-${id}`)
        this.enemyImage = document.getElementById(`enemy-image-${id}`)
        
        this.healthBar = new HealthBar(this.enemy)
    }

    updateDirection() {
        // Change in X and Y directions from enemy to target (either arrow or circle)
        const x = this.target.position.x - this.position.x
        const y = this.target.position.y - this.position.y

        let angle = radToDeg(Math.atan(y / x))
        if (x < 0) {
            angle += 180
        }
        if (angle < 0) {
            angle += 360
        }
        this.direction = angle 
    }

    updatePosition(dt) {
        this.position.x += this.speed * dt * Math.cos(degToRad(this.direction))
        this.position.y += this.speed * dt * Math.sin(degToRad(this.direction))
    }

    draw() {
        this.enemy.style.left = `${WIDTH / 2 + this.position.x}px`
        this.enemy.style.top = `${HEIGHT / 2 - this.position.y}px`
        this.enemyImage.style.transform = `translate(-50%, -50%) rotate(${-this.direction - 90}deg)`
    }

    isHit(power) {
        if (this.health > 0) {
            this.health -= power
            if (this.health < 0) {
                this.health = 0
            }

            this.healthBar.update(this.health / this.maxHealth * 100)

            if (this.health === 0) {
                this.enemy.style.opacity = "0"
                this.canShoot = false
                this.shouldDelete = true
                setTimeout(() => {
                    // Remove element from DOM
                    this.enemy.remove()
                }, 300)
            }
        }
    }
}

