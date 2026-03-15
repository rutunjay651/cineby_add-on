const { addonBuilder } = require("stremio-addon-sdk")
const https = require("https")
const manifest = require("./manifest.json")

const TMDB_API_KEY = "e4598ac9cb6d28883dac12852c670c5a"

const builder = new addonBuilder(manifest)

function imdbToTmdb(imdbId) {
    return new Promise((resolve) => {

        const url =
            "https://api.themoviedb.org/3/find/" +
            imdbId +
            "?api_key=" +
            TMDB_API_KEY +
            "&external_source=imdb_id"

        https.get(url, (res) => {

            let data = ""

            res.on("data", chunk => data += chunk)

            res.on("end", () => {

                try {

                    const json = JSON.parse(data)

                    if (json.movie_results && json.movie_results.length)
                        return resolve({ type: "movie", id: json.movie_results[0].id })

                    if (json.tv_results && json.tv_results.length)
                        return resolve({ type: "tv", id: json.tv_results[0].id })

                } catch {}

                resolve(null)

            })

        }).on("error", () => resolve(null))

    })
}

builder.defineStreamHandler(async ({ type, id }) => {

    const imdbId = id.split(":")[0]

    const tmdb = await imdbToTmdb(imdbId)

    if (!tmdb)
        return { streams: [] }

    let streamUrl

    if (tmdb.type === "movie") {

        streamUrl = "https://www.vidking.net/embed/movie/" + tmdb.id

    } else {

        const season = id.split(":")[1]
        const episode = id.split(":")[2]

        streamUrl =
            "https://www.vidking.net/embed/tv/" +
            tmdb.id +
            "/" +
            season +
            "/" +
            episode

    }

    return {
        streams: [
            {
                title: "Cineby (Vidking)",
                url: streamUrl
            }
        ]
    }

})

module.exports = builder.getInterface()
