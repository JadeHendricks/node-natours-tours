const express = require("express");
const router = express.Router();
const {
  getAllTours,
  aliasTopTours, 
  createTour, 
  getTour, 
  updateTour, 
  deleteTour} = require("../controllers/tourController");

// router.param("id", checkID);

router.route("/top-5-tours").get(aliasTopTours, getAllTours)

router
  .route("/")
  .get(getAllTours)
  .post(createTour);

router
  .route("/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;