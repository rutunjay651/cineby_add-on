const { addonBuilder } = require("stremio-addon-sdk")
const manifest = require("./manifest.json")

const builder = new addonBuilder(manifest)

builder.defineStreamHandler(({ type }) => {

    let url

    if (type === "movie") {
        url = "https://www.vidking.net/embed/movie/1078605"
    } else {
        url = "https://www.vidking.net/embed/tv/1399/1/1"
    }

    return Promise.resolve({
        streams: [
            {
                title: "Cineby (Vidking)",
                url: url
            }
        ]
    })
})

module.exports = builder.getInterface()
