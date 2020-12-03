/* eslint-disable*/

const drawGridWrapper = document.querySelector('#draw-grid');
const drawGrid = drawGridWrapper.querySelector('.grid');
const clueGrid = document.querySelector('#clue-grid');
const modal = document.querySelector('.modal__outer');
let blankGrid;

// buttons
const generatePuzzleBtn = document.querySelector('#generate-puzzle');
const generateCluesBtn = document.querySelector('#generate-clues');
const solutionBtn = document.querySelector('#view-solution');
const printBtn = document.querySelector('#print-puzzle');
const closeBtn = modal.querySelector('#close');

// build blank puzzle grid
generatePuzzleBtn.addEventListener('click', function (e) {
    const inputs = document.querySelectorAll('.intro input');

    // get width and height of puzzle
    const columns = document.querySelector('#puzzle-width').value;
    const rows = document.querySelector('#puzzle-height').value;

    // check if fields are filled
    if (verifyInput(columns) && verifyInput(rows)) {
        // remove error classes, if any
        inputs.forEach(function(input) {
            if (input.classList.contains('error')) {
                input.classList.remove('error');
            }
        })

        clearGrid();
        clearClueGrid();

        // generate blank grid to start marking up
        generateBlankGrid(columns, rows);
    } else {
        // add error classes to invalid inputs
        inputs.forEach(function(input) {
            if (!input.classList.contains('error') && !verifyInput(input.value)) {
                input.classList.add('error');
            } else if (input.classList.contains('error') && verifyInput(input.value)) {
                input.classList.remove('error');
            }
        })
    }

});

// build puzzle clues
generateCluesBtn.addEventListener('click', function (e) {
    clearClueGrid();
    buildClueGrid(getGridColumns(), getGridRows());
});

function generateBlankGrid (columns, rows) {
    drawGrid.innerHTML = '';
    drawGrid.className = 'grid';
    drawGrid.style.width = `${columns * 3 + .5}rem`;
    drawGrid.style.gridTemplateColumns = `repeat(${columns}, 3rem)`;
    drawGrid.style.gridTemplateRows = `repeat(${rows}, 3rem)`;
    drawGrid.setAttribute('data-columns', columns);
    drawGrid.setAttribute('data-rows', rows);
    for(let i = 0; i < (columns * rows); i++) {
        drawGrid.innerHTML += '<div></div>';
    }

    // generates a blank copy of this grid before drawing begins
    blankGrid = drawGrid.cloneNode(true);

    drawGridWrapper.style.display = 'flex';
    document.querySelector('#generate-button-wrapper').style.display = 'flex';
}

const buildClueGrid = function (columns, rows) {
    // build true/false array based on which squares are filled in
    const puzzle = Array.from(drawGrid.querySelectorAll('div'));

    // depth is columns because array is being read from left to right
    const depth = columns;

    // initialize two dimensional arrays for rows and columns
    // opposite columns/rows are used since
    // puzzleByRow will have rows number of rows
    // puzzleByColumn will have columns number of columns
    // example: you have a 10x5 grid (50 squares)
    // each row will have 10 squares, and there will be 5 rows
    // each column will have 5 squares, and there will be 10 columns
    let puzzleByRow = Array.from(Array(rows), () => Array(columns));
    let puzzleByColumn = Array.from(Array(columns), () => Array(rows));

    // builds out the arrays based on rows and columns
    for (let i = 0; i < puzzle.length; i++) {
        // determine static key being filled for each iteration
        let key = Math.floor(i / depth);

        // puzzleByRow is being written based on child array first ([0][0], [0][1], [0][2], etc)
        puzzleByRow[key][i - (key * depth)] = puzzle[i].classList.contains('fill');
        // puzzleByColumn is being written based on parent array first ([0][0], [1][0], [2][0], etc)
        puzzleByColumn[i - (key * depth)][key] = puzzle[i].classList.contains('fill');
    }

    // creates html for clues
    let clueHTML = buildClues(puzzleByRow, puzzleByColumn);

    // create div for the clue grid
    const clue = document.createElement('div');
    clue.classList.add('clue');

    // places the clue rows and columns on the grid



    // set up grid inside clue template
    blankGrid.style.gridColumn = `2 / span ${columns + 2}`;
    blankGrid.style.gridRow = `2 / span ${rows + 2}`;

    // set up grid for overall clue template
    clue.style.gridTemplateColumns = `auto .25rem repeat(${columns}, 3rem) .25rem`;
    clue.style.gridTemplateRows = `auto .25rem repeat(${rows}, 3rem) .25rem`;

    clue.innerHTML = clueHTML;
    clue.appendChild(blankGrid);

    // add grid to ui
    document.querySelector('#clue-grid').append(clue);
    modal.querySelector('h2').innerText = `Puzzle (${columns}x${rows})`;
    modal.classList.add('open');
};

// clears blank puzzle grid
const clearGrid = function () {
    drawGridWrapper.style.display = 'none';
    document.querySelector('#generate-button-wrapper').style.display = 'none';
    drawGrid.innerHTML = '';
}

// clears puzzle clue grid
const clearClueGrid = function () {
    clueGrid.innerHTML = '';
}

const buildClues = function (puzzleByRow, puzzleByColumn) {
    let html = '';

    for (let i = 0; i < puzzleByRow.length; i++) {
        html += `<span class="row" style="grid-column: 1; grid-row: ${i + 3};">` + calculateClues(puzzleByRow, i) + `</span>`;
    }

    for (let i = 0; i < puzzleByColumn.length; i++) {
        html += `<span class="col" style="grid-column: ${i + 3}; grid-row: 1;">` + calculateClues(puzzleByColumn, i) + `</span>`;
    }

    return html;
}

// calculates the clues one chunk at a time
function calculateClues (clues, i) {
    let html = '';
    let consecutiveSquares = 0;

    for (let j = 0; j < clues[i].length; j++) {
        // checks if value in nested array is true/false
        if (clues[i][j]) {
            // if true, add to number of consecutive squares
            consecutiveSquares++;
        } else if (consecutiveSquares > 0) {
            // if false, check to see if there are any consecutive squares
            // add clue number to the html
            html += `<span>${consecutiveSquares}</span>`;

            // reset number of consecutive squares
            consecutiveSquares = 0;
        }
        // checks if last iteration and if there are consecutive squares
        if (j === clues[i].length - 1 && consecutiveSquares > 0) {
            // if true, add clue number to html
            html += `<span>${consecutiveSquares}</span>`;
        }
    }

    // if the html is empty, there are no clues for the row
    if (html === '') {
        html += '<span>0</span>';
    }

    return html;
}

function getGridColumns () {
    return parseInt(drawGrid.getAttribute('data-columns'));
}

function getGridRows () {
    return parseInt(drawGrid.getAttribute('data-rows'));
}

function closeModal () {
    modal.classList.remove('open');
}

function verifyInput (input) {
    input = parseInt(input);
    return input > 0 && input <= 25;
}

// add event listeners to all the squares
drawGrid.addEventListener('click', function (e) {
    const square = e.target;
    square.classList.toggle('fill');
});

// close modal
closeBtn.addEventListener('click', closeModal);
window.addEventListener('keyup', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
    }
});

// print puzzle
printBtn.addEventListener('click', function () {
    window.print();
})

// view solution
solutionBtn.addEventListener('click', function () {
    // clone the drawn puzzle
    let solutionGrid = drawGrid.cloneNode(true);

    // replace blank grid with solution grid
    clueGrid.querySelector('.grid').innerHTML = solutionGrid.innerHTML;
});