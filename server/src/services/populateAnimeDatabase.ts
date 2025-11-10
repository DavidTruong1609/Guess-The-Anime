import axios from "axios";
import dotenv from "dotenv";
import pool from "../config/db.ts";

dotenv.config();

interface Anime {
    id: number;
    title: string;
    main_picture: object;
}

interface AnimeDetails {
    malId: number;
    title: string;
    source: string;
    startSeason: string;
    mean: number;
    mediaType: string;
}

const headers = {
    "X-MAL-CLIENT-ID": process.env.MAL_CLIENT_ID,
}

const fetchAnime = async (limit: number): Promise<Anime[]> => {
    /**
    Fetches the top most popular anime ids and titles from the MyAnimeList API.

    @param {number} limit The number of anime to fetch from the API.
    @returns {Promise<Anime[]>} Promise of the anime ids and titles.
    */
    const url = "https://api.myanimelist.net/v2/anime/ranking";
    const params = {
        "ranking_type": "bypopularity",
        "limit": limit,
    }

    const response = await axios.get(url, { headers, params });

    return response.data.data.map((data: { node: Anime; }) => data.node); 
}

const fetchAnimeDetails = async (animeId: number): Promise<{animeDetails: AnimeDetails, animeTitles: Set<string>} | undefined> => {
    /**
    Fetches the anime details from their anime id from the MyAnimeList API.

    @param {number} animeId The MyAnimeList anime id to fetch.
    @returns {Promise<{animeDetails: AnimeDetails, animeTitles: Set<string>} | undefined>} Promise of the anime details and anime titles or undefined if fails.
    */
    const url = "https://api.myanimelist.net/v2/anime";
    const params = {
        "fields": "id, title, alternative_titles, mean, media_type, genres, start_season, source, studios"
    }

    try {
        const response = await axios.get(`${url}/${animeId}`, { headers, params });

        const animeDetails: AnimeDetails = {
            title: response.data.title,
            source: response.data.source, 
            startSeason: `${response.data.start_season.season} ${response.data.start_season.year}`,
            mean: response.data.mean,
            mediaType: response.data.media_type,
            malId: response.data.id
        }

        const animeTitles: Set<string> = new Set([...response.data.alternative_titles.synonyms])
        animeTitles.add(response.data.title)
        animeTitles.add(response.data.alternative_titles.en)

        return {animeDetails, animeTitles}
    }
    catch (error) {
        console.error('There was an error with the fetch operation:', error);
    }
}

const insertAnime = async (animeDetails: AnimeDetails[]): Promise<void> => {
    /**
    Inserts the array of anime details into the Postgresql database.

    @param {AnimeDetails[]} animeDetails The array of anime details.
    */
    try {
        for (const anime of animeDetails) {
            const {malId, title, source, startSeason, mean, mediaType} = anime

            await pool.query(
                `INSERT INTO anime (mal_id, title, source, start_season, mean, media_type) 
                VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (mal_id) 
                DO UPDATE SET 
                title = EXCLUDED.title, 
                source = EXCLUDED.source, 
                start_season = EXCLUDED.start_season, 
                mean = EXCLUDED.mean, 
                media_type = EXCLUDED.media_type`, 
                [malId, title, source, startSeason, mean, mediaType]
            )
        }
        console.log('Anime data successfully inserted into the database');
    }
    catch (error) {
        console.error('Error inserting anime data into the database: ', error);
    }
}

const insertAnimeTitles = async (animeTitles: Record<number, Set<string>>): Promise<void> => {
    /**
    Inserts all potential titles for anime into the Postgresql database.

    @param {Record<number, Set<string>>} animeTitles The key value pair store of anime ids and their titles.
    */
    try {
        for (const animeId in animeTitles) {
            const titles = animeTitles[animeId]
            if (titles) {
                for (const title of titles) {
                    await pool.query("INSERT INTO anime_titles (anime_id, title) VALUES ($1, $2) ON CONFLICT DO NOTHING", [animeId, title])
                }
            }
        }
        console.log('Anime title data successfully inserted into the database');
    }
    catch (error) {
        console.error('Error inserting anime data into the database: ', error);
    }
}

const populateDatabase = async () => {
    /**
    Populates the database with anime data.

    */
    const animeLimit = 8 // Change this limit number variable to a max of 500 to add that amount of animes to your database.

    const animeData = await fetchAnime(animeLimit); 

    const allAnimeData: AnimeDetails[] = []
    const allAnimeTitleData: Record<number, Set<string>> = {}

    for (const anime of animeData) {
        const animeDetailsResponse = await fetchAnimeDetails(anime.id)
        
        if (animeDetailsResponse) {
            const {animeDetails, animeTitles} = animeDetailsResponse

            allAnimeData.push(animeDetails)
            allAnimeTitleData[anime.id] = animeTitles

        }
    }

    await insertAnime(allAnimeData);
    await insertAnimeTitles(allAnimeTitleData)
};

populateDatabase();