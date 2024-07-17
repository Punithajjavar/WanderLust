const express =require("express");
const router =express.Router();
const wrapAsync =require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing}=require("../middleware.js");




//index route

router.get("/",wrapAsync(async (req,res)=>{
    const allListing= await Listing.find({});
         res.render("listings/index.ejs",{allListing});
 }));
 
 //new route
 
 router.get("/new", isLoggedIn,(req,res)=>{
   
     res.render("listings/new.ejs")
 });
 
 
 
 //show route 
 
router.get("/:id",wrapAsync(async(req,res)=>{
     let {id}=req.params;
    const listing= await  Listing.findById(id).populate({path:"reviews",populate:{path:"author",},}).populate("owner");
    if(!listing){
        req.flash("error","you requested does not exit");
        res.redirect("/listings");
    }
    
    res.render("listings/show.ejs",{listing});
 }));
 
 //create route
 
router.post("/", validateListing, isLoggedIn,wrapAsync(async(req,res,next)=>{
           
       let result =  listingSchema.validate(req.body);
       console.log(result);
       if(result.error){
       throw new ExpressError(400,result.error);
       }
       
         const newlisting=new Listing(req.body.listing);
         newlisting.owner = req.user._id;
         await newlisting.save();
         req.flash("success","new listing created:");
         res.redirect("/listings");
 })
 );
 
 //edit route 
 router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
     let {id}=req.params;
     const listing= await  Listing.findById(id);
     if(!listing){
        req.flash("error","you requested does not exit");
        res.redirect("/listings");
    }
     res.render("listings/edit.ejs",{listing});
 }));
 
 //update route
 
 router.put("/:id",
    isLoggedIn,
    isOwner,
     validateListing,
     wrapAsync(async(req,res)=>{
    
 
     let {id}=req.params;
     await Listing.findByIdAndUpdate(id,{...req.body.listing});
     req.flash("success","listing updated");
     res. redirect(`/listings/${id}`);
 
 }));
 
 //Delete Route
 
 router.delete("/:id", isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
     let {id}=req.params;
   let deleteListing=  await Listing.findByIdAndDelete(id);
   console.log(deleteListing);
   req.flash("success","listing deleted");
   res.redirect("/listings");
 }));

 module.exports = router;
 