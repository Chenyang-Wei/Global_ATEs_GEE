/**
 * Introduction:
 * 
 *  1) Compute the unweighted spatial average canopy height of 2020 and 
 *    the corresponding 10-m pixel number for each segment.
 * 
 * 
 * Need to check: 2.
 * 
 * Update: 7/31/2022.
 * 
 * Runtime: 1h.
 */


/* Load module(s). */

var GATE = require("users/ChenyangWei/Public:Modules/Global_ATE");
var TNA = require("users/ChenyangWei/Public:Modules/Transect_NDVI_Analysis");
var IMG = require("users/ChenyangWei/Public:Modules/Image_Analysis&Processing");


/* Setup. */

// Set the major working directory.
var wd_Main = GATE.wd_Europe   /**** 1) Need to change. ****/
  + "Elevational_Transect_Generation/";

// Load the transect segments.
var segments = ee.FeatureCollection(wd_Main
  + TNA.transectSegments_FullName);   /**** 2) Need to check. ****/

// Target projection.
var targetPrj = IMG.WGS84_10m;

// Load the 10-m global canopy height dataset of 2020.
var canopy_height = ee.Image('users/nlang/ETH_GlobalCanopyHeight_2020_10m_v1')
  .reproject(targetPrj);

// Whether test the algorithm.
var test = false; // true OR false.

if (test) {
  segments = segments.limit(100);
}


/* Compute the unweighted spatial average canopy height and 
  the corresponding 10-m pixel number for each segment. */

var segments_withAvgCanopyHt = TNA.Compute_UnWtdAvgVar_PxNum_perSegment(
  segments, canopy_height, 
  "avg_CanopyHt", "canopyHt_PxNum", 
  targetPrj);


if (test) { //// Check the datasets.

  print("segments_withAvgCanopyHt:", 
    segments_withAvgCanopyHt.first(),
    segments_withAvgCanopyHt.size());
  
} else { //// Export the result(s).
  
  var fileName = TNA.segments_withCanopyHt_FullName;
  
  Export.table.toAsset({
    collection: segments_withAvgCanopyHt, 
    description: fileName, 
    assetId: wd_Main
      + fileName
  });
}


/* Map the datasets. */

if (test) {

  print("segments:", 
    segments.first());

  Map.setOptions("satellite");
  Map.centerObject(segments.first(), 12);
  
  Map.addLayer(canopy_height, {
    min: 0, max: 50, palette: "0000FF, FFFFFF, 00FF00"
  }, "canopy_height");
  
  Map.addLayer(segments.filter(ee.Filter.eq("SegmentID", 1)), 
    {color: "FF0000"}, "Lower segments");
  
  Map.addLayer(segments.filter(ee.Filter.eq("SegmentID", 2)), 
    {color: "FFFF00"}, "Upper segments");
}

