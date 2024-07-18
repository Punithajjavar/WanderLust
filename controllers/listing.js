const Listing = require("../models/listing");
const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeoCoding({accessToken:mapToken});

module.exports.index =  async (req,res)=>{
    const allListing= await Listing.find({});
         res.render("listings/index.ejs",{allListing});
 };

 module.exports.renderNewForm =(req,res)=>{
    res.render("listings/new.ejs")
}

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
   const listing= await  Listing.findById(id).populate({path:"reviews",populate:{path:"author",},}).populate("owner");
   if(!listing){
       req.flash("error","you requested does not exit");
       res.redirect("/listings");
   }
   
   res.render("listings/show.ejs",{listing});
}

module.exports.createListing=async(req,res,next)=>{
   let response= await geoCodingClient.forwardGeocode({
        query:req.body.listing.location,
        limit:1,
    })
    .send();
    
  
    let url=req.file.path;
    let filename=req.file.filename;

    
      const newlisting=new Listing(req.body.listing);
      newlisting.owner = req.user._id;
      newlisting.image={url,filename};
      newlisting.geometry =response.body.features[0].geometry;
      let savedlisting=await newlisting.save();
      console.log(savedlisting);
      req.flash("success","new listing created:");
      res.redirect("/listings");
}

module.exports.renderEditForm = async(req,res)=>{
    let {id}=req.params;
    const listing= await  Listing.findById(id);
    if(!listing){
       req.flash("error","you requested does not exit");
       res.redirect("/listings");
   }

   let originalImgUrl=listing.image.url;
   originalImgUrl= originalImgUrl.replace("/upload","/upload/w_400")
    res.render("listings/edit.ejs",{listing, originalImgUrl});
}

module.exports.updateListing = async(req,res)=>{
    
 
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    req.flash("success","listing updated");
    res. redirect(`/listings/${id}`);

}

module.exports.destoyListing =async(req,res)=>{
    let {id}=req.params;
  let deleteListing=  await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  req.flash("success","listing deleted");
  res.redirect("/listings");
}