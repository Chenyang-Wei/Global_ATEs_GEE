/**
 * Introduction:
 * 
 *  1) Merge the aggregated variables with 
 *    the corresponding HYBAS watersheds.
 * 
 *  2) Output the merged spatial datasets 
 *    to Google Drive and GEE Asset.
 * 
 * Runtime: 6 ~ 11m.
 * 
 * Update: 3/24/2023.
 */


/* Load module(s). */

var GATE = require("users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");
var FC_AP = require("users/ChenyangWei/Public:Modules/General/FeatureCollection_Analysis&Processing.js");


/* Object definition. */

// Set the major working directory.
var wd_Main = GATE.wd_Global;

// Load the raw HYBAS watersheds.
var rawBasins = ee.FeatureCollection("WWF/HydroSHEDS/v1/Basins/hybas_12");


/* Function definition. */

// Define a function to merge variables and watersheds.
var Merge_Watersheds = 
  FC_AP.combine_twoFtrCols_primaryGeometriesANDsecondaryProperties;


/* Load and merge the canopy height difference. */

// Load the canopy height difference.
var CanopyHt_Diff = ee.FeatureCollection(wd_Main
  + "Transect_Validation/"
  + "HYBASmeans_CanopyHt_Diff");

// Merge the variable and watersheds.
var CanopyHt_Diff_withGeom = Merge_Watersheds(
  rawBasins, CanopyHt_Diff, 
  "HYBAS_ID", "HYBAS_ID");


/* Load and merge the NDVI difference. */

// Load the NDVI difference.
var NDVI_Diff = ee.FeatureCollection(wd_Main
  + "Transect_Validation/"
  + "HYBASmeans_NDVI_Diff");

// Merge the variable and watersheds.
var NDVI_Diff_withGeom = Merge_Watersheds(
  rawBasins, NDVI_Diff, 
  "HYBAS_ID", "HYBAS_ID");


var output = false; // true OR false.

if (!output) {
  
  // Check the results.
  FC_AP.Print_FtrColInfo(
    "CanopyHt_Diff_withGeom:", 
    CanopyHt_Diff_withGeom); // 66749.

  FC_AP.Print_FtrColInfo(
    "NDVI_Diff_withGeom:", 
    NDVI_Diff_withGeom); // 66758.

} else {
  
  var CanopyHt_Diff_FileName = 
    "HYBASmeans_CanopyHt_Diff_withGeom";
  
  var NDVI_Diff_FileName = 
    "HYBASmeans_NDVI_Diff_withGeom";
  
  
  /* Output the results to Google Drive. */
  
  // Canopy height difference.
  Export.table.toDrive({
    collection: CanopyHt_Diff_withGeom, 
    description: CanopyHt_Diff_FileName, 
    folder: CanopyHt_Diff_FileName, 
    fileFormat: "SHP"
  });
  
  // NDVI difference.
  Export.table.toDrive({
    collection: NDVI_Diff_withGeom, 
    description: NDVI_Diff_FileName, 
    folder: NDVI_Diff_FileName, 
    fileFormat: "SHP"
  });
  
  
  /* Output the results to GEE Asset. */
  
  // Canopy height difference.
  Export.table.toAsset({
    collection: CanopyHt_Diff_withGeom, 
    description: CanopyHt_Diff_FileName, 
    assetId: wd_Main
      + "Transect_Validation/"
      + CanopyHt_Diff_FileName
  });
  
  // NDVI difference.
  Export.table.toAsset({
    collection: NDVI_Diff_withGeom, 
    description: NDVI_Diff_FileName, 
    assetId: wd_Main
      + "Transect_Validation/"
      + NDVI_Diff_FileName
  });
}

