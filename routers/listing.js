const express =require("express");
const router =express.Router();
const wrapAsync =require("./utils/wrapAsync.js");
const ExpressError =require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Listing=require("../models/listing.js");


const validateListing =(req,res,next)=>{
    let {error} =  listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,error.message);  
    }
    else{
        next();
    }
};



//index route

router.get("/",wrapAsync(async (req,res)=>{
    const allListing= await Listing.find({});
         res.("listings/index.ejs",{allListing});
 }));
 
 //new route
 
 router.get("/new",(req,res)=>{
     res.render("listings/new.ejs")
 });
 
 
 
 //show route 
 
router.get("/:id",wrapAsync(async(req,res)=>{
     let {id}=req.params;
    const listing= await  Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
 }));
 
 //create route
 
router.post("/", validateListing,wrapAsync(async(req,res,next)=>{
           
       let result =  listingSchema.validate(req.body);
       console.log(result);
       if(result.error){
       throw new ExpressError(400,result.error);
       }
       
         const newlisting=new Listing(req.body.listing);
         await newlisting.save();
         res.redirect("/listings");
 })
 );
 
 //edit route 
 router.get("/:id/edit",wrapAsync(async(req,res)=>{
     let {id}=req.params;
     const listing= await  Listing.findById(id);
     res.render("listings/edit.ejs",{listing});
 }));
 
 //update route
 
 router.put("/:id",
     validateListing,
     wrapAsync(async(req,res)=>{
    
 
     let {id}=req.params;
     await Listing.findByIdAndUpdate(id,{...req.body.listing});
     res. redirect(`/listings/${id}`);
 
 }));
 
 //Delete ROute
 
 router.delete("/:id",wrapAsync(async(req,res)=>{
     let {id}=req.params;
   let deleteListing=  await Listing.findByIdAndDelete(id);
   console.log(deleteListing);
   res.redirect("/listings");
 }));

 module.exports = router;
 