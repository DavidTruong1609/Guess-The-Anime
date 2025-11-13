import { useEffect, useState } from 'react'

import axios from "axios"

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
      const guess = await axios.post("http://localhost:5000/guess/post-guess", {animeId: animeGuessId})
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
      await axios.delete("http://localhost:5000/guess/delete-guesses")
      setAnimeGuesses([])
      const randomAnime = await getRandomAnime()
      if (randomAnime) {
        await axios.delete("http://localhost:5000/session/delete-session")
        await axios.post("http://localhost:5000/session/post-session", {animeId: randomAnime.malId})
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
      <div>
        <div className="new-game-div">
          <button onClick={handleNewGame}>New Game</button>
        </div>

        <div className="title-div">
          <h1>Guess The Anime</h1>
        </div>

        <div>
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
            <div>
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

        <div>
          <h2>GUESSES</h2>
          {animeGuesses.length === 0 ? (
            <div>no guesses</div>
          ) : (
            <div>

              <table className="guess-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Start Season</th>
                    <th>Genre/s</th>
                    <th>Studio/s</th>
                    <th>Source</th>
                    <th>Media Type</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {animeGuesses.map((animeGuess) => {
                    return (
                      <tr key={animeGuess.animeId}>
                        <td style={{color: animeGuess.correct ? "green" : "red"}}>{animeGuess.title}</td>
                        <td>{animeGuess.startSeason}</td>
                        <td>{animeGuess.genres}</td>
                        <td>{animeGuess.studios}</td>
                        <td style={{color: animeGuess.source == randomAnime?.source ? "green": "red"}}>{animeGuess.source}</td>
                        <td style={{color: animeGuess.mediaType == randomAnime?.mediaType ? "green" : "red"}}>{animeGuess.mediaType}</td>
                        <td>{animeGuess.mean}</td>
                      </tr>
                    )}
                  )}
                </tbody>
              </table>
                
            </div>
          )}
          
        </div>

      </div>
    </>
  )
}

export default App
