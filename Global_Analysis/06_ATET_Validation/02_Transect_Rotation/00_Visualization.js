/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var poi = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Point([-123.35047670929875, 47.81942660411557]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/**
 * Introduction:
 * 
 *  1) Visualize the raw elevational transects and 
 *    the raw HYBAS basins.
 * 
 *  2) Visualize the sampled elevational transects
 *    and the rotated transect segments with
 *    the average VCH and NDVI.
 * 
 * Updated: 10/5/2023.
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

// Load the raw elevational transects worldwide.
var rawTransects_Global = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Alpine_Treeline_Elevational_Transects_v1_0"
);

// Load the raw HYBAS basins worldwide.
var rawBasins_Global = ee.FeatureCollection(
  "WWF/HydroSHEDS/v1/Basins/hybas_12");

// Load the sampled elevational transects worldwide.
var sampledTransects_Global = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Validation/"
    + "HybasSampled_ATETs"
);

FC_AP.Print_FCinfo("sampledTransects_Global:", 
  sampledTransects_Global); // 66776.

// Load the rotated transects with VCH.
var rotatedSegments_VCH_FC = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Validation/"
    + "Rotation/"
    + "rotatedSegments_AvgElv_VCH"
);

FC_AP.Print_FCinfo("rotatedSegments_VCH_FC:", 
  rotatedSegments_VCH_FC);

// Load the rotated transects with NDVI.
var rotatedSegments_NDVI_FC = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Validation/"
    + "Rotation/"
    + "rotatedSegments_AvgElv_NDVI"
);

FC_AP.Print_FCinfo("rotatedSegments_NDVI_FC:", 
  rotatedSegments_NDVI_FC);


/* Visualization. */

Map.setOptions("Satellite");
// Map.setCenter(-123.35479, 47.81902, 14);
Map.centerObject(poi, 14);

Map.addLayer(rawBasins_Global,
  {color: "00ff00"},
  "rawBasins_Global", false
);

Map.addLayer(rawTransects_Global,
  {color: "ff0000"},
  "rawTransects_Global", false
);

Map.addLayer(sampledTransects_Global,
  {color: "00ffff"},
  "sampledTransects_Global"
);

Map.addLayer(VIS.PaintFC_Fill_Edge(
  rotatedSegments_VCH_FC, "avg_VCH", 1),
  {min: 0, max: 30, 
  palette: "0000ff, ffffff, ff0000"},
  "rotatedSegments_VCH_FC"
);

Map.addLayer(VIS.PaintFC_Fill_Edge(
  rotatedSegments_NDVI_FC, "avg_NDVI", 1),
  VIS.NDVI_vis,
  "rotatedSegments_NDVI_FC"
);

// Map.addLayer(rotatedSegments_FC.filterBounds(poi),
//   {color: "ff0000"},
//   "rotatedSegments_FC (example)"
// );

