/* eslint-disable*/

const drawGridWrapper = document.querySelector('#draw-grid');
const drawGrid = drawGridWrapper.querySelector('.grid');
let clueSubGrid;
let solutionSubGrid;

// modal constants
const modal = document.querySelector('.modal__outer');
const clueGrid = modal.querySelector('#clue-grid');
const solutionGrid = modal.querySelector('#solution-grid');

// buttons
const generatePuzzleBtn = document.querySelector('#generate-puzzle');
const generateCluesBtn = document.querySelector('#generate-clues');
const solutionBtn = modal.querySelector('#view-solution');
const printBtn = modal.querySelector('#print-puzzle');
const closeBtn = modal.querySelector('#close');

// build blank puzzle grid
generatePuzzleBtn.addEventListener('click', generateBlankPuzzle);

// generate blank puzzle
function generateBlankPuzzle() {
    const inputs = document.querySelectorAll('.intro input');

    // get width and height of puzzle
    const columns = document.querySelector('#puzzle-width').value;
    const rows = document.querySelector('#puzzle-height').value;

    // check if fields are filled
    if (verifyInput(columns) && verifyInput(rows)) {
        // remove error classes, if any
        inputs.forEach(function(input) {
            input.classList.remove('error');
        });

        clearAllGrids();

        // generate blank grid for drawing
        generateDrawGrid(columns, rows);

        // generates a blank copy of this grid before drawing begins
        generateClueSubGrid();

        // show draw grid and set up event listeners
        initializeDrawGrid();
    } else {
        // add error classes to invalid inputs
        inputs.forEach(function(input) {
            !verifyInput(input.value) ? input.classList.add('error') : input.classList.remove('error');
        })
    }
}

// build puzzle clues
generateCluesBtn.addEventListener('click', function (e) {
    clearClueGrid();
    generateSolutionSubGrid();
    generateClueHTML(getGridColumns(), getGridRows());
});

function generateDrawGrid (columns, rows) {
    drawGrid.classList.add('grid');
    drawGrid.style.width = `${columns * 3 + .5}rem`;
    drawGrid.style.gridTemplateColumns = `repeat(${columns}, 3rem)`;
    drawGrid.style.gridTemplateRows = `repeat(${rows}, 3rem)`;
    drawGrid.setAttribute('data-columns', columns);
    drawGrid.setAttribute('data-rows', rows);

    // pushing into array then joining in one innerHTML step is WAY faster
    let html = [];
    for(let i = 0; i < (columns * rows); i++) {
        html.push('<div></div>');
    }
    drawGrid.innerHTML = html.join('');
}

function initializeDrawGrid() {
    // show draw grid
    drawGridWrapper.style.display = 'flex';
    document.querySelector('#generate-button-wrapper').style.display = 'flex';

    // add event listeners to all the squares
    drawGrid.addEventListener('click', function (e) {
        if (e.target !== drawGrid) {
            e.target.classList.toggle('fill');
        }
    });
}

function generateClueSubGrid() {
    clueSubGrid = drawGrid.cloneNode(true);
}

function generateSolutionSubGrid() {
    solutionSubGrid = drawGrid.cloneNode(true);
}

function generateClueHTML(columns, rows) {
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

    // create div for the clue grid
    const clueHTML = document.createElement('div');
    clueHTML.classList.add('clue');

    // set up grid for overall clue template
    clueHTML.style.gridTemplateColumns = `auto .25rem repeat(${columns}, 3rem) .25rem`;
    clueHTML.style.gridTemplateRows = `auto .25rem repeat(${rows}, 3rem) .25rem`;
    clueHTML.innerHTML = buildClues(puzzleByRow, puzzleByColumn);

    // update modal title
    modal.querySelector('h2').textContent = `Puzzle (${columns}x${rows})`;

    // set up grid inside clue template
    clueSubGrid.style.gridColumn = `2 / span ${columns + 2}`;
    clueSubGrid.style.gridRow = `2 / span ${rows + 2}`;

    // prepare sub grids
    placeSubGrids(columns, rows);

    // add grids to modal
    buildClueGrid(clueHTML);
    buildSolutionGrid(clueHTML.cloneNode(true), columns, rows);

    openModal();
}

function placeSubGrids(columns, rows) {
    clueSubGrid.style.gridColumn = `2 / span ${columns + 2}`;
    clueSubGrid.style.gridRow = `2 / span ${rows + 2}`;
    solutionSubGrid.style.gridColumn = `2 / span ${columns + 2}`;
    solutionSubGrid.style.gridRow = `2 / span ${rows + 2}`;
}

function buildClueGrid(clueHTML) {
    clueHTML.appendChild(clueSubGrid);
    clueGrid.append(clueHTML);
}

function buildSolutionGrid(solutionHTML, columns, rows) {
    solutionGrid.append(solutionHTML);
    solutionGrid.querySelector('.clue').append(solutionSubGrid);
}

function clearAllGrids() {
    clearGrid();
    clearClueGrid();
    clearSolutionGrid();
}

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

function clearSolutionGrid() {
    solutionGrid.innerHTML = '';
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

function openModal() {
    if (modal.classList.contains('open')) {
        console.info('Already open.');
        return;
    }

    solutionGrid.classList.add('hide');

    // add event listeners
    printBtn.addEventListener('click', printPuzzle);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('keyup', handleKeyUp);
    solutionBtn.addEventListener('click', toggleSolution);

    // show modal after adding interactivity
    modal.classList.add('open');
}

function closeModal () {
    if (!modal.classList.contains('open')) {
        console.info('Already closed.');
        return;
    }

    // hide modal before remove interactivity
    modal.classList.remove('open');

    // remove event listeners
    printBtn.removeEventListener('click', printPuzzle);
    closeBtn.removeEventListener('click', closeModal);
    window.removeEventListener('keyup', handleKeyUp);
    solutionBtn.removeEventListener('click', toggleSolution);
}

function handleKeyUp(e) {
    if (e.key === 'Escape') {
        return closeModal();
    }
}

function printPuzzle() {
    window.print();
}

function toggleSolution() {
    solutionGrid.classList.contains('hide') ? solutionBtn.textContent = 'Hide Solution' : solutionBtn.textContent = 'View Solution';
    solutionGrid.classList.toggle('hide');
    clueGrid.classList.toggle('hide');
}

function verifyInput (input) {
    return parseInt(input) > 0 && parseInt(input) <= 25;
}