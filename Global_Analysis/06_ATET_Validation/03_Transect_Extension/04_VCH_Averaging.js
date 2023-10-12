/**
 * Introduction:
 * 
 *  1) Remove segments with NULL elevation.
 * 
 *  2) Compute the average vegetation canopy height 
 *    of each segment.
 * 
 * Updated: 10/12/2023.
 * 
 * Runtime: .
*/


/* Module loading. */

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");

var IMG = require(
  "users/ChenyangWei/Public:Modules/General/Image_Analysis&Processing.js");


/* Object definition. */

// Define the major file path.
var filePath_Str = GATE.wd_Global 
  + "Elevational_Transects/"
  + "Validation/"
  + "Extension/";

// Name of the transect ID.
var IDname_Str = "ET_ID";

// Target projection.
var targetPrj = IMG.WGS84_10m;

// Unweighted average Reducer.
var meanReducer = ee.Reducer.mean()
  .unweighted()
  .setOutputs(["avg_VCH"]);


/* Dataset loading. */

// Load segments with the average elevation.
var rawSegments_FC = ee.FeatureCollection(
  filePath_Str + "extendedSegments_AvgElv"
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
var IDvalues_List = rawSegments_FC
  .aggregate_array(IDname_Str)
  .distinct();

// Perform the operations by transect.
var newSegments_List = 
  IDvalues_List.map(function Average_Elevation(IDvalue_Num) {
    
    // Create a Filter of the transect ID.
    var ID_Filter = ee.Filter.eq(
      IDname_Str, IDvalue_Num);
    
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

var output = true; // true OR false.

if (!output) {
  
  // Check the raw segments.
  print("rawSegments_FC:", 
    rawSegments_FC.first(),
    rawSegments_FC.size()); // 756264.
  
  IMG.Print_ImgInfo(
    "canopy_height:", canopy_height);
  
  print("IDvalues_List:", 
    IDvalues_List.size()); // 66776.
  
  // Check the new segments.
  print("newSegments_FC:", 
    newSegments_FC.first(),
    newSegments_FC.size());
  
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
  var fileName_Str = "extendedSegments_AvgElv_VCH";
  
  Export.table.toAsset({
    collection: newSegments_FC, 
    description: fileName_Str, 
    assetId: filePath_Str
      + fileName_Str
  });
}

