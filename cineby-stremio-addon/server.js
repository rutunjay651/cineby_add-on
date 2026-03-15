const { serveHTTP } = require("stremio-addon-sdk")
const addonInterface = require("./addon")

const PORT = process.env.PORT || 7000

serveHTTP(addonInterface, { port: PORT })

console.log("Cineby addon server running on port " + PORT)
