/**
 * Introduction:
 * 1) Identify the locally steepest centerline based on
 *  the individual Polygons of the unioned mid-segment buffers
 *  of each basin.
 * 
 * Update: 10/20/2021.
 * 
 * Total update number: 1.
 * 
 * Runtime: 3h.
 */


/* Load module(s). */

var GATE = require("users/ChenyangWei/Public:Modules/Global_ATE");


/* Data and function preparation. */

// Set the major working directory.
var wd_Main = GATE.wd_Europe
  + "Elevational_Transect_Generation/"; /**** 1) Need to update. ****/

// Load the individual Polygons of the unioned mid-segment buffers
//  of each basin.
var unionedBuffers_IndivPlgs = ee.FeatureCollection(wd_Main
  + GATE.unionedIndivPlgs_perBasin_fileName);

// Load the mid-quarter segments with Hybas IDs.
var midQuarters_withHybasIDs = ee.FeatureCollection(wd_Main
  + GATE.midQuarters_withHybasIDs_fileName);

// Load the centerlines with Hybas IDs.
var CLs_withHybasIDs = ee.FeatureCollection(wd_Main
  + GATE.CLs_withHybasIDs_fileName);


/* Identify the locally steepest centerlines based on
  the individual Polygons of the unioned mid-segment buffers 
  of each basin. */

var allSteepestCLs = GATE.identifySteepestCLs_byBasin_otherContinents(
  unionedBuffers_IndivPlgs, midQuarters_withHybasIDs, CLs_withHybasIDs
);


if (false) { // true OR false.

  print("unionedBuffers_IndivPlgs:", 
    unionedBuffers_IndivPlgs.first(),
    unionedBuffers_IndivPlgs.size());

  print("midQuarters_withHybasIDs:", 
    midQuarters_withHybasIDs.first(),
    midQuarters_withHybasIDs.size());

  print("CLs_withHybasIDs:", 
    CLs_withHybasIDs.first(),
    CLs_withHybasIDs.size());

  print("allSteepestCLs:", 
    allSteepestCLs.first());

} else {
  //// Export the result.
  var fileName = GATE.allSteepestCLs_fileName;
  
  Export.table.toAsset({
    collection: allSteepestCLs, 
    description: fileName, 
    assetId: wd_Main + fileName
  });
}

