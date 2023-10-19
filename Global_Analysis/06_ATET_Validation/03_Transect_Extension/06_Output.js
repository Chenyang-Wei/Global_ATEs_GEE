/**
 * Introduction:
 * 
 *  1) Buffer the extended centerlines.
 * 
 *  2) Output the following datasets:
 *    a) Buffered centerlines,
 *    b) Extended segments with VCH and NDVI.
 * 
 * Updated: 10/19/2023.
 * 
 * Runtime: .
*/


/* Module loading. */

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");

var FC_AP = require(
  "users/ChenyangWei/Public:Modules/General/FeatureCollection_Analysis&Processing.js");


/* Object definition. */

// Define the major file path.
var filePath_Str = GATE.wd_Global 
  + "Elevational_Transects/"
  + "Validation/"
  + "Extension/";


/* Function definition. */

// Buffer the transect centerlines.
var Buffer_Centerlines = function(centerline_Ftr) {
  
  var transect_Ftr = centerline_Ftr
    .buffer(45);
  
  return transect_Ftr;
};


/* Dataset loading. */

// Load the extended transect centerlines.
var extendedCenterlines_FC = ee.FeatureCollection(
  filePath_Str + "extendedCLs_SixRatios"
);

// Load the extended segments with the average VCH.
var extendedSegments_VCH_FC = ee.FeatureCollection(
  filePath_Str + "extendedSegments_AvgElv_VCH"
);

// Load the extended segments with the average NDVI.
var extendedSegments_NDVI_FC = ee.FeatureCollection(
  filePath_Str + "extendedSegments_AvgElv_NDVI"
);


/* 1) Buffer the extended centerlines. */

var extendedTransects_FC = extendedCenterlines_FC
  .map(Buffer_Centerlines);


/* Check/output the result(s). */

var output = true; // true OR false.

if (!output) {
  
  // Check the datasets.
  FC_AP.Print_FCinfo(
    "extendedTransects_FC:", 
    extendedTransects_FC); // 400656.
  
  FC_AP.Print_FCinfo(
    "extendedSegments_VCH_FC:", 
    extendedSegments_VCH_FC); // 756264.
  
  FC_AP.Print_FCinfo(
    "extendedSegments_NDVI_FC:", 
    extendedSegments_NDVI_FC); // 756264.
  
  // Visualization.
  Map.setOptions("Satellite");
  Map.setCenter(-123.35464, 47.81906, 14);
  
  Map.addLayer(extendedTransects_FC,
    {color: "FFFF00"},
    "extendedTransects_FC"
  );
  
  Map.addLayer(extendedCenterlines_FC,
    {color: "0000FF"},
    "extendedCenterlines_FC"
  );
  
  Map.addLayer(extendedSegments_VCH_FC,
    {color: "00FF00"},
    "extendedSegments_VCH_FC"
  );
  
  Map.addLayer(extendedSegments_NDVI_FC,
    {color: "FF0000"},
    "extendedSegments_NDVI_FC"
  );
  
} else {
  
  // Output to Drive.
  Export.table.toDrive({
    collection: extendedTransects_FC, 
    description: "extendedTransects", 
    folder: "extendedTransects", 
    fileFormat: "SHP"
  });
  
  Export.table.toDrive({
    collection: extendedSegments_VCH_FC, 
    description: "extendedSegments_VCH", 
    folder: "extendedSegments_VCH", 
    fileFormat: "SHP"
  });
  
  Export.table.toDrive({
    collection: extendedSegments_NDVI_FC, 
    description: "extendedSegments_NDVI", 
    folder: "extendedSegments_NDVI", 
    fileFormat: "SHP"
  });
}

