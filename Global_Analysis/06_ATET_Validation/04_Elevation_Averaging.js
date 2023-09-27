/**
 * Introduction:
 * 
 *  1) Compute the average ALOS elevation of each segment.
 * 
 * Updated: 9/27/2023.
 * 
 * Runtime: N/A.
*/


/* Module loading. */

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");

var IMG = require(
  "users/ChenyangWei/Public:Modules/General/Image_Analysis&Processing.js");


/* Object definition. */

// Name of the transect ID.
var IDname_Str = "ET_ID";

// Target projection.
var targetPrj = IMG.WGS84_30m;

// Unweighted average Reducer.
var meanReducer = ee.Reducer.mean()
  .unweighted()
  .setOutputs(["avg_Elv"]);


/* Dataset loading. */

// Load the raw transect segments.
var rawSegments_FC = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Validation/"
    + "segmented_RotatedATETs"
);

// Load the ALOS elevation worldwide.
var ALOSelevation = ee.ImageCollection(
  'JAXA/ALOS/AW3D30/V3_2')
  .select('DSM')
  .mosaic()
  .reproject(targetPrj);
  

/* 1) Compute the average elevation of each segment. */

// Create a non-duplicate list of the transect ID.
var IDs_List = rawSegments_FC
  .aggregate_array(IDname_Str)
  .distinct();

// Perform the operations by transect.
var newSegments_List = 
  IDs_List.map(function Average_Elevation(ID_Num) {
    
    // Create a Filter of the transect ID.
    var ID_Filter = ee.Filter.eq(
      IDname_Str, ID_Num);
    
    // Identify the segments of each transect.
    var rawSegments_perTransect_FC = rawSegments_FC
      .filter(ID_Filter);
    
    // Average the elevation of each segment.
    var newSegments_perTransect_FC = 
      ALOSelevation.reduceRegions({
        collection: rawSegments_perTransect_FC, 
        reducer: meanReducer,
        scale: targetPrj.scale, 
        crs: targetPrj.crs
      });
    
    return newSegments_perTransect_FC;
  });

// Convert the result to a FeatureCollection.
var newSegments_FC = ee.FeatureCollection(
  newSegments_List)
  .flatten();


/* Check/output the result(s). */

var output = true;

if (!output) {
  
  // Check the raw segments.
  print("rawSegments_FC:", 
    rawSegments_FC.first(),
    rawSegments_FC.size()); // 801312 (400656 * 2).
  
  IMG.printImgInfo(
    "ALOSelevation:", ALOSelevation);
  
  print("IDs_List:", IDs_List.size()); // 66776.
  
  // // Check the new segments.
  // print("newSegments_FC:", 
  //   newSegments_FC.first(),
  //   newSegments_FC.size());
  
  // Visualization.
  Map.setOptions("Satellite");
  Map.setCenter(-123.35464, 47.81906, 14);
  
  Map.addLayer(ALOSelevation, 
    {min: 1200, max: 2200, 
    palette: "00FF00, FFFFFF, 0000FF"}, 
    "ALOSelevation");
  
  Map.addLayer(rawSegments_FC,
    {color: "FF0000"},
    "rawSegments_FC"
  );
  
} else {
  
  // Output to Asset.
  var fileName = "rotatedSegments_AvgElv";
  
  Export.table.toAsset({
    collection: newSegments_FC, 
    description: fileName, 
    assetId: GATE.wd_Global 
      + "Elevational_Transects/"
      + "Validation/"
      + fileName
  });
}

