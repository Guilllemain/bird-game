const canvas = document.querySelector('#bird')
const context = canvas.getContext('2d')

const DEGREE = Math.PI/180

let frames = 0
let score = {
    best: 0,
    value: 0,
    draw: function() {
         context.fillStyle = '#FFF'
         context.strokeStyle = '#000'

         if (state.current === state.game) {
             context.lineWidth = 2
             context.font = '35px Teko' 
             context.fillText(this.value, canvas.width / 2, 50)
             context.strokeText(this.value, canvas.width / 2, 50)
         } else if (state.current === state.over) {
             context.font = '25px Teko'
             context.fillText(this.value, 225, 186)
             context.strokeText(this.value, 225, 186)
             context.fillText(this.best, 225, 228)
             context.strokeText(this.best, 225, 228)
         }
    }
}

const sprite = new Image();
sprite.src = 'img/sprite.png'

// GAME STATE
const state = {
    current: 0 ,
    ready: 0,
    game: 1,
    over: 2
}

// CONTROL THE GAME
canvas.addEventListener('click', event => {
    switch (state.current) {
        case state.ready:
            state.current = state.game
            break
        case state.game:
            bird.flap()
            break
        case state.over:
            state.current = state.ready 
            break
    }
})

// BACKGROUND
const bg = {
    sX: 0,
    sY: 0,
    w:  275,
    h: 226,
    x: 0,
    y: canvas.height - 226,
    draw: function() {
        context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    }
}

// FOREGROUND
const fg = {
    sX: 276,
    sY: 0,
    w:  224,
    h: 112,
    x: 0,
    y: canvas.height - 112,

    dx: 2,

    draw: function() {
        context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    },

    update: function() {
        if (state.current === state.game) {
            this.x = (this.x - this.dx) % this.w / 2
            this.dx += 2
        }
    }
}

// BIRD
const bird = {
    animation: [
        { sX: 276, sY: 112},
        { sX: 276, sY: 139},
        { sX: 276, sY: 164},
        { sX: 276, sY: 139},
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,
    radius: 12, 

    frame: 0,

    rotation: 0,
    speed: 0,
    gravity: 0.25,
    jump: 4.6,

    draw: function() {
        let bird = this.animation[this.frame]
        context.save()
        context.translate(this.x, this.y)
        context.rotate(this.rotation)
        context.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w / 2, -this.h / 2 , this.w, this.h)
        context.restore()
    },

    flap: function() {
        this.speed = - this.jump
    },

    update: function() {
        // FLAPPING SPEED OF THE BIRD DEPENDING OF THE STATE
        this.period = state.current === state.ready ? 10 : 5
        this.frame += frames % this.period === 0 ? 1 : 0
 
        // THE FRAME WILL ALWAYS BE BETWEEN 0 AND 3
        this.frame = this.frame % this.animation.length

        if (state.current === state.ready) {
            this.y = 150
            this.speed = 0
            this.rotation = 0 * DEGREE
        } else {
            this.speed += this.gravity
            this.y += this.speed

            if (this.y + this.h / 2 >= fg.y) {
                this.y = fg.y - this.h / 2
                if (state.current === state.game) state.current = state.over
            }

            if (this.speed >= this.jump) {
                this.rotation = 90 * DEGREE
                this.frame = 1
            } else {
                this.rotation = - 25 * DEGREE
            }
        }
    }
}

const pipes = {
    bottom: {
        sX: 502,
        sY: 0
    },
    top: {
        sX: 553,
        sY: 0
    },
    w: 53,
    h: 400,
    gap: 85,
    dx: 2,

    positions: [],
    maxYPos: -150,

    draw: function() {
        console.log(this.positions)
        for (let i = 0; i < this.positions.length; i++) {
            let p = this.positions[i]
            let topYPos = p.y
            let bottomYPos = p.y + this.h + this.gap
            context.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h)
            context.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos , this.w, this.h)
        }
    },

    update: function () {
        if (state.current !== state.game) return 
        if (frames % 100 === 0) {
            this.positions.push({
                x: canvas.width,
                y: this.maxYPos * (Math.random() + 1)
            })
        }
        for (let i = 0; i < this.positions.length; i++) {
            let p = this.positions[i]
            p.x -= this.dx
            if (p.x + this.w <= 0) {
                this.positions.shift()
                score.value++
            }
            let bottomPipeY = p.y + this.gap + this.h

            if (bird.x + bird.radius > p.x && 
                bird.x - bird.radius < p.x + this.w && 
                bird.y + bird.radius > p.y && 
                bird.y - bird.radius < p.y + this.h) {
                    state.current = state.over 
                }
            if (bird.x + bird.radius > p.x &&
                bird.x - bird.radius < p.x + this.w &&
                bird.y + bird.radius > bottomPipeY  &&
                bird.y - bird.radius < bottomPipeY  + this.h) {
                state.current = state.over
            }
        }
        
    }
}

// GET READY MESSAGE 
const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: canvas.width / 2 - 173 / 2,
    y: 80,

    draw: function() {
        if (state.current !== state.ready) return
        context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)         
    }
}

// GAME OVER MESSAGE 
const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: canvas.width / 2 - 225 / 2,
    y: 90,

    draw: function() {
        if (state.current !== state.over) return
        context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)         
    }
}

const draw = () => {
    context.fillStyle = '#70c5ce'
    context.fillRect(0, 0, canvas.clientWidth, canvas.height)
    bg.draw()
    pipes.draw()
    fg.draw()
    bird.draw()
    getReady.draw()
    gameOver.draw()
    score.draw()
}

const update = () => {
    bird.update()
    fg.update()
    pipes.update()
}

const loop = () => {
    update()
    draw()
    frames++
    requestAnimationFrame(loop)
}

loop()