/**
 * Introduction:
 * 
 *  1) Visualize the raw elevational transects worldwide.
 * 
 *  2) Visualize the raw HYBAS basins worldwide.
 * 
 *  3) Visualize the sampled elevational transects worldwide.
 * 
 * Updated: 9/21/2023.
 * 
 * Runtime: N/A.
*/


/* Module loading. */

var GATE = require("users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");


/* Object definition. */


/* Function definition. */


/* Dataset loading. */

// Load the raw elevational transects worldwide.
var rawTransects_Global = ee.FeatureCollection(
  GATE.wd_Global + "Elevational_Transects/"
    + "Alpine_Treeline_Elevational_Transects_v1_0"
);

// Load the raw HYBAS basins worldwide.
var rawBasins_Global = ee.FeatureCollection(
  "WWF/HydroSHEDS/v1/Basins/hybas_12");

// Load the sampled elevational transects worldwide.
var sampledTransects_Global = ee.FeatureCollection(
  GATE.wd_Global + "Elevational_Transects/"
    + "Validation/"
    + "HybasSampled_ATETs"
);

print("sampledTransects_Global:", 
  sampledTransects_Global.size()); // 66776.


/* 2) Operation #2. */


/* 3) Operation #3. */


/* Visualization. */

Map.setOptions("Satellite");
Map.setCenter(-123.35479, 47.81902, 14);

Map.addLayer(rawBasins_Global,
  {color: "00ffff"},
  "rawBasins_Global"
);

Map.addLayer(rawTransects_Global,
  {color: "ff0000"},
  "rawTransects_Global"
);

Map.addLayer(sampledTransects_Global,
  {color: "0000ff"},
  "sampledTransects_Global"
);

