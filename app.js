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
    const FRIEND_SQUARE = 78; // Joe G (J&M)

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
    // --- Schedule Section (Live API) ---
    const API_BASE = 'https://ncaa-api.henrygd.me/scoreboard/basketball-men/d1';

    const ROUND_MAP = [
        { dates: [[3,20],[3,21]], label: 'Second Round' },
        { dates: [[3,22],[3,23]], label: 'Second Round' },
        { dates: [[3,27],[3,28]], label: 'Sweet 16' },
        { dates: [[3,29],[3,30]], label: 'Elite 8' },
        { dates: [[4,5],[4,6]], label: 'Final Four' },
        { dates: [[4,7]], label: 'National Championship' },
    ];

    function getRoundLabel(date) {
        const m = date.getMonth() + 1;
        const d = date.getDate();
        for (const round of ROUND_MAP) {
            if (round.dates.some(([rm, rd]) => rm === m && rd === d)) return round.label;
        }
        return 'NCAA Tournament';
    }

    function formatDateNice(date) {
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    function dateToApi(date) {
        return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
    }

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let refreshTimer = null;

    async function fetchGames(date) {
        const ncaaUrl = `${API_BASE}/${dateToApi(date)}/all-conf`;

        // The NCAA API doesn't require CORS headers when accessed directly
        // Try direct first (works if served from same-origin or API allows it)
        const proxies = [
            (url) => url, // direct
            (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
            (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        ];

        for (const proxy of proxies) {
            try {
                const res = await fetch(proxy(ncaaUrl), { signal: AbortSignal.timeout(5000) });
                if (res.ok) {
                    const data = await res.json();
                    return (data.games || [])
                        .map(g => g.game)
                        .filter(g => g?.championshipId && g?.championshipGame?.round);
                }
            } catch (_) { /* try next proxy */ }
        }
        return [];
    }

    function renderGame(game) {
        const home = game.home;
        const away = game.away;
        const state = game.gameState;

        if (state === 'final') {
            const homeScore = parseInt(home.score) || 0;
            const awayScore = parseInt(away.score) || 0;
            const homeCls = homeScore >= awayScore ? 'win' : 'loss';
            const awayCls = awayScore >= homeScore ? 'win' : 'loss';
            const awaySeed = away.seed ? '(' + away.seed + ')' : '';
            const homeSeed = home.seed ? '(' + home.seed + ')' : '';
            let html = `<div class="sched-game final">`;
            html += `<span class="sched-team ${awayCls}"><span class="seed">${awaySeed}</span> ${away.names.short} <span class="score">${away.score}</span></span>`;
            html += `<span class="sched-team ${homeCls}"><span class="seed">${homeSeed}</span> ${home.names.short} <span class="score">${home.score}</span></span>`;
            html += `<span class="sched-status-label final-label">Final</span>`;
            html += `</div>`;
            return html;
        }

        if (state === 'live') {
            const period = game.currentPeriod || '';
            const clock = game.contestClock || '';
            let html = `<div class="sched-game live">`;
            html += `<span class="sched-team"><span class="seed">${away.seed ? '(' + away.seed + ')' : ''}</span> ${away.names.short} <span class="score">${away.score || 0}</span></span>`;
            html += `<span class="sched-team"><span class="seed">${home.seed ? '(' + home.seed + ')' : ''}</span> ${home.names.short} <span class="score">${home.score || 0}</span></span>`;
            html += `<span class="sched-live-info"><span class="live-dot"></span> LIVE — ${period} ${clock}</span>`;
            html += `</div>`;
            return html;
        }

        // pre
        let html = `<div class="sched-game upcoming">`;
        html += `<span class="sched-team"><span class="seed">${away.seed ? '(' + away.seed + ')' : ''}</span> ${away.names.short}</span>`;
        html += `<span class="sched-vs">vs</span>`;
        html += `<span class="sched-team"><span class="seed">${home.seed ? '(' + home.seed + ')' : ''}</span> ${home.names.short}</span>`;
        html += `<span class="sched-time">${game.startTime || 'TBD'}</span>`;
        html += `</div>`;
        return html;
    }

    async function loadSchedule() {
        const container = document.getElementById('schedule');
        const dateStr = formatDateNice(currentDate);
        const roundLabel = getRoundLabel(currentDate);

        // Show loading with nav intact
        let html = `<div class="sched">`;
        html += `<div class="sched-nav">`;
        html += `<button class="sched-btn" id="prevDay">&larr; Prev</button>`;
        html += `<div class="sched-title"><span class="sched-date">${dateStr}</span><span class="sched-round">${roundLabel}</span></div>`;
        html += `<button class="sched-btn" id="nextDay">Next &rarr;</button>`;
        html += `</div>`;
        html += `<div class="sched-loading">Loading games...</div>`;
        html += `</div>`;
        container.innerHTML = html;
        attachNavListeners();

        try {
            const games = await fetchGames(currentDate);
            renderGames(games, dateStr, roundLabel);
        } catch (e) {
            renderGames([], dateStr, roundLabel, 'Could not load games. Check your connection.');
        }

        // Auto-refresh every 30s
        clearInterval(refreshTimer);
        refreshTimer = setInterval(async () => {
            try {
                const games = await fetchGames(currentDate);
                renderGames(games, formatDateNice(currentDate), getRoundLabel(currentDate));
            } catch (_) { /* silent fail on refresh */ }
        }, 30000);
    }

    function renderGames(games, dateStr, roundLabel, error) {
        const container = document.getElementById('schedule');

        const finals = games.filter(g => g.gameState === 'final');
        const live = games.filter(g => g.gameState === 'live');
        const pre = games.filter(g => g.gameState === 'pre');

        let html = `<div class="sched">`;
        html += `<div class="sched-nav">`;
        html += `<button class="sched-btn" id="prevDay">&larr; Prev</button>`;
        html += `<div class="sched-title"><span class="sched-date">${dateStr}</span><span class="sched-round">${roundLabel}</span></div>`;
        html += `<button class="sched-btn" id="nextDay">Next &rarr;</button>`;
        html += `</div>`;

        if (error) {
            html += `<div class="sched-loading">${error}</div>`;
        } else if (games.length === 0) {
            html += `<div class="sched-loading">No games scheduled for this date.</div>`;
        } else {
            if (live.length) {
                html += `<h3 class="sched-heading">Live</h3>`;
                html += `<div class="sched-grid">${live.map(renderGame).join('')}</div>`;
            }
            if (pre.length) {
                html += `<h3 class="sched-heading">Upcoming</h3>`;
                html += `<div class="sched-grid">${pre.map(renderGame).join('')}</div>`;
            }
            if (finals.length) {
                html += `<h3 class="sched-heading">Final</h3>`;
                html += `<div class="sched-grid">${finals.map(renderGame).join('')}</div>`;
            }
        }

        html += `</div>`;
        container.innerHTML = html;
        attachNavListeners();
    }

    function attachNavListeners() {
        document.getElementById('prevDay').addEventListener('click', () => {
            currentDate = new Date(currentDate.getTime() - 86400000);
            loadSchedule();
        });
        document.getElementById('nextDay').addEventListener('click', () => {
            currentDate = new Date(currentDate.getTime() + 86400000);
            loadSchedule();
        });
    }

    loadSchedule();
})();
