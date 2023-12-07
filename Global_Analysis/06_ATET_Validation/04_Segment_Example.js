/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var poi = /* color: #d63000 */ee.Geometry.Point([-123.35468261673893, 47.81900558992746]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/**
 * Introduction:
 * 
 *  1) Segment an example of the sampled transects.
 * 
 * Updated: 10/31/2023.
 * 
 * Runtime: < 1m.
*/


/* Module loading. */

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");


/* Function definition. */

// Segment and buffer the extended centerlines.
var Segment_Transects = function(rawTransect_Ftr) {
  
  // Extract the coordinates of the two endpoints.
  var LEnd_Lon = rawTransect_Ftr.get("LEnd_Lon");
  
  var LEnd_Lat = rawTransect_Ftr.get("LEnd_Lat");
  
  var UEnd_Lon = rawTransect_Ftr.get("UEnd_Lon");
  
  var UEnd_Lat = rawTransect_Ftr.get("UEnd_Lat");
  
  // Contruct the geometry of each endpoint.
  var LEnd_Geom = ee.Geometry.Point(
    [LEnd_Lon, LEnd_Lat]);
  
  var UEnd_Geom = ee.Geometry.Point(
    [UEnd_Lon, UEnd_Lat]);
  
  // Create a raw centerline.
  var rawCenterline_Geom = ee.Geometry.LineString([
    LEnd_Geom, UEnd_Geom
  ]);
  
  // Calculate the segment length.
  var segment_Length = ee.Number(rawCenterline_Geom
    .length())
    .divide(2)
    .subtract(45); // Buffer size.
  
  // Construct the two segments.
  var segment1_Ftr = rawCenterline_Geom
    .intersection(LEnd_Geom.buffer(segment_Length))
    .buffer(45);
  
  var segment2_Ftr = rawCenterline_Geom
    .intersection(UEnd_Geom.buffer(segment_Length))
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

// Load the sampled elevational transects.
var sampled_Transects_FC = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Validation/"
    + "HybasSampled_ATETs"
);


/* 1) Segment a transect example. */

// Select an example of transect.
var transectExample_FC = sampled_Transects_FC
  .filterBounds(poi);

// Segment the transect example.
var segmentExample_FC = transectExample_FC
  .map(Segment_Transects)
  .flatten();


/* Check/output the result(s). */

var output = true; // true OR false.

if (!output) {
  
  // Check the result(s).
  print("segmentExample_FC:",
    segmentExample_FC);
  
  // Visualization.
  Map.setOptions("Satellite");
  Map.setCenter(-123.35464, 47.81906, 14);
  
  Map.addLayer(sampled_Transects_FC,
    {color: "00FFFF"},
    "sampled_Transects_FC"
  );
  
  Map.addLayer(segmentExample_FC,
    {color: "FF0000"},
    "segmentExample_FC"
  );
  
} else {
  
  // Output to Drive.
  var fileName = "sampledSegment_Example";
  
  Export.table.toDrive({
    collection: segmentExample_FC, 
    description: fileName, 
    folder: fileName, 
    fileFormat: "SHP"
  });
}

