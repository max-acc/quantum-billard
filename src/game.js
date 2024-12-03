// Billiard Game Logic

// Canvas and Context
const canvas = document.getElementById("billiardTable");
const ctx = canvas.getContext("2d");

// Table Dimensions
const tableWidth = canvas.width;
const tableHeight = canvas.height;
const centerHeight = tableHeight / 2;

// Ball Parameters
const ballRadius = 10;
const balls = [
    { x: 100, y: centerHeight, dx: 0, dy: 0, color: "white" },
    { x: 150, y: 220, dx: 0, dy: 0, color: "black" },
    { x: 160, y: 240, dx: 0, dy: 0, color: "green" },
    { x: 190, y: 290, dx: 0, dy: 0, color: "orange" },
    { x: 200, y: 320, dx: 0, dy: 0, color: "lime" },
    { x: 250, y: 200, dx: 0, dy: 0, color: "red" },
    { x: 300, y: 150, dx: 0, dy: 0, color: "blue" },
    { x: 500, y: 250, dx: 0, dy: 0, color: "yellow" },
];

// Pocket Positions
const pockets = [
    { x: 0, y: 0 }, { x: tableWidth / 2, y: 0 }, { x: tableWidth, y: 0 },
    { x: 0, y: tableHeight }, { x: tableWidth / 2, y: tableHeight }, { x: tableWidth, y: tableHeight }
];

// Draw the Table
function drawTable() {
    ctx.fillStyle = "#228B22"; // Green surface
    ctx.fillRect(0, 0, tableWidth, tableHeight);

    // Draw Pockets
    ctx.fillStyle = "black";
    pockets.forEach(pocket => {
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, 15, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw the Balls
function drawBalls() {
    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
    });
}

// Move the Balls
// Helper function to check for collision between two balls
function checkCollision(ball1, ball2) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.hypot(dx, dy);

    return distance < ballRadius * 2; // Collision occurs when the distance is less than 2 radii
}

// Helper function to resolve ball collisions
function resolveCollision(ball1, ball2) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.hypot(dx, dy);

    // Prevent overlap by repositioning balls
    const overlap = ballRadius * 2 - distance;
    const adjustX = (overlap * dx) / distance;
    const adjustY = (overlap * dy) / distance;

    ball1.x -= adjustX / 2;
    ball1.y -= adjustY / 2;
    ball2.x += adjustX / 2;
    ball2.y += adjustY / 2;

    // Normalize the collision vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity in the direction of the collision vector
    const relativeVelocityX = ball2.dx - ball1.dx;
    const relativeVelocityY = ball2.dy - ball1.dy;
    const dotProduct = relativeVelocityX * nx + relativeVelocityY * ny;

    // Skip if balls are moving apart
    if (dotProduct > 0) return;

    // Conservation of momentum for 1D elastic collision
    // instead of *1 it was dotProduct
    const collisionScale = 2 * 1 / (1 + 1); // Assuming equal mass for both balls
    const impulseX = collisionScale * nx;
    const impulseY = collisionScale * ny;

    // Update velocities
    ball1.dx -= impulseX;
    ball1.dy -= impulseY;
    ball2.dx += impulseX;
    ball2.dy += impulseY;
}

function getBallAbsolutePosition() {
    ball = balls[0];
    const rect = canvas.getBoundingClientRect(); // Canvas position relative to the page
    const absoluteX = rect.left + ball.x + ballRadius / 2; // Add ball.x to canvas's left offset
    const absoluteY = rect.top + ball.y + ballRadius / 2;  // Add ball.y to canvas's top offset
    return { x: absoluteX, y: absoluteY };
}

const friction = Math.sqrt(0.99);
// Modify the moveBalls function to include collision detection
function moveBalls() {
    // Check and update positions of all balls
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];

        // Apply friction to velocity
        ball.dx *= friction;
        ball.dy *= friction;

        //ball.dx = Math.sqrt(ball.dx * friction);
        //ball.dy = Math.sqrt(ball.dy * friction);

        // Stop the ball completely if velocity is very small
        if (Math.abs(ball.dx) < 0.1) ball.dx = 0;
        if (Math.abs(ball.dy) < 0.1) ball.dy = 0;

        ball.x += ball.dx;
        ball.y += ball.dy;

        // Collision with table boundaries
        if (ball.x - ballRadius < 0 || ball.x + ballRadius > tableWidth) {
            ball.dx = -ball.dx;
        }
        if (ball.y - ballRadius < 0 || ball.y + ballRadius > tableHeight) {
            ball.dy = -ball.dy;
        }

        // Check for pocket collisions
        pockets.forEach(pocket => {
            const distance = Math.hypot(pocket.x - ball.x, pocket.y - ball.y);
            if (distance < 15) {
                console.log(`Ball pocketed: ${ball.color}`);
                balls.splice(i, 1); // Remove the ball from the game
            }
        });
    }

    // Ball-to-ball collision detection
    for (let i = 0; i < balls.length; i++) {
        for (let j = 0; j < balls.length; j++) {
            if (i == j) {
                continue;
            }
            if (checkCollision(balls[i], balls[j])) {
                resolveCollision(balls[i], balls[j]);
            }
        }
    }
}

function areBallsNotMoving() {
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        if (ball.dx != 0 || ball.dy != 0) {
            return false;
        }
    }
    return true;
}

function mouse_position() {
    var mousePosX = 0;
    var mousePosY = 0;

    mouseClickX = 0;
    mouseClickY = 0;

    triangle = document.getElementById('triangle');
    
    

    // Move ball position to center of ball /currently at top left
    absBallPos = getBallAbsolutePosition();
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`Ball Absolute Position: (${Math.round(absBallPos.x)}, ${Math.round(absBallPos.y)})`, 10, 20);

    document.addEventListener('mousemove', (event) => {//
        mousePosX = event.clientX;
        mousePosY = event.clientY;
        console.log(`Cursor position: X=${mousePosX}, Y=${mousePosY}`);
        //console.log((mousePosY - absBallPos.y) / (MousePosX - absBallPos.x));//

        deltaX = mousePosX - absBallPos.x;
        deltaY = mousePosY - absBallPos.y;
        

        scaleValue = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2), 2) * 0.5;
        triangle.style.visibility = "visible";
        triangle.style.borderBottom = `${scaleValue}px solid white`;
        triangle.style.top = (((absBallPos.y + mousePosY) / 2 - 1 * deltaY)) + "px";
        triangle.style.left = ((absBallPos.x + mousePosX) / 2 - 1 * deltaX) + "px";

        /*
        
        radian = Math.atan((absBallPos.y - mousePosY) / (mousePosX - absBallPos.x)) + Math.PI / 2;

        console.log(radian);
        if (absBallPos.x > mousePosX) {
            radian = Math.Pi + radian;
            triangle.style.transform = "rotate(-" + radian + "rad)";
        } else {
            triangle.style.transform = "rotate(" + radian + "rad)";
        }*/
        deltaX = mousePosX - absBallPos.x;
        deltaY = mousePosY - absBallPos.y;
        const radian = Math.atan2(deltaY, deltaX) + Math.PI / 2 + Math.PI; // Angle pointing to cursor

        triangle.style.transform = `rotate(${radian}rad)`;
        
    });

    //triangle.style.left = absBallPos.x + "px";
    //triangle.style.top = absBallPos.y + "px";


    document.addEventListener('click', (event) => {
        // Get the position of the click
        mouseClickX = event.clientX;
        mouseClickY = event.clientY;
    
        console.log(`Cursor clicked at: X=${mouseClickX}, Y=${mouseClickY}`);

        triangle.style.visibility = "hidden";

        const ball = balls[0];

        ball.dx = -((mouseClickX - absBallPos.x) / 10);
        ball.dy = -((mouseClickY - absBallPos.y) / 10);

        if (ball.dx > 15) {
            ball.dx = 15;
        }
        if (ball.dy > 15) {
            ball.dy = 15;
        }

        if (mouseClickX < absBallPos.x) {
            //ball.dx *=  -1;
        } else {
        }
        if (mouseClickY < absBallPos.y) {
            //ball.dx *=  -1;
        } else {

        }
        
    });

    


    
    

    /*
    scaleValue = Math.abs(absBallPos.x - mousePosX) / 1000;
    triangle.style.setProperty('--scale-factor', scaleValue);
    triangle.classList.add('scaled'); // Apply the scaling class
    */

}



// Game Loop
function gameLoop() {
    drawTable();
    drawBalls();
    moveBalls();
    requestAnimationFrame(gameLoop);
    if (areBallsNotMoving()) {
        mouse_position();

    }
    

    
}

// Start the Game
gameLoop();
