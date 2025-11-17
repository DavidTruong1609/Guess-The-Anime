import { useEffect, useState } from 'react'

import axios from "axios"
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";

function App() {
  interface AnimeTitle {
    animeId: number;
    title: string;
  }

  interface AnimeGuess {
    animeId: number;
    correct: boolean;
    title: string;
    thumbnail: string;
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
      const res = await axios.get("http://localhost:5000/guess/guesses")
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
      const sessionResponse = await axios.get("http://localhost:5000/session/")

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
      setAnimeSearchTitles(filtered.slice(0, 15));
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
      const guess = await axios.post("http://localhost:5000/guess/", {animeId: animeGuessId})
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
      await axios.delete("http://localhost:5000/guess/")
      setAnimeGuesses([])
      const randomAnime = await getRandomAnime()
      if (randomAnime) {
        await axios.delete("http://localhost:5000/session/")
        await axios.post("http://localhost:5000/session/", {animeId: randomAnime.malId})
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

        <div className="flex justify-end p-6">
          <button 
            onClick={handleNewGame}
            className="rounded-4xl bg-linear-to-r from-violet-500 to-blue-500 px-6 py-3 font-bold text-neutral-100 cursor-pointer hover:text-neutral-800"
          >New Game</button>
        </div>



        <div className="font-[Inter] text-neutral-100 font-semibold text-5xl text-center my-6">
          <h1>Guess The Anime</h1>
        </div>

        <div className="flex justify-center items-center pb-[30px]">

          <div className="w-1/2">

            <form 
              onSubmit={onSubmit}
              className="flex justify-center">

              <div className="relative w-1/2 mx-6">
                <div className="p-0.5 bg-linear-to-r from-violet-500 to-blue-500 rounded-4xl">
                  <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Guess anime..."
                    disabled={gameEnded}
                    className="bg-neutral-100 px-6 py-3 w-full rounded-4xl font-[Inter] focus:outline-none"
                  />
                </div>
                <div className="w-full absolute ">
                  {animeSearchTitles.length === 0 ? (
                    <div></div>
                  ) : (
                    <div className="bg-neutral-100 rounded-lg font-[Inter] text-neutral-800 text-center">
                      {animeSearchTitles.map((animeTitle) => (
                        <div
                          key={animeTitle.title}
                          onClick={() => handleSuggestionClick(animeTitle)}
                          className="hover:bg-neutral-300 px-2 py-1 transition"
                        >
                          <h5>{animeTitle.title}</h5>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={gameEnded}
                className="bg-linear-to-r from-violet-500 to-blue-500 px-6 py-3 rounded-4xl text-neutral-100 font-bold cursor-pointer hover:text-neutral-800"
              >Guess</button>

            </form>

          </div>

        </div>



        <div className="flex justify-center my-[30px]">
          <hr className="w-[1392px] rounded-4xl p-px bg-linear-to-r from-violet-500 to-blue-500"></hr>
        </div>

        <div className="flex justify-center pb-6 pt-[30px]">
          {animeGuesses.length === 0 ? (
            <div></div>
          ) : (
            <div className="w-[1392px]">

              <div className="font-[Inter] grid grid-cols-8 gap-6 pb-3 text-neutral-800">
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
                    <div
                      key={animeGuess.animeId}
                      className="mt-3 p-0.5 bg-linear-to-r from-violet-500 to-blue-500 rounded-xl">
                      <div
                        key={animeGuess.animeId}
                        className="font-[Inter] text-base rounded-xl grid grid-cols-8 min-h-32 bg-neutral-700 hover:bg-neutral-600">
                        <div className={`font-bold flex items-center col-span-2 ${animeGuess.correct ? "text-emerald-400 font-bold" : "text-red-400"}`}
                        >
                          <img src={animeGuess.thumbnail} className="h-26 px-4"></img>
                          {animeGuess.title}
                          </div>
                        <div className="flex justify-center items-center">
                          <div className="flex justify-center items-center">
                            <div
                              className={randomAnime?.startSeason.includes(animeGuess.startSeason.split(" ")[0]) ? "text-emerald-400 font-bold" : "text-red-400"}
                            >{animeGuess.startSeason.split(" ")[0].charAt(0).toUpperCase() + animeGuess.startSeason.split(" ")[0].slice(1)}</div>
                            <span>&nbsp;</span>
                            <div
                              className={randomAnime?.startSeason.includes(animeGuess.startSeason.split(" ")[1]) ? "text-emerald-400 font-bold" : "text-red-400"}
                            >{animeGuess.startSeason.split(" ")[1]}</div>
                          </div>
                          <span>&nbsp;</span>
                          <div className="text-2xl text-red-400">
                            {randomAnime?.startSeason !== undefined && (
                              parseInt(animeGuess.startSeason.split(" ")[1]) > parseInt(randomAnime.startSeason.split(" ")[1]) ? (
                                <MdArrowDownward/>
                              ) : parseInt(animeGuess.startSeason.split(" ")[1]) < parseInt(randomAnime.startSeason.split(" ")[1]) ? (
                                <MdArrowUpward/>
                              ) : null)}
                          </div>
                        </div>
                        <div className="flex justify-center items-center text-center py-3">
                          <div>
                            {animeGuess.genres.map((genre) => (
                              <div
                                key={genre}
                                className={randomAnime?.genres.includes(genre) ? "text-emerald-400 font-bold" : "text-red-400"}
                              >{genre}</div>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-center items-center text-center">
                            <div>
                              {animeGuess.studios.map((studio) => (
                                <div
                                  key={studio}
                                  className={randomAnime?.studios.includes(studio) ? "text-emerald-400 font-bold" : "text-red-400"}
                                >{studio}</div>
                              ))}
                            </div>
                        </div>
                        <div
                          className={`flex justify-center items-center ${animeGuess.source == randomAnime?.source ? "text-emerald-400 font-bold" : "text-red-400"}`}
                        >{animeGuess.source.split("_").map((word, index, array) => (
                          index === array.length - 1 ? word.charAt(0).toUpperCase() + word.slice(1) : word.charAt(0).toUpperCase() + word.slice(1) + " "
                        ))}</div>
                        <div
                          className={`flex justify-center items-center ${animeGuess.mediaType == randomAnime?.mediaType ? "text-emerald-400 font-bold" : "text-red-400"}`}
                        >{animeGuess.mediaType.length < 3 ? animeGuess.mediaType.toUpperCase() : animeGuess.mediaType.charAt(0).toUpperCase() + animeGuess.mediaType.slice(1)}</div>
                        <div className={`flex justify-center items-center ${animeGuess.mean == randomAnime?.mean ? "text-emerald-400 font-bold" : "text-red-400"}`}>
                          <div>{animeGuess.mean}</div>
                          <span>&nbsp;</span>
                          <div className="text-2xl">
                            {randomAnime?.mean !== undefined && (
                              animeGuess.mean > randomAnime.mean ? (
                                <MdArrowDownward/>
                              ) : animeGuess.mean < randomAnime.mean ? (
                                <MdArrowUpward/>
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
