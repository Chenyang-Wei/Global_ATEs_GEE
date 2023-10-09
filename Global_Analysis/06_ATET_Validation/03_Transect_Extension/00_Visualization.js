/**
 * Introduction:
 * 
 *  1) Visualize the sampled elevational transects
 *    and the 
 * 
 * Updated: 10/6/2023.
 * 
 * Runtime: N/A.
*/


/* Module loading. */

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");

var VIS = require(
  "users/ChenyangWei/Public:Modules/General/Visualization.js");

var FC_AP = require(
  "users/ChenyangWei/Public:Modules/General/FeatureCollection_Analysis&Processing.js");


/* Dataset loading. */

// Load the sampled elevational transects worldwide.
var sampledTransects_Global = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Validation/"
    + "HybasSampled_ATETs"
);

FC_AP.Print_FCinfo("sampledTransects_Global:", 
  sampledTransects_Global); // 66776.


/* Visualization. */

Map.setOptions("Satellite");
Map.setCenter(-123.35479, 47.81902, 14);

Map.addLayer(sampledTransects_Global,
  {color: "00ffff"},
  "sampledTransects_Global"
);

