// Convert angle from radians to degrees
function radToDeg(angle) {
    return angle * 180 / Math.PI
}

// Convert angle from degrees to radians
function degToRad(angle) {
    return angle * Math.PI / 180
}

// Generate random ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Distance between 2 points
function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

// Add 2 vectors
function vector_add(v1, v2) {
    v = []
    for (let i = 0; i < v1.length; i++) {
        v[i] = v1[i] + v2[i]
    }
    return v
}

// Subtract 2 vectors
function vector_subtract(v1, v2) {
    v = []
    for (let i = 0; i < v1.length; i++) {
        v[i] = v1[i] - v2[i]
    }
    return v
}

// Multiply a vector by a scalar
function vector_scalar_product(v, s) {
   return v.map(n => n * s)
}

// Generate random number within range
function randomNumber(min = 0, max = 1) {
    return Math.random() * (max - min) + min
}