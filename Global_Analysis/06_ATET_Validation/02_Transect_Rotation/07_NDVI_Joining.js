/**
 * Introduction:
 * 
 *  1) Join each pair of the rotated segments with NDVI.
 * 
 * Updated: 10/6/2023.
 * 
 * Runtime: .
*/


/* Module loading. */

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");

var FC_AP = require(
  "users/ChenyangWei/Public:Modules/General/FeatureCollection_Analysis&Processing.js");


/* Object definition. */

// Define a property name.
var propertyName_Str = "NDVI";

// Define a List of properties.
var properties_List = ee.List(["ET_ID", "theta"]);

// Define a Filter of ID.
var ID_Filter = ee.Filter.equals({
  leftField: "ET_ID", 
  rightField: "ET_ID"
});

// Define a Filter of theta.
var theta_Filter = ee.Filter.equals({
  leftField: "theta", 
  rightField: "theta"
});

// Combine the two Filters.
var combined_Filter = ee.Filter.and(
  ID_Filter, 
  theta_Filter
);


/* Dataset loading. */

// Load the rotated transect centerlines.
var rotatedCLs_FC = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Validation/"
    + "Rotation/"
    + "rotatedCLs_SixAngles"
);

// Load the rotated segments with the average NDVI.
var rotatedSegments_FC = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Validation/"
    + "Rotation/"
    + "rotatedSegments_AvgElv_NDVI"
);


/* 1) Join each segment pair. */

// Divide the rotated segments into two groups.
var segments_Group1_FC = rotatedSegments_FC
  .filter(ee.Filter.eq({
    name: "Segment_ID", 
    value: 1
  }));

var segments_Group2_FC = rotatedSegments_FC
  .filter(ee.Filter.eq({
    name: "Segment_ID", 
    value: 2
  }));

// Select and rename the properties of interest.
segments_Group1_FC = segments_Group1_FC
  .select({
    propertySelectors: properties_List.cat([
      "avg_Elv", "avg_" + propertyName_Str
    ]),
    newProperties: properties_List.cat([
      "Elv_1", propertyName_Str + "_1"
    ])
  });

segments_Group2_FC = segments_Group2_FC
  .select({
    propertySelectors: properties_List.cat([
      "avg_Elv", "avg_" + propertyName_Str
    ]),
    newProperties: properties_List.cat([
      "Elv_2", propertyName_Str + "_2"
    ])
  });

// Join the two groups of segments.
var joinedSegments_FC = FC_AP.Join_2FC_byFilter(
  segments_Group1_FC, 
  segments_Group2_FC, 
  combined_Filter);

// Combine the segment properties with
//  the rotated centerlines.
rotatedCLs_FC = rotatedCLs_FC.select(properties_List);

var rotatedCLs_SegmentInfo_FC = FC_AP.Join_2FC_byFilter(
  rotatedCLs_FC, 
  joinedSegments_FC, 
  combined_Filter);

// Remove centerlines with NULL properties.
rotatedCLs_SegmentInfo_FC = rotatedCLs_SegmentInfo_FC
  .filter(ee.Filter.notNull([
    "Elv_1", "Elv_2", 
    propertyName_Str + "_1",
    propertyName_Str + "_2"
  ]));


/* Check/output the result(s). */

var output = true; // true OR false.

if (!output) {
  
  // Check the dataset(s).
  FC_AP.Print_FCinfo("rotatedCLs_FC:",
    rotatedCLs_FC); // 400656.
  
  FC_AP.Print_FCinfo("rotatedSegments_FC:",
    rotatedSegments_FC); // 801312.
  
  FC_AP.Print_FCinfo("segments_Group1_FC:",
    segments_Group1_FC); // 400656.
  
  FC_AP.Print_FCinfo("segments_Group2_FC:",
    segments_Group2_FC); // 400656.
  
  print("joinedSegments_FC:",
    joinedSegments_FC.first());
  
  // Visualization.
  Map.setOptions("Satellite");
  Map.setCenter(-123.35479, 47.81902, 14);
  
  Map.addLayer(rotatedSegments_FC,
    {color: "FFFF00"},
    "rotatedSegments_FC");
  
  Map.addLayer(rotatedCLs_FC,
    {color: "0000FF"},
    "rotatedCLs_FC");
  
  Map.addLayer(segments_Group1_FC,
    {color: "FF0000"},
    "segments_Group1_FC");
  
  Map.addLayer(segments_Group2_FC,
    {color: "00FF00"},
    "segments_Group2_FC");
  
} else {
  
  // Output to Asset.
  var fileName = "rotatedCLs_Segment" 
    + propertyName_Str;
  
  Export.table.toAsset({
    collection: rotatedCLs_SegmentInfo_FC, 
    description: fileName, 
    assetId: GATE.wd_Global 
      + "Elevational_Transects/"
      + "Validation/"
      + "Rotation/"
      + fileName
  });
}

