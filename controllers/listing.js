const Listing = require("../models/listing");

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
            
      const newlisting=new Listing(req.body.listing);
      newlisting.owner = req.user._id;
      await newlisting.save();
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
    res.render("listings/edit.ejs",{listing});
}

module.exports.updateListing = async(req,res)=>{
    
 
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
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