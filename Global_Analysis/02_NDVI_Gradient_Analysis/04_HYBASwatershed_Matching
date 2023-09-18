/**
 * Introduction:
 * 
 *  1) Merge the aggregated dataset with 
 *    the HYBAS watersheds.
 * 
 *  2) Output the merged spatial dataset 
 *    to Google Drive and GEE Asset.
 * 
 * Runtime: 7 ~ 9m.
 * 
 * Update: 5/12/2023.
 */


/* Load module(s). */

var GATE = require("users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");
var FC_AP = require("users/ChenyangWei/Public:Modules/General/FeatureCollection_Analysis&Processing.js");


/* Object definition. */

// Set the major working directory.
var wd_Main = GATE.wd_Global;

// Load the raw HYBAS watersheds.
var rawBasins = ee.FeatureCollection("WWF/HydroSHEDS/v1/Basins/hybas_12");

// Load the aggregated dataset without geometries.
var HybasMeans = ee.FeatureCollection(wd_Main
  + "NDVI_Gradient_Analysis/"
  + "HybasMeans_Gte30obs_NegEGmean");


/* Function definition. */

var Merge_Watersheds = 
  FC_AP.combine_twoFtrCols_primaryGeometriesANDsecondaryProperties;


/* Merge the dataset and the HYBAS watersheds. */

var HybasMeans_withGeom = Merge_Watersheds(
  rawBasins, HybasMeans, 
  "HYBAS_ID", "Hybas_ID");


var output = true; // true OR false.

if (!output) {
  
  // Check the result.
  FC_AP.Print_FtrColInfo(
    "HybasMeans_withGeom:", 
    HybasMeans_withGeom); // 36042.

} else {
  
  /* Output the results to Google Drive and GEE Asset. */
  
  var fileName = 
    "HybasMeans_Gte30obs_NegEGmean_withGeom";
  
  Export.table.toDrive({
    collection: HybasMeans_withGeom, 
    description: fileName, 
    folder: fileName, 
    fileFormat: "SHP"
  });
  
  Export.table.toAsset({
    collection: HybasMeans_withGeom, 
    description: fileName, 
    assetId: wd_Main
      + "NDVI_Gradient_Analysis/"
      + fileName
  });
}

