const helmet = require('helmet');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const PORT = 8000;
// Limit to 20 searches per 15 minutes
const limiter = rateLimit({
    windowMs: 900000,
    max: 20
});

require('dotenv').config();

app.set('view engine', 'ejs');

app.use(helmet());
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/assets', express.static(__dirname + 'public/assets'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

//applies to all requests
app.use(limiter);

app.locals.colorMovieRating = function (rating) {
    if (rating >= 8) {
        return "high-rating";
    } else if (rating >= 5) {
        return "medium-rating";
    } else {
        return "low-rating";
    }
};

async function getMovieData(apiURL) {
    const fetchResponse = await fetch(apiURL);
    const jsonResults = await fetchResponse.json();

    const results = jsonResults['results']
        .map(a => ({
            original_title: a.original_title,
            overview: a.overview,
            vote_average: (!isNaN(a.vote_average)) ? parseInt(a.vote_average) : a.vote_average,
            poster_path: (a.poster_path) ? `https://image.tmdb.org/t/p/w300/${a.poster_path}` : `/assets/moviePlaceholder.jpg`
        }));

    return results;
}

app.get("/", async (req, res) => {
    try {
        const apiURL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${process.env.MOVIEDB_API_KEY}&page=1`;
        const results = await getMovieData(apiURL);

        res.render('index.ejs', { movie: results });

    } catch (err) {
        console.error(err);
        res.render('index.ejs', { movie: null });
    }
})

app.post("/", body('search').trim().isLength({ min: 1 }).escape(), async (req, res) => {
    try {
        const validateErrors = validationResult(req);

        if (!validateErrors.isEmpty()) {
            throw new Error("Search cannot be left blank.");
        }

        const queryString = `query=${req.body.search}`;
        const apiURL = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIEDB_API_KEY}&${queryString}`;
        const results = await getMovieData(apiURL);

        res.render('index.ejs', { movie: results });

    } catch (err) {
        console.error(err);
        res.render('index.ejs', { movie: null });
    }
})

app.listen(process.env.PORT || PORT, () => {
    console.log(`The server is running on ${PORT}!`);
})