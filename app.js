(() => {
    const ROUNDS = ['pink', 'blue', 'green', 'purple', 'red'];
    const ROUND_LABELS = ['R32', 'S16', 'E8', 'F4', 'FIN'];

    const TOP = [
        [3,4,0,5,2,1,7,6,9,8],
        [7,8,9,0,1,4,6,2,5,3],
        [2,5,1,4,9,7,6,0,8,3],
        [5,7,2,0,9,8,3,1,6,4],
        [2,7,1,3,8,9,6,0,4,5],
    ];

    const LEFT = [
        [9,5,7,0,1,2,3,4,8,6],
        [9,0,5,4,3,2,7,1,8,6],
        [3,1,2,4,5,9,0,7,6,8],
        [4,1,7,0,3,9,8,2,5,6],
        [8,4,9,0,1,3,2,5,6,7],
    ];

    const NAMES = [
        ['Patrick Forde','RC','Ray Wasil','Mike Durante','Craig','White','Jen','Callaci','D. Sheehan','Jimmy T'],
        ['Jimmy T','C. Sheehan','Boston & Simon','R. Sheehan','Blevs','Lynn','Craig','Vill','Joe','Pat'],
        ['Fred Bosse','Omar','Randy','C & R','AJ','AAA','Charlie','Mikey D.','J Blevs','MS'],
        ['Marker','Nick Chuck','Mikey D.','Arturo','Tigger','Jess','Silver','Dooner','Darren B.','Foster'],
        ['Mikey D.','Becca & Pat McP','Andy Tommy','C. Sheehan','J Blev','Emmersons','Jill & Joe','MMC','Frank the Tank','Joey Bags'],
        ['Kohler','Irish Polish Italian','KJ','Monge','Simon & Joe','Big Guy','Frank B.','Lacey','Mike Arm','GTS'],
        ['BJ','Silver','KJ','Lou & Belle','Andy Tommy','Fitz','Mike Fitz','Laura Bob','Joe Loop','Joe Buetti'],
        ['Jc KB','Blevs','Mike Fitz','Rooney','B','Castellone','Kevin K','J&M','Tom J','Higgle Foley'],
        ['Jack Johnson','Will T','E&F','Kretz','Jc KB','J Blev','Chris Mike','KB','George Tompkins','Choo'],
        ['D. Sheehan','Sue & Matt','Sieb','GW','Pops','EBO','John Dino','Joe F','Rokicki','Green'],
    ];

    const MY_SQUARE = 39; // 1-indexed: row 4, col 9
    const FRIEND_SQUARE = 19; // Joe G

    const board = document.getElementById('board');

    // Corner cell
    const corner = document.createElement('div');
    corner.className = 'cell-corner';
    board.appendChild(corner);

    // Top edge cells
    for (let col = 0; col < 10; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell-edge top';
        for (let r = 0; r < 5; r++) {
            const num = document.createElement('span');
            num.className = `edge-num ${ROUNDS[r]}`;
            num.textContent = TOP[r][col];
            num.title = ROUND_LABELS[r];
            cell.appendChild(num);
        }
        board.appendChild(cell);
    }

    // Rows
    for (let row = 0; row < 10; row++) {
        // Left edge cell
        const edgeCell = document.createElement('div');
        edgeCell.className = 'cell-edge left';
        for (let r = 0; r < 5; r++) {
            const num = document.createElement('span');
            num.className = `edge-num ${ROUNDS[r]}`;
            num.textContent = LEFT[r][row];
            num.title = ROUND_LABELS[r];
            edgeCell.appendChild(num);
        }
        board.appendChild(edgeCell);

        // Name cells
        for (let col = 0; col < 10; col++) {
            const squareNum = row * 10 + col + 1;
            const cell = document.createElement('div');
            cell.className = 'cell-name';
            if (squareNum === MY_SQUARE) {
                cell.classList.add('my-square');
            }
            if (squareNum === FRIEND_SQUARE) {
                cell.classList.add('friend-square');
            }
            cell.textContent = NAMES[row][col];
            cell.title = `#${squareNum} — ${NAMES[row][col]}`;
            board.appendChild(cell);
        }
    }
})();
