window.onblur = () => {
	document.querySelector('title').innerText = `Minesweeper | ${mineCount}F ${timerElement.innerText}s`;
}

window.onfocus = () => {
	document.querySelector('title').innerText = 'Minesweeper';
}

const height = 20;
const width = 40;
const mineCount = 120;
const freeSpaces = 8;

const boardElement = document.querySelector('#game-board');

const minesLeft = document.querySelector('#game-mines-text');
const timerElement = document.querySelector('#game-timer-text');
const scoreElement = document.querySelector('#game-score-text');

let board = [];
let mines = [];

let tilesRevealed = 0;
let gameEnd = false;

let time = 0;

minesLeft.innerText = mineCount;
timerElement.innerText = 0;
scoreElement.innerText = (localStorage.lowestTime) ? localStorage.lowestTime : 'High Score';

createMines();
createBoard();
updateBorders();

function createBoard() {
	for (let y = 0; y < height; y++) {
		let row = [];
		for (let x = 0; x < width; x++) {
			const tile = document.createElement('div');
			tile.classList.add('tile');
			tile.id = `${y}-${x}`;
			tile.classList.add(((y + x) % 2 == 1) ? 'dark' : 'light');
			tile.addEventListener('click', () => {			
				revealTile(tile);
			});
			tile.addEventListener('contextmenu', e => {
				e.preventDefault();
				markTile(tile);
			});
			boardElement.appendChild(tile);
			row.push(tile);
		}
		board.push(row);
	}
}

function createMines() {
	while (mines.length < mineCount) {
		const y = Math.floor(Math.random() * height);
		const x = Math.floor(Math.random() * width);
		const position = `${y}-${x}`;
		if (mines.includes(position)) continue;
		mines.push(position);
	}
}

function updateNumbers() {
	board.forEach(row => {
		row.forEach(tile => {
			const pos = tile.id.split('-');
			const y = parseInt(pos[0]);
			const x = parseInt(pos[1]);
			if (!tile.classList.contains('revealed')) return;
			let value = 0;
			value += checkTile(y - 1, x - 1);
			value += checkTile(y - 1, x    );
			value += checkTile(y - 1, x + 1);
			value += checkTile(y,     x - 1);
			value += checkTile(y,     x + 1);
			value += checkTile(y + 1, x - 1);
			value += checkTile(y + 1, x    );
			value += checkTile(y + 1, x + 1);
			if (value > 0) tile.innerText = value;
			if (value == 0) tile.innerText = '';
		});
	});
}

function revealTile(tile) {
	if (gameEnd) return;
	if (tile.classList.contains('marked')) return;
	if (tile.classList.contains('revealed')) return;
	if (mines.includes(tile.id)) {
		if (tilesRevealed < freeSpaces) {
			mines.splice(mines.indexOf(tile.id), 1);
			minesLeft.innerText -= 1;
			revealTile(tile);
			updateNumbers();
			return;
		}
		gameOver();
		return;
	}
	let pos = tile.id.split('-');
	let y = parseInt(pos[0]);
	let x = parseInt(pos[1]);
	checkMine(y, x);
	updateBorders();
}

function markTile(tile) {
	if (gameEnd) return;
	if (tile.classList.contains('revealed')) return;
	tile.classList.toggle('marked');
	if (tile.classList.contains('marked')) {
		minesLeft.innerText = parseInt(minesLeft.innerText) - 1;
	} else {
		minesLeft.innerText = parseInt(minesLeft.innerText) + 1;
	}
	updateBorders();
}

function updateBorders() {
	board.forEach(row => {
		row.forEach(tile => {
			if (tile.classList.contains('revealed')) {
				borderRevealed(tile);
				return;
			}
			if (tile.classList.contains('marked')) {
				borderMarked(tile);
				return;
			}
			if (tile.classList.contains('mine')) {
				borderMine(tile);
				return;
			}
			borderEmpty(tile);
		});
	});
}

function borderEmpty(tile) {
	const pos = tile.id.split('-');
	const y = parseInt(pos[0]);
	const x = parseInt(pos[1]);
	const top = (y == 0) || (
		board[y - 1][x].classList.contains('marked') ||
		board[y - 1][x].classList.contains('revealed') ||
		board[y - 1][x].classList.contains('mine')
	);
	const bottom = (y == 19) || (
		board[y + 1][x].classList.contains('marked') ||
		board[y + 1][x].classList.contains('revealed') ||
		board[y + 1][x].classList.contains('mine')
	);
	const left = (x == 0) || (
		board[y][x - 1].classList.contains('marked') ||
		board[y][x - 1].classList.contains('revealed') ||
		board[y][x - 1].classList.contains('mine')
	);
	const right = (x == 39) || (
		board[y][x + 1].classList.contains('marked') ||
		board[y][x + 1].classList.contains('revealed') ||
		board[y][x + 1].classList.contains('mine')
	);
	tile.style.borderTopStyle = (top) ? 'solid' : 'none';
	tile.style.borderBottomStyle = (bottom) ? 'solid' : 'none';
	tile.style.borderLeftStyle = (left) ? 'solid' : 'none';
	tile.style.borderRightStyle = (right) ? 'solid' : 'none';
}

function borderMarked(tile) {
	const pos = tile.id.split('-');
	const y = parseInt(pos[0]);
	const x = parseInt(pos[1]);
	const top = (y == 0) || !board[y - 1][x].classList.contains('marked');
	const bottom = (y == 19) || !board[y + 1][x].classList.contains('marked');
	const left = (x == 0) || !board[y][x - 1].classList.contains('marked');
	const right = (x == 39) || !board[y][x + 1].classList.contains('marked');
	tile.style.borderTopStyle = (top) ? 'solid' : 'none';
	tile.style.borderBottomStyle = (bottom) ? 'solid' : 'none';
	tile.style.borderLeftStyle = (left) ? 'solid' : 'none';
	tile.style.borderRightStyle = (right) ? 'solid' : 'none';
}

function borderRevealed(tile) {
	const pos = tile.id.split('-');
	const y = parseInt(pos[0]);
	const x = parseInt(pos[1]);
	const top = (y == 0) || !board[y - 1][x].classList.contains('revealed');
	const bottom = (y == 19) || !board[y + 1][x].classList.contains('revealed');
	const left = (x == 0) || !board[y][x - 1].classList.contains('revealed');
	const right = (x == 39) || !board[y][x + 1].classList.contains('revealed');
	tile.style.borderTopStyle = (top) ? 'solid' : 'none';
	tile.style.borderBottomStyle = (bottom) ? 'solid' : 'none';
	tile.style.borderLeftStyle = (left) ? 'solid' : 'none';
	tile.style.borderRightStyle = (right) ? 'solid' : 'none';
}

function borderMine(tile) {
	const pos = tile.id.split('-');
	const y = parseInt(pos[0]);
	const x = parseInt(pos[1]);
	const top = (y == 0) || !board[y - 1][x].classList.contains('mine');
	const bottom = (y == 19) || !board[y + 1][x].classList.contains('mine');
	const left = (x == 0) || !board[y][x - 1].classList.contains('mine');
	const right = (x == 39) || !board[y][x + 1].classList.contains('mine');
	tile.style.borderTopStyle = (top) ? 'solid' : 'none';
	tile.style.borderBottomStyle = (bottom) ? 'solid' : 'none';
	tile.style.borderLeftStyle = (left) ? 'solid' : 'none';
	tile.style.borderRightStyle = (right) ? 'solid' : 'none';
}

function borderSafe(tile) {
	const pos = tile.id.split('-');
	const y = parseInt(pos[0]);
	const x = parseInt(pos[1]);
	const top = (y == 0) || !board[y - 1][x].classList.contains('safe');
	const bottom = (y == 19) || !board[y + 1][x].classList.contains('safe');
	const left = (x == 0) || !board[y][x - 1].classList.contains('safe');
	const right = (x == 39) || !board[y][x + 1].classList.contains('safe');
	tile.style.borderTopStyle = (top) ? 'solid' : 'none';
	tile.style.borderBottomStyle = (bottom) ? 'solid' : 'none';
	tile.style.borderLeftStyle = (left) ? 'solid' : 'none';
	tile.style.borderRightStyle = (right) ? 'solid' : 'none';
}

function gameOver() {
	gameEnd = true;
	document.querySelectorAll('.tile').forEach(e => {
		if (mines.includes(e.id) && !e.classList.contains('marked')) {
			const g = () => {
				e.classList.add('mine');
			};
			setTimeout(g, 10 * Math.floor(Math.random() * 800));
		}
		if (e.classList.contains('marked') && !mines.includes(e.id)) {
			const g = () => {
				e.classList.add('safe');
			}
			setTimeout(g, 10 * Math.floor(Math.random() * 800));
		}
	});
	setInterval(updateBorders, 10);
	setTimeout(() => {
		window.location.reload();
	}, 11000);
}

function winGame() {
	const endTime = parseInt(timerElement.innerText);
	if (!localStorage.lowestTime) {
		localStorage.lowestTime = endTime;
	} else {
		if (endTime < parseInt(localStorage.lowestTime)) localStorage.lowestTime = endTime;
	}
	document.querySelectorAll('.tile').forEach(e => {
		const g = () => {
			if (e.classList.contains('revealed')) return;
			if (!e.classList.contains('marked')) e.classList.toggle('marked');
			e.classList.add('safe');
		};
		setTimeout(g, 10 * Math.floor(Math.random() * 800));
	});
	setInterval(updateBorders, 10);
	setTimeout(() => {
		window.location.reload();
	}, 11000);
}

function checkMine(y, x) {
	if (y < 0) return;
	if (x < 0) return;
	if (y >= height) return;
	if (x >= width) return;
	if (board[y][x].classList.contains('revealed')) return;
	if (board[y][x].classList.contains('marked')) return;
	board[y][x].classList.add('revealed');
	if (tilesRevealed < freeSpaces) board[y][x].classList.add('free');
	tilesRevealed++;
	let value = 0;
	value += checkTile(y - 1, x - 1);
	value += checkTile(y - 1, x    );
	value += checkTile(y - 1, x + 1);
	value += checkTile(y,     x - 1);
	value += checkTile(y,     x + 1);
	value += checkTile(y + 1, x - 1);
	value += checkTile(y + 1, x    );
	value += checkTile(y + 1, x + 1);
	if (value > 0) {
		board[y][x].innerText = value;
	} else {
		checkMine(y - 1, x - 1);
		checkMine(y - 1, x    );
		checkMine(y - 1, x + 1);
		checkMine(y,     x - 1);
		checkMine(y,     x + 1);
		checkMine(y + 1, x - 1);
		checkMine(y + 1, x    );
		checkMine(y + 1, x + 1);
	}
	if (tilesRevealed == height * width - mineCount) {
		winGame(); return;
	}
}

function checkTile(y, x) {
	if (y < 0 || x < 0) return 0;
	if (y >= height || x >= width) return 0;
	if (mines.includes(`${y}-${x}`)) return 1;
	return 0;
}

function timer() {
	time += 1;
	timerElement.innerText = Math.floor(time / 60);
	window.requestAnimationFrame(timer);
}
timer();