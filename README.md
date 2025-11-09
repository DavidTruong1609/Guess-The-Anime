# Guess the Anime App

Welcome to **Guess the Anime** — a fun and engaging game where users try to guess the anime title based on limited information! Players must guess the anime blindly, and if their guess is incorrect, they will be given additional hints including the anime's genres, studio, MyAnimeList score, and more, until they guess the correct anime.

## Features

- **Blind Guessing**: Users must guess the name of the anime without any image or initial clue.
- **Hints**: For each incorrect guess, users will be shown additional hints, such as:
  - Anime genres
  - Studio
  - MyAnimeList score
  - Release year
- **Database Integration**: The app fetches anime information from a PostgreSQL database.
- **Leaderboard**: Track high scores and see how quickly users can guess the anime.

## Tech Stack

- **Frontend**:
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL
- **API**: [MyAnimeList API](https://myanimelist.net/apiconfig/references/api/v2) (Beta ver. 2 at time of creation)
- **Styling**:
- **State Management**:

## Installation

Follow these steps to run the app locally on your machine.

### Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (>=14.x.x)
- npm or yarn (package manager)
- PostgreSQL (local or hosted instance)

### Frontend Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/Guess-The-Anime.git
    cd guess-the-anime
    ```

2. Navigate to the frontend directory and install dependencies:

    ```bash
    cd frontend
    npm install
    ```

3. Start the React development server:

    ```bash
    npm start
    ```

   The app should now be running at `http://localhost:3000`.

### Backend Setup

1. Navigate to the backend directory:

    ```bash
    cd backend
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Set up the PostgreSQL database (make sure you have PostgreSQL running). You will need to configure the database connection in `backend/config/db.js` or your configuration file.

4. Create a `.env` file in the backend folder with the following:

    ```env
    DB_HOST=your-database-host
    DB_PORT=your-database-port
    DB_USER=your-database-user
    DB_PASSWORD=your-database-password
    DB_NAME=your-database-name
    ```

5. Run the backend server:

    ```bash
    npm run dev
    ```

    The backend server should be running at `http://localhost:5000`.

### Database Setup

Make sure to run any database migrations or schema creation scripts provided in the backend folder to set up the necessary tables and structure.

```bash
# Example:
npm run migrate
