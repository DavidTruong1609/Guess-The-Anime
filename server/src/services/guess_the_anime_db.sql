CREATE TABLE anime (
    mal_id INT PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	thumbnail VARCHAR(255),
	source VARCHAR(50),
	start_season VARCHAR(50),
	mean DECIMAL(4, 2),
	media_type VARCHAR(50)
);

CREATE TABLE anime_titles (
	id SERIAL PRIMARY KEY,
	anime_id INT NOT NULL,
	FOREIGN KEY (anime_id) REFERENCES anime(mal_id) ON DELETE CASCADE,
	title VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE genres (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE anime_genres (
	PRIMARY KEY (anime_id, genre_id),
	anime_id INT NOT NULL,
	FOREIGN KEY (anime_id) REFERENCES anime(mal_id) ON DELETE CASCADE,
	genre_id INT NOT NULL,
	FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

CREATE TABLE studios (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE anime_studios (
	PRIMARY KEY (anime_id, studio_id),
	anime_id INT NOT NULL,
	FOREIGN KEY (anime_id) REFERENCES anime(mal_id) ON DELETE CASCADE,
	studio_id INT NOT NULL,
	FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE
);

CREATE TABLE game_session (
	id SERIAL PRIMARY KEY,
	anime_id INT NOT NULL,
    FOREIGN KEY (anime_id) REFERENCES anime(mal_id) ON DELETE CASCADE
);

CREATE TABLE guesses (
    id SERIAL PRIMARY KEY,
	anime_id INT UNIQUE NOT NULL,
    FOREIGN KEY (anime_id) REFERENCES anime(mal_id) ON DELETE CASCADE,
    correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

