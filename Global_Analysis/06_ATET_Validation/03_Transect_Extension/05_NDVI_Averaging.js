/**
 * Introduction:
 * 
 *  1) Calculate the annual maximum NDVI of 2020.
 * 
 *  2) Remove segments with NULL elevation.
 * 
 *  3) Compute the average NDVI of each segment.
 * 
 * Updated: 10/12/2023.
 * 
 * Runtime: .
*/


/* Module loading. */

var IMG = require(
  "users/ChenyangWei/Public:Modules/General/Image_Analysis&Processing.js");

var LDM = require(
  "users/ChenyangWei/Public:Modules/General/LANDSAT_Data_Manipulation.js");

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");

var FC_AP = require(
  "users/ChenyangWei/Public:Modules/General/FeatureCollection_Analysis&Processing.js");

var VIS = require(
  "users/ChenyangWei/Public:Modules/General/Visualization.js");


/* Object definition. */

// Define the major file path.
var filePath_Str = GATE.wd_Global 
  + "Elevational_Transects/"
  + "Validation/"
  + "Extension/";

// Target projection.
var targetPrj = IMG.WGS84_30m;

// Define the reflectance bands.
var refBands = LDM.L8_SR_refBands_List;

// Define the pixel quality band.
var qualBand = LDM.L578_SR_qualBand_Str;

// Combine the two types of bands.
var L8_Bands = ee.List(refBands).add(qualBand);

// Determine the start and end (exclusive) dates.
var startDate = "2020-01-01";

var endDate = "2021-01-01";

// Load the function to preprocess the LANDSAT-8 SR imagery.
var Preprocess_SRimg = 
  LDM.MaskCloudShadow_RemoveInvalidPx_SRimg;

// Load the function to compute the NDVI for each image.
var ComputeNDVI_byImg = 
  LDM.Calculate_L8SR_NDVI;

// Unweighted average Reducer.
var meanReducer = ee.Reducer.mean()
  .unweighted()
  .setOutputs(["avg_NDVI"]);


/* Dataset loading. */

// Load the rotated segments with the average elevation.
var rawSegments_FC = ee.FeatureCollection(
  filePath_Str + "extendedSegments_AvgElv"
);

// Land surface area based on the Hansen Global Forest Change dataset (v1.7).
var land = ee.Image("UMD/hansen/global_forest_change_2019_v1_7")
  .select("datamask")
  .eq(1) // Select the "Mapped land surface" area in the Hansen dataset.
  .reproject(targetPrj);


/* 1) Calculate the annual maximum NDVI of 2020. */

// Load the raw LANDSAT-8 SR imagery of 2020.
var raw_L8_ImgCol = ee.ImageCollection(
  "LANDSAT/LC08/C01/T1_SR")
  .select(L8_Bands)
  .filterDate(startDate, endDate); 
  // The end date is exclusive.

// Preprocess each loaded image.
var L8_ImgCol = raw_L8_ImgCol.map(Preprocess_SRimg);

// Derive the NDVI for each image.
var NDVI_ImgCol = L8_ImgCol.map(ComputeNDVI_byImg);

// Compute the maximum value at each pixel.
var maxNDVI_img = NDVI_ImgCol.max();

// Reproject the NDVI image.
var maxNDVI_reprj = maxNDVI_img.reproject(targetPrj);

// Remove the water body.
var maxNDVI_noWater = maxNDVI_reprj.updateMask(land);


/* 2) Remove segments with NULL elevation. */

rawSegments_FC = rawSegments_FC.filter(
  ee.Filter.notNull(["avg_Elv"])
);


/* 3) Compute the average NDVI of each segment. */

var newSegments_FC = FC_AP.ReduceRegions_byFeatureGroup(
  maxNDVI_noWater, rawSegments_FC, 
  "ET_ID", meanReducer, targetPrj);


/* Check/output the result(s). */

var output = true; // true OR false.

if (!output) {
  
  // Check the raw segments.
  print("rawSegments_FC:", 
    rawSegments_FC.first(),
    rawSegments_FC.size()); // 756264.
  
  print("avg_Elv:", 
    rawSegments_FC.aggregate_min("avg_Elv"));
    // 4.723346828609986.
  
  IMG.Print_ImgInfo(
    "maxNDVI_noWater:", maxNDVI_noWater);
  
  // // Check the new segments.
  // print("newSegments_FC:", 
  //   newSegments_FC.first(),
  //   newSegments_FC.size());
  
  // Visualization.
  Map.setOptions("Satellite");
  Map.setCenter(-123.35464, 47.81906, 14);
  
  Map.addLayer(maxNDVI_noWater, 
    VIS.NDVI_vis, "maxNDVI_noWater");
  
  Map.addLayer(rawSegments_FC,
    {color: "FF0000"},
    "rawSegments_FC"
  );
  
} else {
  
  // Output to Asset.
  var fileName_Str = "extendedSegments_AvgElv_NDVI";
  
  Export.table.toAsset({
    collection: newSegments_FC, 
    description: fileName_Str, 
    assetId: filePath_Str
      + fileName_Str
  });
}

