import { useEffect, useState } from 'react'

import axios from "axios"
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

  const [gameEnded, setGameEnded] = useState<boolean>(false)

  const getAnimeTitles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/anime-titles")
      setAnimeTitles(res.data)
    }
    catch (error) {
      console.error(error)
    }
  }

  const getGuesses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/guess/get-guesses")
      setAnimeGuesses(res.data)
      return res.data
    }
    catch (error) {
      console.error(error)
    }
  }

  const getRandomAnime = async (): Promise<AnimeDetails | undefined> => {
    try {
      const res = await axios.get("http://localhost:5000/random-anime")
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
      const sessionResponse = await axios.get("http://localhost:5000/session/get-session")

      if (sessionResponse.data) {
        const animeDetailsResponse = await axios.get("http://localhost:5000/anime", {
          params: {
            animeId: sessionResponse.data.animeId,
          }
        })

        const allGuesses: AnimeGuess[] = await getGuesses()

        if (allGuesses.some(guess => guess.correct === true)) {
          setGameEnded(true)
        } else {
          setGameEnded(false)
        }

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
      const guess = await axios.post("http://localhost:5000/guess/post-guess", {animeId: animeGuessId})
      setGameEnded(guess.data.correct)
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
      await axios.delete("http://localhost:5000/guess/delete-guesses")
      setAnimeGuesses([])
      const randomAnime = await getRandomAnime()
      if (randomAnime) {
        await axios.delete("http://localhost:5000/session/delete-session")
        await axios.post("http://localhost:5000/session/post-session", {animeId: randomAnime.malId})
        setRandomAnime(randomAnime)
        setGameEnded(false)
      }
    }
    catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className="bg-cover min-h-screen bg-neutral-800 bg-fixed">

        <div className="flex justify-end p-2">
          <button 
            onClick={handleNewGame}
            className="rounded-3xl bg-neutral-500 px-4 py-2 font-bold text-white cursor-pointer hover:bg-neutral-300 hover:text-neutral-700"
          >New Game</button>
        </div>

        <div className="flex justify-center items-center py-6">

          <div className="w-1/3 bg-neutral-300 rounded-2xl text-center py-6 opacity-95 border-6 border-neutral-500">

            <div className="text-white font-bold text-6xl py-6 px-2">
              <h1>Guess The Anime</h1>
            </div>

            <div className="py-6 px-2">

              <div className="">
                <form onSubmit={onSubmit}>
                  <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Guess anime..."
                    disabled={gameEnded}
                    className="bg-white px-4 py-2 w-1/2 rounded-4xl mx-2 font-bold"
                  />
                  <button
                    type="submit"
                    disabled={gameEnded}
                    className="bg-linear-to-r from-violet-500 to-blue-500 px-6 py-2 rounded-4xl text-lg mx-2 text-white font-bold cursor-pointer hover:bg-neutral-200 hover:text-neutral-800"
                  >Guess</button>
                </form>
              </div>
              
              <div>
                {animeSearchTitles.length === 0 ? (
                  <div></div>
                ) : (
                  <div className="bg-neutral-500">
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

          </div>

        </div>

        <div className="flex justify-center py-6">
          {animeGuesses.length === 0 ? (
            <div></div>
          ) : (
            <div className="w-[1392px]">

              <div className="font-[Inter] grid grid-cols-8 gap-6 pb-3">
                <div className="text-base py-3 px-8 bg-neutral-100 text-center rounded-4xl col-span-2">Title</div>
                <div className="text-base py-3 px-8 bg-neutral-100 text-center rounded-4xl">Premiered</div>
                <div className="text-base py-3 px-8 bg-neutral-100 text-center rounded-4xl">Genre/s</div>
                <div className="text-base py-3 px-8 bg-neutral-100 text-center rounded-4xl">Studio/s</div>
                <div className="text-base py-3 px-8 bg-neutral-100 text-center rounded-4xl">Source</div>
                <div className="text-base py-3 px-8 bg-neutral-100 text-center rounded-4xl">Media Type</div>
                <div className="text-base py-3 px-8 bg-neutral-100 text-center rounded-4xl">Score</div>
              </div>

              <div className="">
                {animeGuesses.map((animeGuess) => {
                  return (
                    <div className="mt-3 p-0.5 bg-linear-to-r from-violet-500 to-blue-500 rounded-xl">
                      <div
                        key={animeGuess.animeId}
                        className={`min-h-24 rounded-xl grid grid-cols-8 p-3 bg-neutral-700`}>
                        <div className={`font-bold flex items-center text-lg col-span-2 ${animeGuess.correct ? "text-emerald-400" : "text-red-400"}`}
                        >
                          <img src="https://cdn.myanimelist.net/images/anime/10/78745l.webp" className="h-24 px-4"></img>
                          {animeGuess.title}
                          </div>
                        <div className="relative flex items-center">
                          <div className="absolute inset-0 flex justify-center items-center z-10 text-lg">
                            <div
                              className={`${randomAnime?.startSeason.includes(animeGuess.startSeason.split(" ")[0]) ? "text-emerald-400" : "text-red-400"}`}
                            >{animeGuess.startSeason.split(" ")[0].charAt(0).toUpperCase() + animeGuess.startSeason.split(" ")[0].slice(1)}</div>
                            <span>&nbsp;</span>
                            <div
                              className={`${randomAnime?.startSeason.includes(animeGuess.startSeason.split(" ")[1]) ? "text-emerald-400" : "text-red-400"}`}
                            >{animeGuess.startSeason.split(" ")[1]}</div>
                          </div>
                          <div className="absolute inset-0 flex justify-center items-center z-0 text-6xl opacity-25 text-red-400">
                            {randomAnime?.startSeason !== undefined && (
                              parseInt(animeGuess.startSeason.split(" ")[1]) > parseInt(randomAnime.startSeason.split(" ")[1]) ? (
                                <ImArrowDown/>
                              ) : parseInt(animeGuess.startSeason.split(" ")[1]) < parseInt(randomAnime.startSeason.split(" ")[1]) ? (
                                <ImArrowUp/>
                              ) : null)}
                          </div>
                        </div>
                        <div className="flex justify-center items-center text-center">
                          <div>
                            {animeGuess.genres.map((genre) => (
                              <div
                                key={genre}
                                className={randomAnime?.genres.includes(genre) ? "text-emerald-400" : "text-red-400"}
                              >{genre}</div>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-center items-center text-center">
                            <div>
                              {animeGuess.studios.map((studio) => (
                                <div
                                  key={studio}
                                  className={randomAnime?.studios.includes(studio) ? "text-emerald-400" : "text-red-400"}
                                >{studio}</div>
                              ))}
                            </div>
                        </div>
                        <div
                          className={`flex justify-center items-center ${animeGuess.source == randomAnime?.source ? "text-emerald-400" : "text-red-400"}`}
                        >{animeGuess.source.charAt(0).toUpperCase() + animeGuess.source.slice(1).replace(/_/g, " ")}</div>
                        <div
                          className={`flex justify-center items-center ${animeGuess.mediaType == randomAnime?.mediaType ? "text-emerald-400" : "text-red-400"}`}
                        >{animeGuess.mediaType}</div>
                        <div className={`relative ${animeGuess.mean == randomAnime?.mean ? "text-emerald-400" : "text-red-400"}`}>
                          <div className="absolute inset-0 flex justify-center items-center z-10 text-lg">{animeGuess.mean}</div>
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
