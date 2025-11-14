import { useEffect, useState } from 'react'

import axios from "axios"
import { LuChevronsDown, LuChevronsUp } from 'react-icons/lu';
import { ImArrowDown, ImArrowUp } from "react-icons/im";

function App() {
  interface AnimeTitle {
    animeId: number;
    title: string;
  }

  interface AnimeGuess {
    animeId: number;
    correct: boolean;
    title: string;
    source: string;
    startSeason: string;
    mean: number;
    mediaType: string;
    genres: string[];
    studios: string[];
  }

  interface AnimeDetails {
    malId: number;
    title: string;
    source: string;
    startSeason: string;
    mean: number;
    mediaType: string;
    genres: string[];
    studios: string[];
  } 

  const [search, setSearch] = useState("")
  const [animeTitles, setAnimeTitles] = useState<AnimeTitle[]>([]);
  const [animeSearchTitles, setAnimeSearchTitles] = useState<AnimeTitle[]>([]);
  const [randomAnime, setRandomAnime] = useState<AnimeDetails>()

  const [animeGuessId, setAnimeGuessId] = useState<number | null>()
  const [animeGuesses, setAnimeGuesses] = useState<AnimeGuess[]>([])

  const [gameEnded, setgameEnded] = useState<boolean>(false)

  const getAnimeTitles = async () => {
    try {
      const res = await axios.get("https://w2g7jzzm-5000.aue.devtunnels.ms/anime-titles")
      setAnimeTitles(res.data)
    }
    catch (error) {
      console.error(error)
    }
  }

  const getGuesses = async () => {
    try {
      const res = await axios.get("https://w2g7jzzm-5000.aue.devtunnels.ms/guess/get-guesses")
      setAnimeGuesses(res.data)
    }
    catch (error) {
      console.error(error)
    }
  }

  const getRandomAnime = async (): Promise<AnimeDetails | undefined> => {
    try {
      const res = await axios.get("https://w2g7jzzm-5000.aue.devtunnels.ms/random-anime")
      setRandomAnime(res.data)
      console.log(`The answer is ${res.data.malId}: ${res.data.title}.`)
      return res.data
    }
    catch (error) {
      console.error(error)
    }
  }

  const getGameSession = async () => {
    try {
      const sessionResponse = await axios.get("https://w2g7jzzm-5000.aue.devtunnels.ms/session/get-session")

      if (sessionResponse.data) {
        const animeDetailsResponse = await axios.get("https://w2g7jzzm-5000.aue.devtunnels.ms/anime", {
          params: {
            animeId: sessionResponse.data.animeId,
          }
        })

        await getGuesses()

        setgameEnded(false)

        setRandomAnime(animeDetailsResponse.data)

        console.log(`The answer is ${animeDetailsResponse.data.malId}: ${animeDetailsResponse.data.title}.`)
      }
      else {
        await handleNewGame()
      }
    }
    catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([getAnimeTitles(), getGameSession()]);
      } 
      catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearch(searchValue);

    if (searchValue.trim() === "") {
      setAnimeSearchTitles([]);
    } 
    else {
      const filtered = animeTitles.filter((anime) => anime.title.toLowerCase().includes(searchValue.toLowerCase()));
      setAnimeSearchTitles(filtered.slice(0, 10));
    }
  };

  const handleSuggestionClick = (animeTitle: AnimeTitle) => {
    setSearch(animeTitle.title);
    setAnimeSearchTitles([]);
    setAnimeGuessId(animeTitle.animeId)
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!animeGuessId) {
      console.error("No anime selected for guessing.");
      return;
    }

    try {
      const guess = await axios.post("https://w2g7jzzm-5000.aue.devtunnels.ms/guess/post-guess", {animeId: animeGuessId})
      setgameEnded(guess.data.correct)
      setSearch("")
      setAnimeSearchTitles([])
      setAnimeGuessId(null)
      getGuesses()
    }
    catch (error) {
      console.error(error)
    }
  }

  const handleNewGame = async () => {
    try {
      await axios.delete("https://w2g7jzzm-5000.aue.devtunnels.ms/guess/delete-guesses")
      setAnimeGuesses([])
      const randomAnime = await getRandomAnime()
      if (randomAnime) {
        await axios.delete("https://w2g7jzzm-5000.aue.devtunnels.ms/session/delete-session")
        await axios.post("https://w2g7jzzm-5000.aue.devtunnels.ms/session/post-session", {animeId: randomAnime.malId})
        setRandomAnime(randomAnime)
        setgameEnded(false)
      }
    }
    catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className="bg-cover min-h-screen">
        <div className="flex justify-end">
          <button onClick={handleNewGame}>New Game</button>
        </div>

        <div className="flex flex-col items-center min-h bg-neutral-500">
          <div className="text-white">
            <h1>Guess The Anime</h1>
          </div>
          <div className="">
            <form onSubmit={onSubmit}>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Guess anime..."
                disabled={gameEnded}
              />
              <button
                type="submit"
                disabled={gameEnded}
              >Guess</button>
            </form>
          </div>
          <div>
            {animeSearchTitles.length === 0 ? (
              <div></div>
            ) : (
              <div className="bg-stone-500">
                {animeSearchTitles.map((animeTitle) => (
                  <div
                    key={animeTitle.title}
                    onClick={() => handleSuggestionClick(animeTitle)}
                  >
                    <h5>{animeTitle.title}</h5>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          {animeGuesses.length === 0 ? (
            <div>no guesses</div>
          ) : (
            <div className="pt-24 w-2/3">

              <div className="rounded-xl grid grid-cols-8 p-3 bg-blue-400">
                <div className="font-bold text-xl col-span-2">Title</div>
                <div className="font-bold text-xl">Start Season</div>
                <div className="font-bold text-xl">Genre/s</div>
                <div className="font-bold text-xl">Studio/s</div>
                <div className="font-bold text-xl">Source</div>
                <div className="font-bold text-xl">Media Type</div>
                <div className="font-bold text-xl">Score</div>
              </div>

              <div className="py-3">
                {animeGuesses.map((animeGuess) => {
                  return (
                    <div className="rounded-xl grid grid-cols-8 bg-blue-200 p-3 my-3 opacity-95">
                      <div className={`font-bold flex items-center text-lg col-span-2 ${animeGuess.correct ? "text-green-500" : "text-red-500"}`}
                      >{animeGuess.title}</div>
                      <div className="font-bold flex items-center">{animeGuess.startSeason}</div>
                      <div className="font-bold flex items-center">
                        <div>
                          {animeGuess.genres.map((genre) => (
                            <div
                              key={genre}
                              className={randomAnime?.genres.includes(genre) ? "text-green-500" : "text-red-500"}
                            >{genre}</div>
                          ))}
                        </div>
                      </div>
                      <div className="font-bold flex items-center">
                          {animeGuess.studios.map((studio) => (
                            <div 
                              key={studio}
                              className={randomAnime?.studios.includes(studio) ? "text-green-500" : "text-red-500"}
                            >{studio}</div>
                          ))}
                      </div>
                      <div 
                        className={`font-bold flex items-center ${animeGuess.source == randomAnime?.source ? "text-green-500" : "text-red-500"}`} 
                      >{animeGuess.source}</div>
                      <div 
                        className={`font-bold flex items-center ${animeGuess.mediaType == randomAnime?.mediaType ? "text-green-500" : "text-red-500"}`}
                      >{animeGuess.mediaType}</div>
                      <div className={`relative ${animeGuess.mean == randomAnime?.mean ? "text-green-500" : "text-red-500"}`}>
                        <div className="absolute inset-0 flex justify-center items-center z-10 text-lg font-bold">{animeGuess.mean}</div>
                        <div className="absolute inset-0 flex justify-center items-center z-0 text-6xl opacity-25">
                          {randomAnime?.mean !== undefined && (
                            animeGuess.mean > randomAnime.mean ? (
                              <ImArrowDown/>
                            ) : animeGuess.mean < randomAnime.mean ? (
                              <ImArrowUp/>
                            ) : null)}
                        </div>
                      </div>
                    </div>
                  )}
                )}
              </div>
              
            </div>
          )}
          
        </div>

      </div>
    </>
  )
}

export default App
