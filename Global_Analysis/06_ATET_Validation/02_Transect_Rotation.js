/**
 * Introduction:
 * 
 *  1) Rotate the sampled transects (-90 ~ 90).
 * 
 *  2) Segment the rotated transects.
 * 
 *  3) Operation #3.
 * 
 * Updated: 9/22/2023.
 * 
 * Runtime: N/A.
*/


/* Module loading. */

var GATE = require(
  "users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");


/* Object definition. */


/* Function definition. */

// /**
// * Rotate a point Feature around an origin Feature
// *  by a certain angle.
// * 
// * @param {Number} Angle_Num - Rotation angle.
// * @param {Number} Point_X_Num - The X-coordinate of the point Feature.
// * @param {Number} Point_Y_Num - The Y-coordinate of the point Feature.
// * @param {Number} Origin_X_Num - The X-coordinate of the origin Feature.
// * @param {Number} Origin_Y_Num - The Y-coordinate of the origin Feature.
// * 
// * @return {return type} - description
// */
// var Rotate_PointFtr = 
//   function(Angle_Num, 
//     Point_X_Num, Point_Y_Num, 
//     Origin_X_Num, Origin_Y_Num) {
//       // // Determine the point coordinates relative to
//       // //  the origin.
//       // var X_Coord = ee.Number(Point_X_Num).subtract(Origin_X_Num);
//       // var Y_Coord = ee.Number(Point_Y_Num).subtract(Origin_Y_Num);
      
//       return ee.Feature(ee.Geometry.Point({
//         coords: [Point_X_Num, Point_Y_Num]
//       }));
//   };

// Function for rotating the longitude of a point.
var Rotate_Lon = 
  function(rawLon_Num, rawLat_Num, 
    sin_Num, cos_Num) {
      
      var lon_Cos_Num = ee.Number(rawLon_Num)
        .multiply(cos_Num);
      
      var lat_Sin_Num = ee.Number(rawLat_Num)
        .multiply(sin_Num);
      
      var newLon_Num = lon_Cos_Num.subtract(lat_Sin_Num);
      
      return newLon_Num;
  };

// Function for rotating the latitude of a point.
var Rotate_Lat = 
  function(rawLon_Num, rawLat_Num, 
    sin_Num, cos_Num) {
      
      var lon_Sin_Num = ee.Number(rawLon_Num)
        .multiply(sin_Num);
      
      var lat_Cos_Num = ee.Number(rawLat_Num)
        .multiply(cos_Num);
      
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

// Determine the rotation angle.
var theta = -90;

// Convert theta to radians.
var theta_Radians = ee.Number(theta)
  .divide(180).multiply(Math.PI);

// Compute the sin and cos of theta.
var sin_Theta = theta_Radians.sin();
var cos_Theta = theta_Radians.cos();

print(sin_Theta, cos_Theta);

var rotated_Transects_FC = 
  sampled_Transects_FC.map(function(rawTransect_Ftr) {
    // Extract the coordinates of the lower and upper endpoints.
    var LEnd_Lon = rawTransect_Ftr.get("LEnd_Lon");
    var LEnd_Lat = rawTransect_Ftr.get("LEnd_Lat");
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
    
    return ee.Feature(ee.Geometry.Point({
        coords: [Ctr_Lon, Ctr_Lat]
      })).set({sth: newLEnd_Rel_Lat});
  });

/* 2) Operation #2. */


/* 3) Operation #3. */


var output = false;

if (!output) {
  
  /* Check the result(s). */
  
  // Check the sampled transects.
  print("sampled_Transects_FC:", 
    sampled_Transects_FC.first(),
    sampled_Transects_FC.size()); // 66776.
  
  // Check the rotated transects.
  print("rotated_Transects_FC:", 
    rotated_Transects_FC.first(),
    rotated_Transects_FC.size()); // 66776.
  
  // Visualization.
  Map.setOptions("Satellite");
  Map.setCenter(-123.35464, 47.81906, 14);
  
  Map.addLayer(sampled_Transects_FC,
    {color: "FF0000"},
    "sampled_Transects_FC"
  );
  
  Map.addLayer(rotated_Transects_FC,
    {color: "00FFFF"},
    "rotated_Transects_FC"
  );
  
} else {
  
  /* Output the result(s).*/
  
}

