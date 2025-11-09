import axios from "axios";
import dotenv from "dotenv";
import pool from "../db.ts";

dotenv.config();

interface AnimeNode {
    id: number;
    title: string;
    mainPicture: object;
}

interface AnimeDetailData {
    malId: number;
    source: string;
    startSeason: {
        year: number,
        season: string;
    };
    mean: number;
}


const url = "https://api.myanimelist.net/v2/anime";

const headers = {
    "X-MAL-CLIENT-ID": process.env.MAL_CLIENT_ID,
}

const params = {
    "fields": "id, title, alternative_titles, mean, media_type, genres, start_season, source, studios"
}

const getAnimeIds = async () => {
    try {
        const result = await pool.query("SELECT mal_id FROM anime")

        return result.rows
    }
    catch (error) {
        console.log("Error occured while trying to grab anime IDs from the database. ", error)
    }
}

const fetchAnimeDetailData = async (animeId: AnimeNode["id"]) => {
    try {
        const response = await axios.get(`${url}/${animeId}`, { headers, params });

        return response.data;
    }
    catch (error) {
        console.error('There was an error with the fetch operation:', error);
        return [];
    }
}

const insertAnimeData = async (animeData: AnimeDetailData): Promise<void> => {
    try {
        const {source, startSeason, mean, malId} = animeData
        const formattedStartSeason = `${startSeason.season} ${startSeason.year}`

        await pool.query("UPDATE anime SET source = $1, start_season = $2, mean = $3 WHERE mal_id = $4", [source, formattedStartSeason, mean, malId])

        console.log('Anime data successfully inserted into the database');
    }
    catch (error) {
        console.error('Error inserting anime data into the database: ', error);
    }
}

const populateDatabase = async () => {
    try {
        const animeIds =  await getAnimeIds();

        if (animeIds) {
            for (const animeId of animeIds) {
                console.log(animeId.mal_id)
                const animeDetails = await fetchAnimeDetailData(animeId.mal_id)
                const animeDetailData: AnimeDetailData = {
                    source: animeDetails.source, 
                    startSeason: animeDetails.start_season,
                    mean: animeDetails.mean,
                    malId: animeId.mal_id
                }
                await insertAnimeData(animeDetailData)

            }
        }
        
    } 
    catch (error) {
        console.error("Error fetching anime data:", error);
    }
};

populateDatabase();