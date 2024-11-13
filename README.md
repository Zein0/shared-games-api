# Games API - Xbox Ultimate & PlayStation Plus Deluxe

Welcome to the **Games API**! This project is designed to help users find games that are available on both Xbox Ultimate Game Pass and PlayStation Plus Deluxe subscription services. The API provides an easy way to access and share game details across these platforms, making it simpler for gamers to discover games that are available to play on both services.

## Features

- Fetch games available on **Xbox Ultimate Game Pass**.
- Fetch games available on **PlayStation Plus Deluxe**.
- Retrieve game information such as title, image, and platform tags.
- Store game information in **Redis** for faster retrieval.

## Technologies Used

- **Node.js**: Backend JavaScript runtime.
- **Express**: Framework for building the REST API.
- **Redis**: Used for caching game data to reduce API call latency.
- **Axios**: To make HTTP requests to third-party APIs.
- **dotenv**: For managing environment variables.
- **PM2**: Process manager for running the API in production.

## Endpoints

### 1. Get PlayStation Games

- **URL**: `/api/games/ps`
- **Method**: GET
- **Description**: Fetches games available on PlayStation Plus Deluxe. The data includes game titles, images, and platform information.
- **Response**:
  ```json
  {
    "games": [
      {
        "title": "Game Title",
        "image": "https://example.com/image.jpg",
        "tag": ["plus"]
      }
    ],
    "size": 100
  }
  ```

### 2. Get Xbox Games

- **URL**: `/api/games/xbox`
- **Method**: GET
- **Description**: Fetches games available on Xbox Ultimate Game Pass. The data includes game titles, images, and platform tags.
- **Response**:
  ```json
  {
    "games": [
      {
        "title": "Game Title",
        "image": "https://example.com/image.jpg",
        "tag": ["ultimate"]
      }
    ]
  }
  ```

## Installation

To get started, clone this repository and install the dependencies:

```bash
# Clone the repository
git clone https://github.com/yourusername/games-api.git

# Change to the project directory
cd games-api

# Install dependencies
npm install
```

## Running the Project

### Development

To run the project in development mode, use:

```bash
npm start
```

### Docker (Optional)

You can also run the project using Docker:

```bash
# Build the Docker image
docker build -t games-api .

# Run the Docker container
docker run -p 3000:3000 --env-file .env games-api
```

## Environment Variables

The following environment variables need to be set for the project to run properly:

- **PORT**: The port the server will run on (default: 3000).
- **REDIS\_HOST**: Hostname of your Redis instance.
- **REDIS\_PORT**: Port number for Redis.
- **REDIS\_PASSWORD**: Password for the Redis server.

## Deployment

This project can be easily deployed on **Render**. To deploy:

1. Connect your GitHub repository to Render.
2. Create a **New Web Service** and configure the necessary environment variables.
3. Deploy and enjoy!

## How It Works

- When the user makes a request to `/api/games/ps` or `/api/games/xbox`, the API first checks if the data is available in **Redis**. If available, it returns the cached data.
- If the data is not available in Redis, the API will make requests to the PlayStation and Xbox APIs to fetch the latest data and store it in Redis for future requests.

## Security

- **dotenv** is used for managing environment variables securely.
- **Helmet** can be added to enhance security by setting secure HTTP headers (not yet implemented in this version).

## Contributions

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the **MIT License**.

## Contact

If you have any questions or need support, feel free to contact me at [ahmadalzein06@gmail.com](mailto\:ahmadalzein06@gmail.com).
