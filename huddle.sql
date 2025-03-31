
-- Users table
CREATE TABLE users (
	    user_id INT AUTO_INCREMENT PRIMARY KEY,
	    username VARCHAR(50) UNIQUE NOT NULL,
	    email VARCHAR(100) UNIQUE NOT NULL,
	    password_hash VARCHAR(255) NOT NULL,
	    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leagues table
CREATE TABLE leagues (
	    league_id INT AUTO_INCREMENT PRIMARY KEY,
	    name VARCHAR(100) NOT NULL,
	    commissioner_id INT NOT NULL,
	    max_teams INT DEFAULT 10,
	    draft_date DATETIME,
	    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	    FOREIGN KEY (commissioner_id) REFERENCES users(user_id)
);
-- Teams table with unique constraint for one team per user per league
CREATE TABLE teams (
	    team_id INT AUTO_INCREMENT PRIMARY KEY,
	    name VARCHAR(100) NOT NULL,
	    user_id INT NOT NULL,
	    league_id INT NOT NULL,
	    points_total DECIMAL(10,2) DEFAULT 0,
	    waiver_position INT,
	    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	    UNIQUE (user_id, league_id),  -- Critical constraint for one team per user per league
	    FOREIGN KEY (user_id) REFERENCES users(user_id),
	    FOREIGN KEY (league_id) REFERENCES leagues(league_id)
);
-- Players table (real-world NFL players)
CREATE TABLE players (
	    player_id INT AUTO_INCREMENT PRIMARY KEY,
	    name VARCHAR(100) NOT NULL,
	    position VARCHAR(10) NOT NULL,  -- QB, RB, WR, TE, K, DEF
	    nfl_team VARCHAR(50),  -- NFL team abbreviation (KC, SF, etc.)
	    status VARCHAR(20),  -- Active, Injured, Suspended, etc.
	    fantasy_points DECIMAL(10,2) DEFAULT 0,
	    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- League rosters (assigns players to teams within a league)
CREATE TABLE rosters (
	    roster_id INT AUTO_INCREMENT PRIMARY KEY,
	    league_id INT NOT NULL,
	    player_id INT NOT NULL,
	    team_id INT NULL,  -- NULL means player is a free agent
	    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	    UNIQUE (league_id, player_id),  -- A player can only be in a league once
	    FOREIGN KEY (league_id) REFERENCES leagues(league_id),
	    FOREIGN KEY (player_id) REFERENCES players(player_id),
	    FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

-- Transactions table (tracks adds, drops, trades)
CREATE TABLE transactions (
	    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
	    type VARCHAR(20) NOT NULL,  -- 'add', 'drop', 'trade', 'waiver'
	    league_id INT NOT NULL,
	    player_id INT NOT NULL,
	    from_team_id INT NULL,  -- NULL means from free agents
	    to_team_id INT NULL,    -- NULL means dropped to free agents
	    process_date DATETIME DEFAULT CURRENT_TIMESTAMP,
	    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	    FOREIGN KEY (league_id) REFERENCES leagues(league_id),
	    FOREIGN KEY (player_id) REFERENCES players(player_id),
	    FOREIGN KEY (from_team_id) REFERENCES teams(team_id),
	    FOREIGN KEY (to_team_id) REFERENCES teams(team_id)
);
