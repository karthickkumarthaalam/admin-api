const { slugify: translitSlug } = require("transliteration");

function slugify(text) {
  return translitSlug(text, { lowercase: true });
}

module.exports = slugify;
