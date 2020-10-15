/* eslint-disable*/

const grid = document.querySelector('#grid .grid');
const clueGrid = document.querySelector('#clue-grid');
const generateBtn = document.querySelector('#generate');
const sizeObj = {
    "5x5": 25,
    "6x5": 30,
};

// add event listeners to all the squares
grid.addEventListener('click', function (e) {
    const square = e.target;
    square.classList.toggle('fill');
});

// build out the rules for solving the grid
generateBtn.addEventListener('click', function (e) {
    clearPuzzle();
    // buildPuzzle('5x5');
    buildPuzzle('6x5');

    e.preventDefault();
});

const generateGrid = function(size) {
    grid.classList = `grid grid--${size}`;
    grid.innerHTML = '';
    for(var i = 0; i < (sizeObj[size]); i++) {
        grid.innerHTML += '<div></div>';
    }
}

generateGrid('6x5');

const buildPuzzle = function (size) {
    // build true/false array based on which squares are filled in
    const puzzleArr = Array.from(document.querySelectorAll('#grid .grid div'));

    // determine first dimension length of row and column
    let depthArr = size.split('x');
    let rowDepth = depthArr.shift();
    let colDepth = depthArr.shift();

    // depth is rowDepth because array is being read from left to right
    let depth = rowDepth;

    // initialize two dimensional arrays for rows and columns
    // opposite rowDepth/colDepth are used since
    // rowArr will have colDepth number of rows
    // colArr will have rowDepth number of columns
    // example: you have a 10x5 grid (50 squares)
    // each row will have 10 squares, and there will be 5 rows
    // each column will have 5 squares, and there will be 10 columns
    let rowArr = [];
    for(let i = 0; i < colDepth; i++) {
        rowArr[i] = [];
    }
    let colArr = [];
    for(let i = 0; i < rowDepth; i++) {
        colArr[i] = [];
    }

    // builds out the arrays based on rows and columns
    for (let i = 0; i < puzzleArr.length; i++) {

        // determine static key being filled for each iteration
        let key = Math.floor(i / depth);

        // rowArr is being written based on child array first ([0][0], [0][1], [0][2], etc)
        rowArr[key][i - (key * depth)] = puzzleArr[i].classList.contains('fill');
        // colArr is being written based on parent array first ([0][0], [1][0], [2][0], etc)
        colArr[i - (key * depth)][key] = puzzleArr[i].classList.contains('fill');
    }

    // creates html for clues
    let clueHTML = buildClues(rowArr, colArr);
    let gridHTML = '';



    // create div for the clue grid
    const clue = document.createElement('div');
    clue.classList.add('clue');
    clue.classList.add(`clue--${size}`);

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
const clearPuzzle = function () {
    clueGrid.innerHTML = '';
}

const buildClues = function (rowArr, colArr) {
    let html = '';

    for (let i = 0; i < rowArr.length; i++) {
        html += `<span class="row row--${i + 1}">` + calculateClues(rowArr, i) + `</span>`;
    }

    for (let i = 0; i < colArr.length; i++) {
        html += `<span class="col col--${i + 1}">` + calculateClues(colArr, i) + `</span>`;
    }

    return html;
}

// calculates the clues one chunk at a time
const calculateClues = function (rowArr, i) {
    let html = '';
    let consecutiveSquares = 0;

    // clueArr is clunky... figure out how to get rid of it
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