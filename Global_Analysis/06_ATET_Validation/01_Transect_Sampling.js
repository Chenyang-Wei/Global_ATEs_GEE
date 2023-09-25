/**
 * Introduction:
 * 
 *  1) Sample one elevational transects 
 *    for each HYBAS basin.
 * 
 * Updated: 9/21/2023.
 * 
 * Runtime: 11m.
*/


/* Module loading. */

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");

var FC_AP = require(
  "users/ChenyangWei/Public:Modules/General/FeatureCollection_Analysis&Processing.js");


/* Function definition. */

// Import the function to check the information of 
//  FeatureCollections.
var Print_FC = FC_AP.Print_FtrColInfo;


/* Dataset loading. */

// Load the raw elevational transects.
var rawTransects = ee.FeatureCollection(
  GATE.wd_Global + "Elevational_Transects/"
    + "Alpine_Treeline_Elevational_Transects_v1_0"
);


/* 1) Sample one elevational transects 
  for each HYBAS basin. */

var sampled_Transects = rawTransects
  .distinct(["HYBAS_ID"]);


var output = true;

if (!output) {
  
  /* Check the result(s). */
  
  // Check the raw transects.
  Print_FC(
    "rawTransects:", 
    rawTransects); // 2312022.

  // Count the number of the basins with transects.
  print(rawTransects
    .aggregate_count_distinct("HYBAS_ID")); // 66776.
  
  // Check the sampled transects.
  Print_FC(
    "sampled_Transects:", 
    sampled_Transects); // 66776.

  // Visualization.
  Map.setOptions("Satellite");
  Map.setCenter(-105.7371, 40.4349, 11);
  
  Map.addLayer(rawTransects,
    {color: "ff0000"},
    "rawTransects"
  );
  
  Map.addLayer(sampled_Transects,
    {color: "00ffff"},
    "sampled_Transects"
  );
  
} else {
  
  /* Output the result(s).*/
  
  var fileName = "HybasSampled_ATETs";
  
  Export.table.toAsset({
    collection: sampled_Transects, 
    description: fileName, 
    assetId: GATE.wd_Global 
      + "Elevational_Transects/"
      + "Validation/"
      + fileName
  });
}

