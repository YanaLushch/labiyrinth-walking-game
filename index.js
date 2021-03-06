const {Engine, Render, Runner, Composites, Events, World, Bodies, Body} = Matter;


const engine = Engine.create();
const {world} = engine;

const cells = 15;
const width = 600;
const height = 600;

const unitLength = width / cells;

const shuffle = (arr) => {
    let counter = arr.length;
    while(counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;

        const temporary = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temporary;
    }
    return arr;
}

    // create renderer
    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width,
            height,
        }
    });

    Render.run(render);

    // create runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    const walls = [
        Bodies.rectangle(width/ 2, 0, width, 2, {isStatic: true}),
        Bodies.rectangle(width / 2, height, width, 2, {isStatic: true}),
        Bodies.rectangle(0, height / 2, 2, height, {isStatic: true}),
        Bodies.rectangle(width, height / 2, 2, height, {isStatic: true})
    ]

World.add(world, walls)

const grid = Array(cells)
            .fill(null)
            .map(() => Array(cells).fill(false));

const verticals = Array(cells)
            .fill(null)
            .map(() => Array(cells - 1).fill(false));
const horizontals = Array(cells - 1)
            .fill(null)
            .map(() => Array(cells).fill(false));


const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {
    //if i have visited the cell at [row, column], then return
    if( grid[row][column]){
        return;
    }
    //Mark this cell as been visited(true)
    grid[row][column] = true;
    //Assemble randomly oredered list of neighbors
    let neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ])
    //for each neighbor
    for (let neighbor of neighbors) {
        //check and see if the neighbor is out of bounds
        const [nextRow, nextColumn, direction] = neighbor;
        if(nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells){
            continue;
        }
        //if we have visited that neighbor, continue to next neighbor
        if ( grid[nextRow][nextColumn]){
            continue;
        }
        //remove the border between neighbor we will be visiting
        if(direction === 'left'){
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if ( direction === 'up'){
            horizontals[row - 1][column] = true;
        } else if ( direction === 'down'){
            horizontals[row][column] = true;
        }

        stepThroughCell(nextRow, nextColumn);
    }    
}
stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open){
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength / 2,
            rowIndex * unitLength + unitLength,
            unitLength,
            5, 
            {
                isStatic: true
            }
        );
        World.add(world, wall)
    })
})
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open){
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength,
            rowIndex * unitLength + unitLength / 2,
            5, 
            unitLength,
            {
                isStatic: true
            }
        );
        World.add(world, wall);
    })
})

const goal = Bodies.rectangle(
    width - unitLength / 2,
    height - unitLength / 2,
    unitLength * .7, 
    unitLength * .7,
    {
        isStatic: true
    }
);
World.add(world, goal)

const ball = Bodies.circle(unitLength / 2, unitLength / 2, unitLength / 3);
World.add(world, ball);

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;
    if ( event.code === 'KeyW' || event.code === 'ArrowUp'){
        Body.setVelocity(ball, {x, y: y - 5})
    } else if (event.code === 'KeyA'|| event.code === 'ArrowLeft'){
        Body.setVelocity(ball, {x: x - 5, y})
    } else if (event.code === 'KeyD' || event.code === 'ArrowRight'){
        Body.setVelocity(ball, {x: x + 5, y})
    } else if (event.code === 'KeyS'|| event.code === 'ArrowDown'){
        Body.setVelocity(ball, {x, y: y + 5})
    }
})

