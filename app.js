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
    // --- Schedule Section ---
    const SCHEDULE = [
        {
            date: 'March 21',
            label: 'Second Round',
            games: [
                { seed1: 1, team1: 'Michigan', score1: 95, seed2: 9, team2: 'Saint Louis', score2: 72, network: 'CBS', status: 'final' },
                { seed1: 3, team1: 'Michigan State', score1: 77, seed2: 6, team2: 'Louisville', score2: 69, network: 'CBS', status: 'final' },
                { seed1: 1, team1: 'Duke', seed2: 9, team2: 'TCU', time: '5:15 PM ET', network: 'CBS', status: 'upcoming' },
                { seed1: 2, team1: 'Houston', seed2: 10, team2: 'Texas A&M', time: '6:10 PM ET', network: 'TNT', status: 'upcoming' },
                { seed1: 3, team1: 'Gonzaga', seed2: 11, team2: 'Texas', time: '7:10 PM ET', network: 'TBS', status: 'upcoming' },
                { seed1: 3, team1: 'Illinois', seed2: 11, team2: 'VCU', time: '7:50 PM ET', network: 'CBS', status: 'upcoming' },
                { seed1: 4, team1: 'Nebraska', seed2: 5, team2: 'Vanderbilt', time: '8:45 PM ET', network: 'TNT', status: 'upcoming' },
                { seed1: 4, team1: 'Arkansas', seed2: 12, team2: 'High Point', time: '9:45 PM ET', network: 'TBS', status: 'upcoming' },
            ]
        },
        {
            date: 'March 22',
            label: 'Second Round',
            games: [
                { seed1: 7, team1: 'Miami', seed2: 2, team2: 'Purdue', time: '12:10 PM ET', network: 'CBS', status: 'upcoming' },
                { seed1: 7, team1: 'Kentucky', seed2: 2, team2: 'Iowa State', time: '2:45 PM ET', network: 'CBS', status: 'upcoming' },
                { seed1: 5, team1: "St. John's", seed2: 4, team2: 'Kansas', time: '5:15 PM ET', network: 'CBS', status: 'upcoming' },
                { seed1: 6, team1: 'Tennessee', seed2: 3, team2: 'Virginia', time: '6:10 PM ET', network: 'TNT', status: 'upcoming' },
                { seed1: 9, team1: 'Iowa', seed2: 1, team2: 'Florida', time: '7:10 PM ET', network: 'TBS', status: 'upcoming' },
                { seed1: 9, team1: 'Utah State', seed2: 1, team2: 'Arizona', time: '7:50 PM ET', network: 'truTV', status: 'upcoming' },
                { seed1: 7, team1: 'UCLA', seed2: 2, team2: 'UConn', time: '8:45 PM ET', network: 'TNT', status: 'upcoming' },
                { seed1: 5, team1: 'Texas Tech', seed2: 4, team2: 'Alabama', time: '9:45 PM ET', network: 'TBS', status: 'upcoming' },
            ]
        }
    ];

    let currentDayIndex = 0;

    function renderSchedule() {
        const container = document.getElementById('schedule');
        const day = SCHEDULE[currentDayIndex];

        const finals = day.games.filter(g => g.status === 'final');
        const upcoming = day.games.filter(g => g.status === 'upcoming');

        let html = `<div class="sched">`;
        html += `<div class="sched-nav">`;
        html += `<button class="sched-btn" id="prevDay" ${currentDayIndex === 0 ? 'disabled' : ''}>&larr; Prev</button>`;
        html += `<div class="sched-title"><span class="sched-date">${day.date}</span><span class="sched-round">${day.label}</span></div>`;
        html += `<button class="sched-btn" id="nextDay" ${currentDayIndex === SCHEDULE.length - 1 ? 'disabled' : ''}>Next &rarr;</button>`;
        html += `</div>`;

        if (finals.length) {
            html += `<h3 class="sched-heading">Results</h3>`;
            html += `<div class="sched-grid">`;
            finals.forEach(g => {
                const w1 = g.score1 > g.score2;
                const note = g.note ? ` <span class="sched-ot">(${g.note})</span>` : '';
                html += `<div class="sched-game final">`;
                html += `<span class="sched-team ${w1 ? 'win' : 'loss'}"><span class="seed">(${g.seed1})</span> ${g.team1} <span class="score">${g.score1}</span></span>`;
                html += `<span class="sched-team ${w1 ? 'loss' : 'win'}"><span class="seed">(${g.seed2})</span> ${g.team2} <span class="score">${g.score2}</span></span>`;
                if (note) html += `<span class="sched-note">${note}</span>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        if (upcoming.length) {
            html += `<h3 class="sched-heading">${finals.length ? 'Tonight' : 'Games'}</h3>`;
            html += `<div class="sched-grid">`;
            upcoming.forEach(g => {
                const net = g.network ? ` <span class="sched-net">${g.network}</span>` : '';
                html += `<div class="sched-game upcoming">`;
                html += `<span class="sched-team"><span class="seed">(${g.seed1})</span> ${g.team1}</span>`;
                html += `<span class="sched-vs">vs</span>`;
                html += `<span class="sched-team"><span class="seed">(${g.seed2})</span> ${g.team2}</span>`;
                html += `<span class="sched-time">${g.time}${net}</span>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        html += `</div>`;
        container.innerHTML = html;

        document.getElementById('prevDay').addEventListener('click', () => {
            if (currentDayIndex > 0) { currentDayIndex--; renderSchedule(); }
        });
        document.getElementById('nextDay').addEventListener('click', () => {
            if (currentDayIndex < SCHEDULE.length - 1) { currentDayIndex++; renderSchedule(); }
        });
    }

    renderSchedule();
})();
