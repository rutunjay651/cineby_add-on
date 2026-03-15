const http = require("http");
const https = require("https");

const PORT = process.env.PORT || 7000;
const TMDB_API_KEY = "PASTE_YOUR_TMDB_API_KEY_HERE";

const manifest = {
  id: "org.cineby.vidking",
  version: "1.0.0",
  name: "Cineby",
  description: "Cineby streams via Vidking",
  logo: "https://www.stremio.com/website/stremio-logo-small.png",
  contactEmail: "cineby@example.com",
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: [],
  behaviorHints: { configurable: false }
};

function imdbToTmdb(imdbId) {
  return new Promise((resolve) => {
    const url =
      "https://api.themoviedb.org/3/find/" +
      imdbId +
      "?api_key=" +
      TMDB_API_KEY +
      "&external_source=imdb_id";

    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));

        res.on("end", () => {
          try {
            const json = JSON.parse(data);

            if (json.movie_results && json.movie_results.length)
              return resolve({ type: "movie", id: json.movie_results[0].id });

            if (json.tv_results && json.tv_results.length)
              return resolve({ type: "tv", id: json.tv_results[0].id });
          } catch {}

          resolve(null);
        });
      })
      .on("error", () => resolve(null));
  });
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/manifest.json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(manifest));
    return;
  }

  if (req.url.startsWith("/stream/")) {
    const parts = req.url.split("/");
    const type = parts[2];
    const id = parts[3].replace(".json", "");

    const imdbId = id.split(":")[0];
    const tmdb = await imdbToTmdb(imdbId);

    if (!tmdb) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ streams: [] }));
      return;
    }

    let streamUrl;

    if (tmdb.type === "movie") {
      streamUrl = "https://www.vidking.net/embed/movie/" + tmdb.id;
    } else {
      const season = id.split(":")[1];
      const episode = id.split(":")[2];

      streamUrl =
        "https://www.vidking.net/embed/tv/" +
        tmdb.id +
        "/" +
        season +
        "/" +
        episode;
    }

    const response = {
      streams: [
        {
          title: "Cineby (Vidking)",
          url: streamUrl
        }
      ]
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Addon running on port " + PORT);
});
