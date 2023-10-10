/**
 * Introduction:
 * 
 *  1) Extend the sampled transects by a ratio
 *    between 1/8 (2^-3) and 8 (2^3).
 * 
 * Updated: 10/9/2023.
 * 
 * Runtime: 17m.
*/


/* Module loading. */

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");

var FC_AP = require(
  "users/ChenyangWei/Public:Modules/General/FeatureCollection_Analysis&Processing.js");


/* Object definition. */

// Determine a List of the ratio power.
var ratioPower_List = ee.List.sequence({
  start: -3, 
  end: 3, 
  step: 1
});

// Remove the zero power (no extension).
ratioPower_List = ratioPower_List.remove(0);


/* Function definition. */

// Compute the x/y-coordinate of a new endpoint.
var Compute_EndCoord = 
  function(rawEndCoord_Num, ctrCoord_Num, ratio_Num) {
      
      var rawCoordDiff_Num = ee.Number(rawEndCoord_Num)
        .subtract(ctrCoord_Num);
      
      var newCoordDiff_Num = rawCoordDiff_Num
        .multiply(ratio_Num);
      
      var newEndCoord_Num = newCoordDiff_Num
        .add(ctrCoord_Num);
      
      return newEndCoord_Num;
  };


/* Dataset loading. */

// Load the sampled elevational transects.
var sampled_Transects_FC = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Validation/"
    + "HybasSampled_ATETs"
);


/* 1) Extend the sampled transects. */

// Perform the extension operations for each ratio.
var extendedTransects_AllRatios_List = ratioPower_List.map(
    function Extend_Transects_ByRatio(ratioPower_Num) {
      
      // Compute the ratio value.
      var ratioValue_Num = ee.Number(2).pow(ratioPower_Num);
      
      // Extend each transect.
      var extendedTransects_EachRatio_FC = 
        sampled_Transects_FC.map(
          function Extend_EachTransect(rawTransect_Ftr) {
            
            // Extract the coordinates of the lower endpoint.
            var LEnd_Lon = rawTransect_Ftr.get("LEnd_Lon");
            var LEnd_Lat = rawTransect_Ftr.get("LEnd_Lat");
            
            // Extract the coordinates of the upper endpoint.
            var UEnd_Lon = rawTransect_Ftr.get("UEnd_Lon");
            var UEnd_Lat = rawTransect_Ftr.get("UEnd_Lat");
            
            // Extract the coordinates of the geometric centroid.
            var Ctr_Lon = rawTransect_Ftr.get("Ctr_Lon");
            var Ctr_Lat = rawTransect_Ftr.get("Ctr_Lat");
            
            // Determine the coordinates of the new 
            //  lower endpoint.
            var newLEnd_Lon = Compute_EndCoord(
              LEnd_Lon, Ctr_Lon, ratioValue_Num);
            
            var newLEnd_Lat = Compute_EndCoord(
              LEnd_Lat, Ctr_Lat, ratioValue_Num);
            
            // Determine the coordinates of the new 
            //  upper endpoint.
            var newUEnd_Lon = Compute_EndCoord(
              UEnd_Lon, Ctr_Lon, ratioValue_Num);
            
            var newUEnd_Lat = Compute_EndCoord(
              UEnd_Lat, Ctr_Lat, ratioValue_Num);
            
            // Construct a LineString between 
            //  the two new endpoints.
            var newCenterline_Geom = ee.Geometry.LineString({
              coords: [[newLEnd_Lon, newLEnd_Lat], 
                [newUEnd_Lon, newUEnd_Lat]]
            });
            
            // Get the length of the extended LineString.
            var extendedCL_Length = newCenterline_Geom
              .length();
            
            // Calculate the segment length.
            var segment_Length = ee.Number(extendedCL_Length)
              .divide(2)
              .subtract(45); // Buffer size.
            
            // Create a centerline Feature with properties.
            var newCenterline_Ftr = 
              ee.Feature(newCenterline_Geom)
                .copyProperties({
                  source: rawTransect_Ftr, 
                  properties: ["ET_ID"]
                }).set({
                  ratio: ratioValue_Num,
                  extendedCL_Length: extendedCL_Length,
                  segment_Length: segment_Length,
                  endPt1_Lon: newLEnd_Lon,
                  endPt1_Lat: newLEnd_Lat,
                  endPt2_Lon: newUEnd_Lon,
                  endPt2_Lat: newUEnd_Lat
                });
              
            return newCenterline_Ftr;
          });
        
      return extendedTransects_EachRatio_FC;
    }
  );

// Convert the List to a FeatureCollection.
var extendedTransects_AllRatios_FC = 
  ee.FeatureCollection(extendedTransects_AllRatios_List)
    .flatten();
  

/* Check/output the result(s). */

var output = true; // true OR false.

if (!output) {
  
  // Check the dataset(s).
  FC_AP.Print_FCinfo("sampled_Transects_FC:",
    sampled_Transects_FC); // 66776.
  
  FC_AP.Print_FCinfo("extendedTransects_AllRatios_FC:",
    extendedTransects_AllRatios_FC); // 400656.
  
  // Visualization.
  Map.setOptions("Satellite");
  Map.setCenter(-123.35464, 47.81906, 12);
  
  Map.addLayer(sampled_Transects_FC,
    {color: "FF0000"},
    "sampled_Transects_FC"
  );
  
  // Map.addLayer(extendedTransects_AllRatios_FC.limit(6),
  //   {color: "0000FF"},
  //   "extendedTransects_AllRatios_FC (6)"
  // );
  
  // Map.addLayer(extendedTransects_AllRatios_FC.limit(1),
  //   {color: "00FFFF"},
  //   "extendedTransects_AllRatios_FC (1)"
  // );
  
} else {
  
  // Output to Asset.
  var fileName = "extendedCLs_SixRatios";
  
  Export.table.toAsset({
    collection: extendedTransects_AllRatios_FC, 
    description: fileName, 
    assetId: GATE.wd_Global 
      + "Elevational_Transects/"
      + "Validation/"
      + "Extension/"
      + fileName
  });
}

