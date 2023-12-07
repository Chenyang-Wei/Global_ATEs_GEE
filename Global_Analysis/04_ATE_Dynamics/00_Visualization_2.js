/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var ROI = 
    /* color: #98ff00 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-123.33475212857046, 47.82937950291331],
          [-123.33475212857046, 47.80586455324803],
          [-123.26059441372671, 47.80586455324803],
          [-123.26059441372671, 47.82937950291331]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/**
 * Introduction:
 * 
 *  1) Visualize the annual NDVI data.
 * 
 *  2) Visualize the annual ATEI data.
 * 
 * Runtime: N/A.
 * 
 * Updated: 12/7/2023.
*/


/* Load module(s). */

var IMG = require("users/ChenyangWei/Public:Modules/General/Image_Analysis&Processing.js");
var ATEI_EA = require("users/ChenyangWei/Public:Modules/Treeline/ATEI_Estimation&Analysis.js");
var GATE = require("users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");
var TNA = require("users/ChenyangWei/Public:Modules/Treeline/Transect_NDVI_Analysis.js");
var VIS = require("users/ChenyangWei/Public:Modules/General/Visualization.js");


/* Object definition. */

// Determine the continent ID (0 ~ 5).
var contID = 0;

// Determine the target projection.
var targetPrj = IMG.WGS84_30m;

// Create a list of the working directories.
var WDs_List = ATEI_EA.WDs_AllContinents_List;

// Define a list of the AOIs.
var AOIs_List = ATEI_EA.AOIs_AllContinents_List;


/* Function definition. */

// Define a function to load the annual NDVIs of 
//  the buffered new CATE in continents 
//  other than North America.
var Read_AnnualNDVIs_BufferedCATE = function(wd_Cont) {
  var annualNDVIs_Cont = 
    TNA.loadAnnualNDVIs_nonNorthAmerica(wd_Cont)
      .reproject(targetPrj);
  
  return annualNDVIs_Cont;
};

// Define a function to load and reproject the new CATE 
//  of each continent.
var Read_NewCATE = function(wd_Cont) {
  var newCATE_Cont = ee.Image(wd_Cont
    + "Climate-Based_ATE/" 
    + GATE.newCATE_fileName)
    .reproject(targetPrj);
  
  return newCATE_Cont;
};

// Define a function to load the annual ATEIs in 
//  the new CATE of each continent.
var Read_AnnualATEIs = function(wd_Cont) {
  var annualATEIs_Cont = ee.Image(wd_Cont
    + "ATEI_Estimation/" 
    + "annualATEIs_1985to2020_NewCATE")
    .reproject(targetPrj);
  
  return annualATEIs_Cont;
};


/* Acquire the information of each continent. */

// Determine the working directory of the continent.
var contWD = WDs_List[contID];

// Determine the AOI of the continent.
var contAOI = AOIs_List[contID];


/* Load the annual NDVIs of the buffered new CATE. */

// Load the new CATE.
var newCATE = Read_NewCATE(contWD);

var annualNDVIs;

if (contID === 0) {
  // Load the annual NDVIs in North America.
  annualNDVIs = ee.Image(GATE.wd_NorthAmerica
    + "ATEI_Estimation/"
    + TNA.annualMaxNDVI_300mBufNewCATE_NorthAmerica_fileName)
    .reproject(targetPrj)
    .updateMask(newCATE);
  
} else if (contID === 5) {
  // Load the annual NDVIs in Asia 
  //  (using a different working directory).
  annualNDVIs = Read_AnnualNDVIs_BufferedCATE(
    GATE.wd_Asia_2)
    .updateMask(newCATE);
  
} else {
  // Load the annual NDVIs in other continents.
  annualNDVIs = Read_AnnualNDVIs_BufferedCATE(
    contWD)
    .updateMask(newCATE);
}


/* Load the annual ATEIs during 1985-2020
  in the new CATE by continent. */

var annualATEIs;

if (contID === 5) {
  
  /* Asia. */
  
  // Load the annual ATEIs.
  annualATEIs = Read_AnnualATEIs(GATE.wd_Asia_2);

} else if (contID === 4) {
  
  /* Europe. */
  
  // Load the annual ATEIs.
  annualATEIs = Read_AnnualATEIs(GATE.wd_Europe_2);

} else {
  
  /* Other continents. */
  
  // Load the annual ATEIs.
  annualATEIs = Read_AnnualATEIs(contWD);
}


/* Visualize the transects. */

var ATETs = ee.FeatureCollection(
  "users/treeline/Global/ATE_Dynamics/"
    + "filteredTransects_ATEelevationTrend_Gte20obs");

var empty = ee.Image().byte();

var ATETs_Img = empty
  .paint({featureCollection: ATETs, color: 1, width: 1})
  .visualize({palette: '0000ff'});


/* Visualize the NDVI and ATEI datasets. */

var NDVI_vis = VIS.NDVI_vis;

var ATEI_vis = {
  min: 0, max: 1, palette: "ffffff, ff0000"
};

var ATEI_thres = 0.5460715;

// Background.
var background_Img = ee.Image.constant(0)
  .visualize({palette: '000000'});

// Define a hillshade layer.
var hillshade = ee.Terrain.hillshade(
  GATE.load_ALOSelevation(ROI, targetPrj)
  // Exaggerate the elevation to increase contrast in hillshade.
  .multiply(100))
  .updateMask(newCATE);

// NDVI + ATEI.
var ATEI_thres = 0.5460715;

var years_List = ee.List.sequence(1985, 2020);

var combined_IC = ee.ImageCollection.fromImages(
  years_List.map(function(year) {
    // Derive band names.
    var year_Int = ee.Number(year).int();
    var NDVIname_Str = ee.String("smdNDVI_")
      .cat(year_Int);
    var ATEIname_Str = ee.String("ATEI_")
      .cat(year_Int);
    
    // Blend images.
    var NDVI_img = annualNDVIs
      .select([NDVIname_Str])
      .visualize(NDVI_vis)
      .visualize({opacity: 0.6});
    
    var annual_ATEI = annualATEIs
      .select([ATEIname_Str]);
    
    var ATEI_img = annual_ATEI.updateMask(
      annual_ATEI.gt(ATEI_thres))
      .visualize(ATEI_vis)
      .visualize({opacity: 0.6});
    
    var blended_Img = NDVI_img
      .blend(ATEI_img)
      .blend(ATETs_Img);
    
    return hillshade.blend(blended_Img);
  }).add(background_Img));

// NDVI.
var NDVI_IC = ee.ImageCollection.fromImages(
  years_List.map(function(year) {
    // Derive band names.
    var year_Int = ee.Number(year).int();
    var NDVIname_Str = ee.String("smdNDVI_")
      .cat(year_Int);
    
    // Blend images.
    var NDVI_img = annualNDVIs
      .select([NDVIname_Str])
      .visualize(NDVI_vis)
      .visualize({opacity: 0.6});
    
    var blended_Img = NDVI_img
      .blend(ATETs_Img);
    
    return hillshade.blend(blended_Img);
  }).add(background_Img));

// Define animation arguments.
var videoArgs = {
  dimensions: 1200,
  region: ROI,
  framesPerSecond: 2,
  crs: 'EPSG:4326'
};

// Display the animations.
print(ui.Thumbnail(combined_IC, videoArgs));
print(combined_IC.getVideoThumbURL(videoArgs));

print(ui.Thumbnail(NDVI_IC, videoArgs));
print(NDVI_IC.getVideoThumbURL(videoArgs));


/* Display the results. */

Map.setOptions("Satellite");
Map.centerObject(ROI, 12);

var year1 = 1993;

Map.addLayer(annualNDVIs.select("smdNDVI_" + year1), 
  NDVI_vis, 
  "smdNDVI_" + year1, 
  true);

Map.addLayer(annualATEIs.select("ATEI_" + year1),
  ATEI_vis,
  "ATEI_" + year1,
  true, 1
);

var year2 = 2020;

Map.addLayer(annualNDVIs.select("smdNDVI_" + year2), 
  NDVI_vis, 
  "smdNDVI_" + year2, 
  true);

Map.addLayer(annualATEIs.select("ATEI_" + year2),
  ATEI_vis,
  "ATEI_" + year2,
  true, 1
);

Map.addLayer(ATETs,
  {color: "0000ff"},
  "ATETs",
  true, 1
);

