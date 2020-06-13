const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder")
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const path = require("path")


//@desc   Get all bootcamps
//@route   Get /api/v1/bootcamps
//@access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {

  res.status(200).json(res.advancedResults)

});

//@desc    Get a bootcamp with id
//@route   Get /api/v1/bootcamps/:id
//@access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of  ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

//@desc    Create a new bootcamp
//@route   Post /api/v1/bootcamps
//@access  Public
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

//@desc    Update bootcamp with id
//@route   Update /api/v1/bootcamps/:id
//@access  Public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of  ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    message: `Updated one bootcamp with id ${req.params.id}`,
    data: bootcamp,
  });
});

//@desc    Delete bootcamp with id
//@route   Delete /api/v1/bootcamps/:id
//@access  Public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of  ${req.params.id}`, 404)
    );
  }

  bootcamp.remove();

  res.status(200).json({
    success: true,
    message: `Deleted one bootcamp with id ${req.params.id}`,
  });
});

//@desc    Get Bootcamps within a radius
//@route   Get /api/v1/bootcamps/radius/:zipcode/:distance
//@access  Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {

  const {
    zipcode,
    distance
  } = req.params;

  //Get latitude and longitude from geocoder.
  const loc = await geocoder.geocode(zipcode);

  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calculate the radius using radians 
  // Divide distance by radius of earth(3,963 miles/ 6,378 km)

  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [
          [lng, lat], radius
        ]
      }
    }
  })

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  })

});


//@desc    Upload photo for bootcamp
//@route   PUT /api/v1/bootcamps/:id/photo
//@access  Public

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of  ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`please upload a file`, 400))
  }

  const file = req.files.file;

  // Mare sure if the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`The file isn't an imagefile`, 400))
  }

  // Check File size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload an image smaller than ${process.env.MAX_FILE_UPLOAD}`, 400))
  }

  //create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

  // Move the file inside directory

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err)
      return next(new ErrorResponse(`Problem with file upload`, 500))
    }

    await Bootcamp.findOneAndUpdate(req.params.id, {
      photo: file.name
    });

    res.status(200).json({
      success: true,
      data: file.name,
      bootcamp: bootcamp
    });
  });

});