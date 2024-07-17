const express =require("express");
const router =express.Router();
const wrapAsync =require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing}=require("../middleware.js");
const ListingController =require("../controllers/listing.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js")
const upload=multer({storage});

router
.route("/")
.get(wrapAsync(ListingController.index))
.post( isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(ListingController.createListing));



//new route
router.get("/new", isLoggedIn,ListingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(ListingController.showListing))
.delete( isLoggedIn,isOwner,wrapAsync(ListingController.destoyListing))
.put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
     validateListing,
     wrapAsync(ListingController.updateListing));




 //edit route 
 router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(ListingController.renderEditForm));
 

 module.exports = router;
 