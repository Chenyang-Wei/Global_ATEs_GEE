/**
 * Introduction:
 * 
 *  1) Rotate the sampled transects by an angle 
 *    between -90 and 90 degrees.
 * 
 * Updated: 9/25/2023.
 * 
 * Runtime: .
*/


/* Module loading. */

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");


/* Object definition. */

// Determine a List of rotation angles 
//  (counterclockwise).
var theta_List = ee.List.sequence({
  start: -90, 
  end: 90, 
  step: 30
});

// Remove the zero degree (no rotation).
theta_List = theta_List.remove(0);


/* Function definition. */

// Function for rotating the longitude of a point.
var Rotate_Lon = 
  function(rawLon_Num, rawLat_Num, 
    sin_Num, cos_Num) {
      
      // x_1 * cos(theta).
      var lon_Cos_Num = ee.Number(rawLon_Num)
        .multiply(cos_Num);
      
      // y_1 * sin(theta).
      var lat_Sin_Num = ee.Number(rawLat_Num)
        .multiply(sin_Num);
      
      // x_2 = x_1 * cos(theta) - y_1 * sin(theta).
      var newLon_Num = lon_Cos_Num.subtract(lat_Sin_Num);
      
      return newLon_Num;
  };

// Function for rotating the latitude of a point.
var Rotate_Lat = 
  function(rawLon_Num, rawLat_Num, 
    sin_Num, cos_Num) {
      
      // x_1 * sin(theta).
      var lon_Sin_Num = ee.Number(rawLon_Num)
        .multiply(sin_Num);
      
      // y_1 * cos(theta).
      var lat_Cos_Num = ee.Number(rawLat_Num)
        .multiply(cos_Num);
      
      // y_2 = x_1 * sin(theta) + y_1 * cos(theta).
      var newLat_Num = lon_Sin_Num.add(lat_Cos_Num);
      
      return newLat_Num;
  };


/* Dataset loading. */

// Load the sampled elevational transects.
var sampled_Transects_FC = ee.FeatureCollection(
  GATE.wd_Global 
    + "Elevational_Transects/"
    + "Validation/"
    + "HybasSampled_ATETs"
);


/* 1) Rotate the sampled transects. */

// Perform the rotation operations for each angle.
var rotatedTransects_AllAngles_List = theta_List.map(
    function Rotate_Transects_ByAngle(theta_Num) {
      
      // Convert theta to radians.
      var theta_Radians = ee.Number(theta_Num)
        .divide(180).multiply(Math.PI);
      
      // Compute the sin and cos of theta.
      var sin_Theta = theta_Radians.sin();
      var cos_Theta = theta_Radians.cos();
      
      // Rotate each transect.
      var rotatedTransects_EachAngle_FC = 
        sampled_Transects_FC.map(
          function Rotate_EachTransect(rawTransect_Ftr) {
            
            // Extract the coordinates of the lower endpoint.
            var LEnd_Lon = rawTransect_Ftr.get("LEnd_Lon");
            var LEnd_Lat = rawTransect_Ftr.get("LEnd_Lat");
            
            // Extract the coordinates of the upper endpoint.
            var UEnd_Lon = rawTransect_Ftr.get("UEnd_Lon");
            var UEnd_Lat = rawTransect_Ftr.get("UEnd_Lat");
            
            // Extract the coordinates of the geometric centroid.
            var Ctr_Lon = rawTransect_Ftr.get("Ctr_Lon");
            var Ctr_Lat = rawTransect_Ftr.get("Ctr_Lat");
            
            // Compute the relative coordinates of the lower endpoint.
            var LEnd_Rel_Lon = ee.Number(LEnd_Lon).subtract(Ctr_Lon);
            var LEnd_Rel_Lat = ee.Number(LEnd_Lat).subtract(Ctr_Lat);
            
            // Compute the relative coordinates of the upper endpoint.
            var UEnd_Rel_Lon = ee.Number(UEnd_Lon).subtract(Ctr_Lon);
            var UEnd_Rel_Lat = ee.Number(UEnd_Lat).subtract(Ctr_Lat);
            
            // Rotate the lower endpoint.
            var newLEnd_Rel_Lon = Rotate_Lon(
              LEnd_Rel_Lon, LEnd_Rel_Lat, 
              sin_Theta, cos_Theta);
            
            var newLEnd_Rel_Lat = Rotate_Lat(
              LEnd_Rel_Lon, LEnd_Rel_Lat, 
              sin_Theta, cos_Theta);
            
            // Rotate the upper endpoint.
            var newUEnd_Rel_Lon = Rotate_Lon(
              UEnd_Rel_Lon, UEnd_Rel_Lat, 
              sin_Theta, cos_Theta);
            
            var newUEnd_Rel_Lat = Rotate_Lat(
              UEnd_Rel_Lon, UEnd_Rel_Lat, 
              sin_Theta, cos_Theta);
            
            // Compute the absolute coordinates of 
            //  the rotated lower endpoint.
            var newLEnd_Lon = ee.Number(newLEnd_Rel_Lon).add(Ctr_Lon);
            var newLEnd_Lat = ee.Number(newLEnd_Rel_Lat).add(Ctr_Lat);
            
            // Compute the absolute coordinates of 
            //  the rotated upper endpoint.
            var newUEnd_Lon = ee.Number(newUEnd_Rel_Lon).add(Ctr_Lon);
            var newUEnd_Lat = ee.Number(newUEnd_Rel_Lat).add(Ctr_Lat);
            
            // Construct a LineString between 
            //  the two rotated endpoints.
            var newCenterline_Geom = ee.Geometry.LineString({
              coords: [[newLEnd_Lon, newLEnd_Lat], 
                [newUEnd_Lon, newUEnd_Lat]]
            });
            
            // Get the length of the rotated LineString.
            var rotatedCL_Length = newCenterline_Geom.length();
            
            // Calculate the segment length.
            var segment_Length = ee.Number(rotatedCL_Length)
              .divide(2)
              .subtract(45); // Buffer size.
            
            // Create a centerline Feature with properties.
            var newCenterline_Ftr = ee.Feature(newCenterline_Geom)
              .copyProperties({
                source: rawTransect_Ftr, 
                properties: ["ET_ID"]
              }).set({
                theta: theta_Num,
                rotatedCL_Length: rotatedCL_Length,
                segment_Length: segment_Length,
                endPt1_Lon: newLEnd_Lon,
                endPt1_Lat: newLEnd_Lat,
                endPt2_Lon: newUEnd_Lon,
                endPt2_Lat: newUEnd_Lat
              });
              
            return newCenterline_Ftr;
        });
        
      return rotatedTransects_EachAngle_FC;
    }
  );

// Convert the List to a FeatureCollection.
var rotatedTransects_AllAngles_FC = 
  ee.FeatureCollection(rotatedTransects_AllAngles_List)
    .flatten();


/* Check/output the result(s). */

var output = true;

if (!output) {
  
  // Check the sampled transects.
  print("sampled_Transects_FC:", 
    sampled_Transects_FC.first(),
    sampled_Transects_FC.size()); // 66776.
  
  // Check the rotated transects.
  print("rotated_Transects_FC:", 
    rotatedTransects_AllAngles_FC.first(),
    rotatedTransects_AllAngles_FC.size()); // 400656.
  
  // Visualization.
  Map.setOptions("Satellite");
  Map.setCenter(-123.35464, 47.81906, 14);
  
  Map.addLayer(sampled_Transects_FC,
    {color: "FF0000"},
    "sampled_Transects_FC"
  );
  
  // Map.addLayer(rotatedTransects_AllAngles_FC,
  //   {color: "00FFFF"},
  //   "rotatedTransects_AllAngles_FC"
  // );
  
} else {
  
  // Output to Asset.
  var fileName = "rotatedCLs_SixAngles";
  
  Export.table.toAsset({
    collection: rotatedTransects_AllAngles_FC, 
    description: fileName, 
    assetId: GATE.wd_Global 
      + "Elevational_Transects/"
      + "Validation/"
      + fileName
  });
}

