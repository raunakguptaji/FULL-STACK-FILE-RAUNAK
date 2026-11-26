const pieces = [
    ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
    ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
];

const pieceNames = {
    "♜": "black rook",
    "♞": "black knight",
    "♝": "black bishop",
    "♛": "black queen",
    "♚": "black king",
    "♟": "black pawn",
    "♖": "white rook",
    "♘": "white knight",
    "♗": "white bishop",
    "♕": "white queen",
    "♔": "white king",
    "♙": "white pawn"
};

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

document.body.style.margin = "0";
document.body.style.minHeight = "100vh";
document.body.style.display = "flex";
document.body.style.alignItems = "center";
document.body.style.justifyContent = "center";
document.body.style.padding = "20px";
document.body.style.boxSizing = "border-box";
document.body.style.backgroundColor = "#f1f3f6";
document.body.style.fontFamily = "Arial, sans-serif";

const container = document.createElement("main");
container.style.width = "min(100%, 620px)";
container.style.padding = "28px";
container.style.boxSizing = "border-box";
container.style.textAlign = "center";
container.style.backgroundColor = "white";
container.style.borderRadius = "12px";
container.style.boxShadow = "0 4px 16px #00000018";
document.body.appendChild(container);

const heading = document.createElement("h1");
heading.textContent = "Chessboard";
heading.style.margin = "0 0 8px";
heading.style.color = "#273244";
container.appendChild(heading);

const description = document.createElement("p");
description.textContent = "Standard starting position";
description.style.margin = "0 0 22px";
description.style.color = "#697386";
container.appendChild(description);

const board = document.createElement("div");
board.setAttribute("role", "grid");
board.setAttribute("aria-label", "Chessboard in starting position");
board.style.display = "grid";
board.style.gridTemplateColumns = "repeat(8, 1fr)";
board.style.width = "min(100%, 520px)";
board.style.aspectRatio = "1";
board.style.margin = "0 auto";
board.style.overflow = "hidden";
board.style.border = "6px solid #5b4636";
board.style.borderRadius = "4px";
container.appendChild(board);

for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 8; column++) {
        const square = document.createElement("div");
        const isLight = (row + column) % 2 === 0;
        const piece = pieces[row][column];
        const coordinate = files[column] + (8 - row);

        square.setAttribute("role", "gridcell");
        square.setAttribute(
            "aria-label",
            piece ? coordinate + ", " + pieceNames[piece] : coordinate + ", empty"
        );
        square.style.position = "relative";
        square.style.display = "flex";
        square.style.alignItems = "center";
        square.style.justifyContent = "center";
        square.style.aspectRatio = "1";
        square.style.backgroundColor = isLight ? "#f0d9b5" : "#b58863";
        square.style.fontSize = "clamp(20px, 7vw, 48px)";
        square.style.lineHeight = "1";
        square.style.userSelect = "none";
        square.style.fontFamily = '"Segoe UI Symbol", Arial, sans-serif';

        if (piece) {
            square.textContent = piece;
        }

        if (column === 0) {
            const rank = document.createElement("span");
            rank.textContent = 8 - row;
            rank.style.position = "absolute";
            rank.style.top = "3px";
            rank.style.left = "4px";
            rank.style.fontSize = "11px";
            rank.style.fontWeight = "bold";
            rank.style.color = isLight ? "#b58863" : "#f0d9b5";
            square.appendChild(rank);
        }

        if (row === 7) {
            const file = document.createElement("span");
            file.textContent = files[column];
            file.style.position = "absolute";
            file.style.right = "4px";
            file.style.bottom = "3px";
            file.style.fontSize = "11px";
            file.style.fontWeight = "bold";
            file.style.color = isLight ? "#b58863" : "#f0d9b5";
            square.appendChild(file);
        }

        board.appendChild(square);
    }
}
