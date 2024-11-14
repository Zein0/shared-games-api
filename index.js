const express = require('express');
const axios = require('axios');
const cors = require('cors');
const{ createClient } = require('redis');
const dotenv =  require('dotenv');
dotenv.config()
const app = express();
const PORT = 5000;
app.use(cors());

const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});
// const client = createClient({ 
//     url: 'redis://127.0.0.1:6379',
//  })

if(!client.isOpen) {
    client.connect().catch(console.error);
}

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.error('Redis connection error:', err);
});

const apiUrlsWithTags = [
    { url: 'https://www.playstation.com/bin/imagic/gameslist?locale=en-us&categoryList=plus-games-list', tag: 'plus' },
    { url: 'https://www.playstation.com/bin/imagic/gameslist?locale=en-us&categoryList=ubisoft-classics-list', tag: 'ubisoft' },
    { url: 'https://www.playstation.com/bin/imagic/gameslist?locale=en-us&categoryList=plus-classics-list', tag: 'classics' },
    { url: 'https://www.playstation.com/bin/imagic/gameslist?locale=en-us&categoryList=plus-monthly-games-list', tag: 'monthly' },
];

app.get('/api/games/ps', async (req, res) => {
    try {
        const cachedData = await client.get("psGames");
        if(cachedData) {
            const games = JSON.parse(cachedData);
            res.json({ games });
            return;
        }
        const responses = await Promise.all(apiUrlsWithTags.map(api => axios.get(api.url)));
        const allGames = responses.flatMap((response, index) =>
            response.data
                .flatMap(item => item.games)
                .filter(game => game.device && game.device.includes('PS4'))
                .map(game => ({ title: game.name, image: game.imageUrl, tag: [apiUrlsWithTags[index].tag] })) // Add the tag to each game object
        );
        await client.setEx("psGames", 86400, JSON.stringify(allGames));
        // const allGames = responses.flatMap(response => response.data.map(item => item.games).flat()).filter(game => game.device && game.device.includes('PS4'));
        res.json({ games: allGames, size: allGames.length });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/api/games/xbox', async (req, res) => {
    try {
        const cachedData = await client.get("xboxGames");
        if(cachedData) {
            const games = JSON.parse(cachedData);
            res.json({ games });
            return;
        }
        let gameIds = await fetchGameIDs('ultimate');
        let gameProperties = await fetchGameProperties(gameIds,'ultimate');
        let gameIdss2 = await fetchGameIDs('XeaPlay');
        let gameProperties2 = await fetchGameProperties(gameIdss2,'XeaPlay');
        gameProperties = [...gameProperties, ...gameProperties2]
	  .sort((a, b) => a.title.localeCompare(b.title))
	  .reduce((acc, current) => {
	    const existing = acc.find(item => item.title === current.title);
	    if (existing) {
	      // Merge tags, ensuring no duplicates
	      existing.tags = [...new Set([...existing.tags, ...current.tags])];
	    } else {
	      acc.push(current);
	    }
	    return acc;
	  }, []);
        await client.setEx("xboxGames", 86400, JSON.stringify(gameProperties));
        res.json({ games: gameProperties });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});
const fetchGameIDs = async (passType) => {
    const market = "US"
    const language = "en-us";
    const APIIds = {
		"ultimate": "f6f1f99f-9b49-4ccd-b3bf-4d9767a77f5e",
		"pc": "fdd9e2a7-0fee-49f6-ad69-4354098401ff",
		"XeaPlay": "b8900d09-a491-44cc-916e-32b5acae621b"
	}
    let gameIds = await fetch(`https://catalog.gamepass.com/sigls/v2?id=${APIIds[passType]}&language=${language}&market=${market}`)
    .then((response) => response.json())
		.then((data) => data.filter((entry) => entry.id).map((entry) => entry.id));
    return gameIds;
}

async function fetchGameProperties(gameIds,passType) {
    const market = "US"
    const language = "en-us";
	const games = await fetch(`https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${gameIds}&market=${market}&languages=${language}`)
		.then((response) => response.json())
    const gameDetails = games.Products.map(product => {
        const title = product.LocalizedProperties[0]?.ProductTitle || "No title available";
        const posterImage = product.LocalizedProperties[0]?.Images.find(image => image.ImagePurpose === 'Poster')?.Uri || null;
        return {
            title,
            image: posterImage,
            tag: [passType]
        };
    });
    return gameDetails;
}




app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
