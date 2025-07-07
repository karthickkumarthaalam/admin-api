const axios = require("axios");
const db = require("../models");
const { Podcast } = db;


exports.getPodcastMetaPage = async (req, res) => {
    const podcastId = req.params.id;

    try {
        const podcast = await Podcast.findOne({
            where: { id: podcastId, status: 'active' },
            attributes: ['id', 'title', 'description', 'image_url', 'date']
        });

        if (!podcast) {
            return res.status(404).send("Podcast not found");
        }

        const imageUrl = podcast.image_url
            ? `https://api.demoview.ch/api/${podcast.image_url.replace(/\\/g, '/')}`
            : 'https://thaalam.ch/img/podcast-banner2.jpg';

        res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${podcast.title}</title>
        <meta property="og:type" content="music.radio_station" />
        <meta property="og:title" content="${podcast.title}" />
        <meta property="og:description" content="${podcast.description || 'Listen to the latest Tamil podcast on Thaalam.'}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="https://thaalam.ch/podcast-details?id=${podcast.id}" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${podcast.title}" />
        <meta name="twitter:description" content="${podcast.description || 'Listen to the latest Tamil podcast on Thaalam.'}" />
        <meta name="twitter:image" content="${imageUrl}" />

        <meta http-equiv="refresh" content="0; url=https://thaalam.ch/podcast-details?id=${podcast.id}" />
      </head>
      <body>
        <p>Redirecting to podcast details…</p>
      </body>
      </html>
    `);

    } catch (error) {
        res.status(500).send("Failed to fetch podcast data.");
    }
};
