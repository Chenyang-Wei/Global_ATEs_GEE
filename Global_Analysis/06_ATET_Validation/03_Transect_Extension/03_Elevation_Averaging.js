/**
 * Introduction:
 * 
 *  1) Compute the average ALOS elevation of each segment.
 * 
 * Updated: 10/10/2023.
 * 
 * Runtime: .
*/


/* Module loading. */

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");

var IMG = require(
  "users/ChenyangWei/Public:Modules/General/Image_Analysis&Processing.js");

var FC_AP = require(
  "users/ChenyangWei/Public:Modules/General/FeatureCollection_Analysis&Processing.js");


/* Object definition. */

// Define the major file path.
var filePath_Str = GATE.wd_Global 
  + "Elevational_Transects/"
  + "Validation/"
  + "Extension/";

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
  filePath_Str + "segmented_ExtendedATETs"
);

// Load the ALOS elevation worldwide.
var ALOSelevation = ee.ImageCollection(
  'JAXA/ALOS/AW3D30/V3_2')
  .select('DSM')
  .mosaic()
  .reproject(targetPrj);
  

/* 1) Compute the average elevation of each segment. */

// Create a non-duplicate list of the transect ID.
var IDvalues_List = rawSegments_FC
  .aggregate_array(IDname_Str)
  .distinct();

// Perform the operations by transect.
var newSegments_List = 
  IDvalues_List.map(function Average_Elevation(
    IDvalue_Num) {
      
      // Create a Filter of the transect ID.
      var ID_Filter = ee.Filter.eq(
        IDname_Str, IDvalue_Num);
      
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

var output = true; // true OR false.

if (!output) {
  
  // Check the datasets.
  FC_AP.Print_FCinfo(
    "rawSegments_FC:", 
    rawSegments_FC); // 756264.
  
  IMG.Print_ImgInfo(
    "ALOSelevation:", 
    ALOSelevation);
  
  print("IDvalues_List:", 
    IDvalues_List.size()); // 66776.
  
  // FC_AP.Print_FCinfo(
  //   "newSegments_FC:", 
  //   newSegments_FC);
  
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
  var fileName_Str = "extendedSegments_AvgElv";
  
  Export.table.toAsset({
    collection: newSegments_FC, 
    description: fileName_Str, 
    assetId: filePath_Str
      + fileName_Str
  });
}

