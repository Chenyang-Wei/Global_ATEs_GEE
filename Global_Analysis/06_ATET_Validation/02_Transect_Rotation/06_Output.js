/**
 * Introduction:
 * 
 *  1) Buffer the rotated centerlines.
 * 
 *  2) Output the following datasets:
 *    a) Sampled transects,
 *    b) Buffered centerlines,
 *    c) Rotated segments with VCH and NDVI.
 * 
 * Updated: 10/10/2023.
 * 
 * Runtime: 22m ~ 3h.
*/


/* Module loading. */

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");

var FC_AP = require(
  "users/ChenyangWei/Public:Modules/General/FeatureCollection_Analysis&Processing.js");


/* Object definition. */

var filePath_Str = GATE.wd_Global 
  + "Elevational_Transects/"
  + "Validation/"
  + "Rotation/";


/* Function definition. */

// Buffer the transect centerlines.
var Buffer_Centerlines = function(centerline_Ftr) {
  
  var transect_Ftr = centerline_Ftr
    .buffer(45);
  
  return transect_Ftr;
};


/* Dataset loading. */

// Load the sampled transects.
var sampledTransects_FC = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Validation/"
    + "HybasSampled_ATETs"
);

// Load the rotated transect centerlines.
var rotatedCenterlines_FC = ee.FeatureCollection(
  filePath_Str + "rotatedCLs_SixAngles"
);

// Load the rotated segments with the average VCH.
var rotatedSegments_VCH_FC = ee.FeatureCollection(
  filePath_Str + "rotatedSegments_AvgElv_VCH"
);

// Load the rotated segments with the average NDVI.
var rotatedSegments_NDVI_FC = ee.FeatureCollection(
  filePath_Str + "rotatedSegments_AvgElv_NDVI"
);


/* 1) Buffer the rotated centerlines. */

var rotatedTransects_FC = rotatedCenterlines_FC
  .map(Buffer_Centerlines);


/* Check/output the result(s). */

var output = true; // true OR false.

if (!output) {
  
  // Check the datasets.
  FC_AP.Print_FCinfo(
    "rotatedTransects_FC:", 
    rotatedTransects_FC); // 400656.
  
  FC_AP.Print_FCinfo(
    "rotatedSegments_VCH_FC:", 
    rotatedSegments_VCH_FC); // 801312.
  
  FC_AP.Print_FCinfo(
    "rotatedSegments_NDVI_FC:", 
    rotatedSegments_NDVI_FC); // 801312.
  
  FC_AP.Print_FCinfo(
    "sampledTransects_FC:", 
    sampledTransects_FC); // 66776.
  
  // Visualization.
  Map.setOptions("Satellite");
  Map.setCenter(-123.35464, 47.81906, 14);
  
  Map.addLayer(rotatedTransects_FC,
    {color: "FFFF00"},
    "rotatedTransects_FC"
  );
  
  Map.addLayer(rotatedCenterlines_FC,
    {color: "0000FF"},
    "rotatedCenterlines_FC"
  );
  
  Map.addLayer(rotatedSegments_VCH_FC,
    {color: "00FF00"},
    "rotatedSegments_VCH_FC"
  );
  
  Map.addLayer(rotatedSegments_NDVI_FC,
    {color: "FFFF00"},
    "rotatedSegments_NDVI_FC"
  );
  
  Map.addLayer(sampledTransects_FC,
    {color: "FF0000"},
    "sampledTransects_FC"
  );
  
} else {
  
  // Output to Drive.
  Export.table.toDrive({
    collection: rotatedTransects_FC, 
    description: "rotatedTransects", 
    folder: "rotatedTransects", 
    fileFormat: "SHP"
  });
  
  Export.table.toDrive({
    collection: rotatedSegments_VCH_FC, 
    description: "rotatedSegments_VCH", 
    folder: "rotatedSegments_VCH", 
    fileFormat: "SHP"
  });
  
  Export.table.toDrive({
    collection: rotatedSegments_NDVI_FC, 
    description: "rotatedSegments_NDVI", 
    folder: "rotatedSegments_NDVI", 
    fileFormat: "SHP"
  });
  
  Export.table.toDrive({
    collection: sampledTransects_FC, 
    description: "sampledTransects", 
    folder: "sampledTransects", 
    fileFormat: "SHP"
  });
}

