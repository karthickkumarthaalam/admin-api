const express = require("express");
const router = express.Router();
const uploadImages = require("../middlewares/uploadImages");
const {
  createOrUpdateFestivalGif,
  deleteFestivalGif,
  listFestivalGifs,
  updateFestivalGifStatus,
} = require("../controllers/festivalGifController");

router.post(
  "/",
  uploadImages("uploads/festivalGif", {
    mode: "fields",
    fieldsConfig: [
      { name: "left_side_image", maxCount: 1 },
      { name: "right_side_image", maxCount: 1 },
    ],
  }),
  createOrUpdateFestivalGif
);

router.get("/", listFestivalGifs);

router.delete("/:id", deleteFestivalGif);

router.put("/status/update", updateFestivalGifStatus);

module.exports = router;
