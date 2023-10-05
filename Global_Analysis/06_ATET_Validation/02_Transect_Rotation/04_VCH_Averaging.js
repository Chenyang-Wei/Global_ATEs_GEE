/**
 * Introduction:
 * 
 *  1) Remove segments with NULL elevation.
 * 
 *  2) Compute the average vegetation canopy height 
 *    of each segment.
 * 
 * Updated: 9/28/2023.
 * 
 * Runtime: 15h.
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
var targetPrj = IMG.WGS84_10m;

// Unweighted average Reducer.
var meanReducer = ee.Reducer.mean()
  .unweighted()
  .setOutputs(["avg_VCH"]);


/* Dataset loading. */

// Load the rotated segments with the average elevation.
var rawSegments_FC = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Validation/"
    + "rotatedSegments_AvgElv"
);

// Load the 10-m global canopy height dataset of 2020.
var canopy_height = 
  ee.Image('users/nlang/ETH_GlobalCanopyHeight_2020_10m_v1')
    .reproject(targetPrj);


/* 1) Remove segments with NULL elevation. */

rawSegments_FC = rawSegments_FC.filter(
  ee.Filter.notNull(["avg_Elv"])
);


/* 2) Compute the average canopy height of each segment. */

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
    
    // Average the canopy height of each segment.
    var newSegments_perTransect_FC = 
      canopy_height.reduceRegions({
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
    rawSegments_FC.size()); // 801312.
  
  IMG.printImgInfo(
    "canopy_height:", canopy_height);
  
  print("IDs_List:", IDs_List.size()); // 66776.
  
  // // Check the new segments.
  // print("newSegments_FC:", 
  //   newSegments_FC.first(),
  //   newSegments_FC.size());
  
  // Visualization.
  Map.setOptions("Satellite");
  Map.setCenter(-123.35464, 47.81906, 14);
  
  Map.addLayer(canopy_height, 
    {min: 0, max: 50, 
    palette: "FFFFFF, FFFF00, 00FF00"}, 
    "canopy_height");
  
  Map.addLayer(rawSegments_FC,
    {color: "FF0000"},
    "rawSegments_FC"
  );
  
} else {
  
  // Output to Asset.
  var fileName = "rotatedSegments_AvgElv_VCH";
  
  Export.table.toAsset({
    collection: newSegments_FC, 
    description: fileName, 
    assetId: GATE.wd_Global 
      + "Elevational_Transects/"
      + "Validation/"
      + fileName
  });
}

