const express =require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync =require("./utils/wrapAsync.js");
const ExpressError =require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("connected to DB")
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));



app.get("/",(req,res)=>{
res.send("i am root");
});

const validateListing =(req,res,next)=>{
    let {error} =  listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,error.message);  
    }
    else{
        next();
    }
}

const validateReview =(req,res,next)=>{
    let {error} =  reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,error.message);  
    }
    else{
        next();
    }
}

//index route

app.get("/listings",wrapAsync(async (req,res)=>{
   const allListing= await Listing.find({});
        res.render("listings/index.ejs",{allListing});
}));

//new route

app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
});



//show route 

app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
   const listing= await  Listing.findById(id).populate("reviews");
   res.render("listings/show.ejs",{listing});
}));

//create route

app.post("/listings", validateListing,wrapAsync(async(req,res,next)=>{
          
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
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing= await  Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//update route

app.put("/listings/:id",
    validateListing,
    wrapAsync(async(req,res)=>{
   

    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res. redirect(`/listings/${id}`);

}));

//Delete ROute

app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
  let deleteListing=  await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  res.redirect("/listings");
}));


// app.get("/testlisting",async(req,res)=>{

//     let samplelisting=new listing({
//         title:"my new villa",
//         description:"by the branch",
//         price:1200,
//         location:"calangute ,Goa",
//         country:"India",
//     });
//     await samplelisting.save();
//     console.log("sample was saved");
//     res.send("successful");
// });

//Reviews

//Post Review Route
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
  let listing = await Listing.findById(req.params.id);
  let newReview =new Review(req.body.review);
  listing.reviews.push(newReview);



  await newReview.save();
  await listing.save();
  await listing.save({validateBeforeSave:false});
  res.redirect(`/listings/${listing._id}`);

}));

//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

app.all("*",(req,res,next)=>{
next(new ExpressError(404,"page not found"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"}=err;

    res.status(statusCode).render("error.ejs",{err});
   // res.send("something went wrong");

});

app.listen(8080,()=>{
    console.log("app was listing port number 8080");
});
