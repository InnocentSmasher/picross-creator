/* eslint-disable*/

const grid = document.querySelector('#grid .grid');
const modal = document.querySelector('.clue__background');
const close = modal.querySelector('.close');

// build blank puzzle grid
document.querySelector('#generate-puzzle').addEventListener('click', function (e) {
    clearGrid();
    clearPuzzle();

    const width = document.querySelector('#puzzle-width').value;
    const height = document.querySelector('#puzzle-height').value;

    generateGrid(`${width}x${height}`);
});

// build puzzle clues
document.querySelector('#generate-clues').addEventListener('click', function (e) {
    clearPuzzle();

    // figure out a better solution to get the grid size
    buildPuzzle(grid.classList[1]);

    e.preventDefault();
});

const generateGrid = function(size) {
    // determine first dimension length of row and column
    let depthArr = size.split('x');
    let rowDepth = parseInt(depthArr.shift());
    let colDepth = parseInt(depthArr.shift());

    grid.innerHTML = '';
    grid.className = 'grid';
    grid.classList.add(size);
    grid.style.width = `${rowDepth * 3 + .5}rem`;
    grid.style.gridTemplateColumns = `repeat(${rowDepth}, 3rem)`;
    grid.style.gridTemplateRows = `repeat(${colDepth}, 3rem)`;
    for(var i = 0; i < (rowDepth * colDepth); i++) {
        grid.innerHTML += '<div></div>';
    }

    document.querySelector('#grid').style.display = 'flex';
    document.querySelector('#generate-button-wrapper').style.display = 'flex';
}

const buildPuzzle = function (size) {
    // build true/false array based on which squares are filled in
    const puzzleArr = Array.from(document.querySelectorAll('#grid .grid div'));

    // determine first dimension length of row and column
    let depthArr = size.split('x');
    let rowDepth = parseInt(depthArr.shift());
    let colDepth = parseInt(depthArr.shift());

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

    // create div for the clue grid
    const clue = document.createElement('div');
    clue.classList.add('clue');

    // places the clue rows and columns on the grid

    // clones the drawn puzzle into the clue puzzle
    var gridClone = grid.cloneNode(true);
    gridClone.removeAttribute('id');

    // set up grid inside clue template
    gridClone.style.gridColumn = `2 / span ${parseInt(rowDepth) + 2}`;
    gridClone.style.gridRow = `2 / span ${colDepth + 2}`;

    // set up grid for overall clue template
    clue.style.gridTemplateColumns = `auto .25rem repeat(${rowDepth}, 3rem) .25rem`;
    clue.style.gridTemplateRows = `auto .25rem repeat(${colDepth}, 3rem) .25rem`;

    clue.innerHTML = clueHTML;
    clue.appendChild(gridClone);

    // add grid to ui
    document.querySelector('#clue-grid').append(clue);
    modal.classList.add('open');
    // document.querySelector('#clue-grid').style.display = 'flex';
};

// clears blank puzzle grid
const clearGrid = function () {
    document.querySelector('#grid').style.display = 'none';
    document.querySelector('#generate-button-wrapper').style.display = 'none';
    document.querySelector('#grid .grid').innerHTML = '';
}

// clears puzzle clue grid
const clearPuzzle = function () {
    modal.classList.remove('open');
    document.querySelector('#clue-grid').innerHTML = '';
}

const buildClues = function (rowArr, colArr) {
    let html = '';

    for (let i = 0; i < rowArr.length; i++) {
        html += `<span class="row" style="grid-column: 1; grid-row: ${i + 3};">` + calculateClues(rowArr, i) + `</span>`;
    }

    for (let i = 0; i < colArr.length; i++) {
        html += `<span class="col" style="grid-column: ${i + 3}; grid-row: 1;">` + calculateClues(colArr, i) + `</span>`;
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

// add event listeners to all the squares
grid.addEventListener('click', function (e) {
    const square = e.target;
    square.classList.toggle('fill');
});

// add event listeners to the modal
modal.addEventListener('click', function (e) {

})

// close modal
close.addEventListener('click', clearPuzzle);