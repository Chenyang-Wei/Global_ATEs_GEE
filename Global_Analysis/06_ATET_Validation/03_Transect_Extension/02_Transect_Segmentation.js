/**
 * Introduction:
 * 
 *  1) Keep the extended transect samples > 90m
 *    (i.e., the segment length > 0m).
 * 
 *  2) Segment the qualified transect centerlines.
 * 
 * Updated: 10/10/2023.
 * 
 * Runtime: 3h.
*/


/* Module loading. */

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");

var FC_AP = require(
  "users/ChenyangWei/Public:Modules/General/FeatureCollection_Analysis&Processing.js");


/* Function definition. */

// Segment and buffer the extended centerlines.
var Segment_Transects = function(rawCenterline_Ftr) {
  
  // Extract the coordinates of the two endpoints.
  var endPt1_Lon = rawCenterline_Ftr.get("endPt1_Lon");
  
  var endPt1_Lat = rawCenterline_Ftr.get("endPt1_Lat");
  
  var endPt2_Lon = rawCenterline_Ftr.get("endPt2_Lon");
  
  var endPt2_Lat = rawCenterline_Ftr.get("endPt2_Lat");
  
  // Contruct the geometry of each endpoint.
  var endPt1_Geom = ee.Geometry.Point(
    [endPt1_Lon, endPt1_Lat]);
  
  var endPt2_Geom = ee.Geometry.Point(
    [endPt2_Lon, endPt2_Lat]);
  
  // Extract the length of each segment.
  var segment_Length = rawCenterline_Ftr
    .get("segment_Length");
  
  // Construct the two segments.
  var segment1_Ftr = rawCenterline_Ftr
    .intersection(endPt1_Geom.buffer(segment_Length))
    .buffer(45);
  
  var segment2_Ftr = rawCenterline_Ftr
    .intersection(endPt2_Geom.buffer(segment_Length))
    .buffer(45);
  
  // Set an ID for each segment.
  segment1_Ftr = ee.Feature(segment1_Ftr)
    .set("Segment_ID", 1);
  
  segment2_Ftr = ee.Feature(segment2_Ftr)
    .set("Segment_ID", 2);
  
  // Combine each pair of segments 
  //  into a FeatureCollection.
  var segmentPair_FC = ee.FeatureCollection(
    [segment1_Ftr, segment2_Ftr]
  );
  
  return segmentPair_FC;
};


/* Dataset loading. */

// Load the extended transect samples.
var extended_Transects_FC = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Validation/"
    + "Extension/"
    + "extendedCLs_SixRatios"
);


/* 1) Keep the segment length > 0m. */

// Filter the extended transects.
var filtered_Transects_FC = extended_Transects_FC
  .filter(ee.Filter.gt({
    name: "segment_Length", 
    value: 0
  }));


/* 2) Segment the qualified transects. */

var segmented_Transects_FC = filtered_Transects_FC
  .map(Segment_Transects)
  .flatten();


/* Check/output the result(s). */

var output = true; // true OR false.

if (!output) {
  
  // Check the extended transects.
  FC_AP.Print_FCinfo(
    "extended_Transects_FC:", 
    extended_Transects_FC); // 400656.
  
  print("filtered_Transects_FC:", 
    filtered_Transects_FC
      .aggregate_min("extendedCL_Length"),
    filtered_Transects_FC
      .aggregate_min("segment_Length"),
    filtered_Transects_FC.size()); // 378132.
  
  // FC_AP.Print_FCinfo(
  //   "segmented_Transects_FC:", 
  //   segmented_Transects_FC);
  
  // Visualization.
  Map.setOptions("Satellite");
  Map.setCenter(-123.35464, 47.81906, 14);
  
  // Map.addLayer(segmented_Transects_FC,
  //   {color: "00FFFF"},
  //   "segmented_Transects_FC"
  // );
  
  Map.addLayer(extended_Transects_FC,
    {color: "FF0000"},
    "extended_Transects_FC"
  );
  
} else {
  
  // Output to Asset.
  var fileName = "segmented_ExtendedATETs";
  
  Export.table.toAsset({
    collection: segmented_Transects_FC, 
    description: fileName, 
    assetId: GATE.wd_Global 
      + "Elevational_Transects/"
      + "Validation/"
      + "Extension/"
      + fileName
  });
}

