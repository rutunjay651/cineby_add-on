const { addonBuilder } = require("stremio-addon-sdk")
const http = require("http")
const https = require("https")

const TMDB_API_KEY = "e4598ac9cb6d28883dac12852c670c5a"

const manifest = {
  id: "org.cineby.vidking",
  version: "1.0.0",
  name: "Cineby",
  description: "Watch movies and series from Cineby",
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: []   // REQUIRED by Stremio
}

const builder = new addonBuilder(manifest)

function imdbToTmdb(imdb) {
  return new Promise((resolve) => {

    const url =
      "https://api.themoviedb.org/3/find/" +
      imdb +
      "?api_key=" +
      TMDB_API_KEY +
      "&external_source=imdb_id"

    https.get(url, (res) => {

      let data = ""

      res.on("data", (chunk) => (data += chunk))

      res.on("end", () => {

        try {
          const json = JSON.parse(data)

          if (json.movie_results.length)
            return resolve(json.movie_results[0].id)

          if (json.tv_results.length)
            return resolve(json.tv_results[0].id)

        } catch (e) {}

        resolve(null)
      })
    })
  })
}

builder.defineStreamHandler(async ({ type, id }) => {

  const imdb = id.split(":")[0]
  const tmdb = await imdbToTmdb(imdb)

  if (!tmdb) return { streams: [] }

  let url

  if (type === "movie") {
    url = "https://www.vidking.net/embed/movie/" + tmdb
  } else {

    const parts = id.split(":")
    const season = parts[1]
    const episode = parts[2]

    url =
      "https://www.vidking.net/embed/tv/" +
      tmdb +
      "/" +
      season +
      "/" +
      episode
  }

  return {
    streams: [
      {
        title: "Cineby (Vidking)",
        url: url
      }
    ]
  }
})

const port = process.env.PORT || 7000

http
  .createServer(builder.getInterface())
  .listen(port, () => {
    console.log("Addon running on port " + port)
  })
