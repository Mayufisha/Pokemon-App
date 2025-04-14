const express = require("express");
const router = express.Router();
const controller = require("../controllers/favcontrol");

router.get("/", controller.getFavorites);
router.post("/add", controller.addFavorite);
router.post("/remove", controller.removeFavorite);

module.exports = router;
