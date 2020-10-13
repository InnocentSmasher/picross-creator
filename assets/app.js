/* eslint-disable*/

const grid = document.querySelector('#grid .grid');
const clueGrid = document.querySelector('#clue-grid');
const small = document.querySelector('#small');
const generateBtn = document.querySelector('#generate');
const sizeObj = {
    "small": 25,
};

// add event listeners to all the squares
grid.addEventListener('click', function(e) {
    const square = e.target;
    square.classList.toggle('fill');
});

// build out the rules for solving the grid
generateBtn.addEventListener('click', function(e) {
    clearPuzzle();
    buildPuzzle('small');

    e.preventDefault();
});

const generateGrid = function(size) {
    grid.classList = `grid ${size}`;
    grid.innerHTML = '';
    for(var i = 0; i < (sizeObj[size]); i++) {
        grid.innerHTML += '<div></div>';
    }
}

generateGrid('small');

const buildPuzzle = function(size) {
    const puzzleArr = Array.from(document.querySelectorAll('#grid .grid div'));

    // determine length of each sub array
    let arrDepth;

    // length of sub array dependent on size
    if (size === 'small') {
        arrDepth = 5;
    } else {
        console.error('Error: Invalid puzzle size.');
    }

    // initialize row/col two dimensional arrays
    let rowArr = [];
    let colArr = [];
    for(let i = 0; i < arrDepth; i++) {
        rowArr[i] = [];
        colArr[i] = [];
    }

    let depth;
    // loop through puzzle array and split it into row/col arrays
    for (let i = 0; i < puzzleArr.length; i++) {
        // determine first level of array
        depth = Math.floor(i / arrDepth);

        /*
        reads if array is filled from top to bottom, left to right

        rowArr is reading the array sequentially (ie, from 0 to 24)
        colArr is reading vertically, counting by fives (ie, 0-5-10-15-20),
        then jumping back to the next lowest key (ie, 1-6-11-16-21),
        then continuing that pattern (ie, 2-7-12-17-22, 3-8-13-18-23, 4-9-14-19-24)

        example of how this works:
        rowArr[0][0] colArr[0][0], rowArr[1][0] colArr[0][1], rowArr[2][0] colArr[0][2], etc

        row needs to be broken out by its "five squares per row" to check
        for horizontally adjacent filled in squares to build the clues
        col needs to also be broken out by its "five squares per col" to
        check for vertically adjacent filled in squares to build the clues
         */
        rowArr[depth][i - (depth * arrDepth)] = puzzleArr[i].classList.contains('fill');
        colArr[i - (depth * arrDepth)][depth] = puzzleArr[i].classList.contains('fill');
    }

    // starts creating the html for
    let gridHTML = '';

    // figure out consecutive squares
    for (let i = 0; i < rowArr.length; i++) {
        // build opening span for row
        gridHTML += `<span class="cr${i + 1} r">` + calculateClues(rowArr, i) + `</span>`;
    }

    for (let i = 0; i < colArr.length; i++) {
        // build opening span for col
        gridHTML += `<span class="cc${i + 1} c">` + calculateClues(colArr, i) + `</span>`;
    }

    // create div for the clue grid
    const clue = document.createElement('div');
    clue.classList.add('clue-grid');
    clue.classList.add('small');

    clue.innerHTML = gridHTML;

    // clones the drawn puzzle into the clue puzzle
    var gridClone = grid.cloneNode(true);
    gridClone.removeAttribute('id');

    const gridSec = document.querySelector('#clue-grid section');
    const gridDiv = document.createElement('div');

    clue.appendChild(gridClone);

    // add grid to ui
    clueGrid.appendChild(clue);
};

// empties out the puzzle with clues
const clearPuzzle = function() {
    clueGrid.innerHTML = '';
}

// calculates the clues one chunk at a time
const calculateClues = function(rowArr, i) {
    let html = '';
    let consecutiveSquares = 0;

    // clueArr is clunky... figured out how to get rid of it
    let clueArr = [];
    for(let i = 0; i < rowArr.length; i++) {
        clueArr[i] = [];
    }

    for (let j = 0; j < rowArr[i].length; j++) {
        // checks if value in nested array is true/false
        // if true, add to the number of consecutive squares
        // if false, check to see if there are any consecutive squares
        if (rowArr[i][j]) {
            // add to number of consecutive squares
            consecutiveSquares++;
        } else {
            // check to see if there are any consecutive squares
            // if there are, then push number of consecutive squares into clue array for that row/column
            if (consecutiveSquares > 0) {
                // push number of consecutive squares into clue array
                clueArr[i].push(consecutiveSquares);
                // display number of consecutive squares
                html += `<span>${consecutiveSquares}</span>`;
                // reset number of consecutive squares
                consecutiveSquares = 0;
            }
        }
        // if last iteration of array and there are any consecutive squares, push into clue array for row/column
        if (j === rowArr[i].length - 1 && consecutiveSquares > 0) {
            clueArr[i].push(consecutiveSquares);
            // display number of consecutive squares
            html += `<span>${consecutiveSquares}</span>`;
            // reset number of consecutive squares
            consecutiveSquares = 0;
        }
    }
    if (clueArr[i].length === 0) {
        // display zero for row
        html += `<span>${consecutiveSquares}</span>`;
    }

    return html;
}