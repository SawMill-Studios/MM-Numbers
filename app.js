(() => {
    const ROUNDS = ['pink', 'blue', 'green', 'purple', 'red'];
    const ROUND_LABELS = ['R32', 'S16', 'E8', 'F4', 'FIN'];
    const ROUND_TITLES = ['Second Round', 'Sweet 16', 'Elite 8', 'Final Four', 'National Championship'];

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
    const WIN_TRACKING_START = new Date(2026, 2, 20); // March 20, 2026

    const board = document.getElementById('board');
    const squareEls = new Map();

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

            const name = document.createElement('span');
            name.className = 'cell-name-text';
            name.textContent = NAMES[row][col];

            const winPills = document.createElement('div');
            winPills.className = 'cell-win-pills';

            cell.appendChild(name);
            cell.appendChild(winPills);
            cell.title = `#${squareNum} — ${NAMES[row][col]}`;
            board.appendChild(cell);
            squareEls.set(squareNum, { cell, winPills, name: NAMES[row][col] });
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

    const ROUND_INDEX_BY_TITLE = {
        'Second Round': 0,
        'Sweet 16': 1,
        'Elite 8': 2,
        'Final Four': 3,
        'National Championship': 4,
    };

    const scoreboardCache = new Map();

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

    function addDays(date, days) {
        const next = new Date(date);
        next.setDate(next.getDate() + days);
        return next;
    }

    function getDatesThroughToday(startDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dates = [];
        let cursor = new Date(startDate);
        cursor.setHours(0, 0, 0, 0);

        while (cursor <= today) {
            dates.push(new Date(cursor));
            cursor = addDays(cursor, 1);
        }

        return dates;
    }

    function buildScoreboardUrls(date) {
        const ncaaUrl = `${API_BASE}/${dateToApi(date)}/all-conf`;
        return [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(ncaaUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(ncaaUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(ncaaUrl)}`,
        ];
    }

    async function fetchScoreboard(date) {
        const key = dateToApi(date);
        if (scoreboardCache.has(key)) return scoreboardCache.get(key);

        const fetchPromise = (async () => {
            for (const url of buildScoreboardUrls(date)) {
                try {
                    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
                    if (res.ok) {
                        return await res.json();
                    }
                } catch (_) {
                    // try next proxy
                }
            }
            return { games: [] };
        })();

        scoreboardCache.set(key, fetchPromise);
        return fetchPromise;
    }

    async function fetchGames(date) {
        const data = await fetchScoreboard(date);
        return (data.games || [])
            .map(g => g.game)
            .filter(g => g?.championshipId && g?.championshipGame?.round);
    }

    function getSquareForDigits(roundIndex, winnerDigit, loserDigit) {
        const row = LEFT[roundIndex].findIndex(n => n === loserDigit);
        const col = TOP[roundIndex].findIndex(n => n === winnerDigit);

        if (row === -1 || col === -1) return null;
        return row * 10 + col + 1;
    }

    function createWinPill(roundIndex, gameTitle) {
        const pill = document.createElement('span');
        pill.className = `win-pill ${ROUNDS[roundIndex]}`;
        pill.textContent = 'Win';
        pill.title = gameTitle ? `${ROUND_TITLES[roundIndex]} — ${gameTitle}` : ROUND_TITLES[roundIndex];
        return pill;
    }

    async function loadCompletedWins() {
        try {
            const winsBySquare = new Map();
            const dates = getDatesThroughToday(WIN_TRACKING_START);
            const allGames = await Promise.all(dates.map(fetchGames));

            allGames.flat().forEach(game => {
                if (game.gameState !== 'final') return;

                const roundTitle = game.championshipGame?.round?.title;
                const roundIndex = ROUND_INDEX_BY_TITLE[roundTitle];
                if (roundIndex === undefined) return;

                const homeScore = parseInt(game.home?.score, 10);
                const awayScore = parseInt(game.away?.score, 10);
                if (Number.isNaN(homeScore) || Number.isNaN(awayScore) || homeScore === awayScore) return;

                const winnerScore = Math.max(homeScore, awayScore);
                const loserScore = Math.min(homeScore, awayScore);
                const squareNum = getSquareForDigits(roundIndex, winnerScore % 10, loserScore % 10);
                if (!squareNum) return;

                if (!winsBySquare.has(squareNum)) winsBySquare.set(squareNum, []);
                winsBySquare.get(squareNum).push({
                    roundIndex,
                    title: game.title || `${game.away?.names?.short || 'Away'} vs ${game.home?.names?.short || 'Home'}`,
                });
            });

            squareEls.forEach(({ cell, winPills, name }, squareNum) => {
                winPills.innerHTML = '';
                const wins = winsBySquare.get(squareNum) || [];
                if (wins.length) {
                    cell.classList.add('has-win');
                    cell.title = `#${squareNum} — ${name} — ${wins.length} win${wins.length === 1 ? '' : 's'} so far`;
                    wins
                        .sort((a, b) => a.roundIndex - b.roundIndex)
                        .forEach(win => winPills.appendChild(createWinPill(win.roundIndex, win.title)));
                } else {
                    cell.classList.remove('has-win');
                    cell.title = `#${squareNum} — ${name}`;
                }
            });
        } catch (_) {
            // Keep the board usable even if win hydration fails.
        }
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

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let refreshTimer = null;

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
                await loadCompletedWins();
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
    loadCompletedWins();
})();
