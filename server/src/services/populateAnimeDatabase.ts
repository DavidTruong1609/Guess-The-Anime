import axios from "axios";
import dotenv from "dotenv";
import pool from "../db.ts";

dotenv.config();

interface AnimeNode {
    id: number;
    title: string;
    main_picture: object;
}

interface AnimeRanking {
    ranking: number;
}

interface AnimeData {
    node: AnimeNode;
    ranking: AnimeRanking;
}

const url = "https://api.myanimelist.net/v2/anime/ranking";

const headers = {
    "X-MAL-CLIENT-ID": process.env.MAL_CLIENT_ID,
}

const params = {
    "ranking_type": "bypopularity", // Filtered by the top most popular anime on MyAnimeList.
    "limit": 5, // Change this limit number variable to a max of 500 to add that amount of animes to your database.
}

const fetchAnimeData = async () => {
    try {
        const response = await axios.get(url, { headers, params });

        return response.data.data;
    }
    catch (error) {
        console.error('There was an error with the fetch operation:', error);
        return [];
    }
}

const insertAnimeData = async (animeData: AnimeData[]): Promise<void> => {
    try {
        for (const anime of animeData) {
            const {id, title} = anime.node

            await pool.query("INSERT INTO anime (mal_id, title) VALUES ($1, $2)", [id, title])
        }
        console.log('Anime data successfully inserted into the database');
    }
    catch (error) {
        console.error('Error inserting anime data into the database: ', error);
    }
}

const populateDatabase = async () => {
    try {
        const animeData = await fetchAnimeData(); 
        console.log(animeData); 
        console.log(animeData.length)

        await insertAnimeData(animeData);
    } 
    catch (error) {
        console.error("Error fetching anime data:", error);
    }
};

populateDatabase();