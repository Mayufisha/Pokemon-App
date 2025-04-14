const express = require("express");
const router = express.Router();
const controller = require("../controllers/timelinecontrol");

router.options("/", controller.handleOptions);
router.get("/", controller.getTimeline);
router.post("/", controller.addTimelineEntry);

module.exports = router;
