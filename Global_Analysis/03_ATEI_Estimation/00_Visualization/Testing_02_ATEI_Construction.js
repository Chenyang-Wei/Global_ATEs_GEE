/**
 * Introduction:
 * 
 *  1) Visualize the normalized gradient component.
 * 
 *  2) Visualize the interaction term.
 * 
 * Runtime: N/A.
 * 
 * Updated: 12/3/2023.
*/


/* Load module(s). */

var IMG = require("users/ChenyangWei/Public:Modules/General/Image_Analysis&Processing.js");
var ATEI_EA = require("users/ChenyangWei/Public:Modules/Treeline/ATEI_Estimation&Analysis.js");
var GATE = require("users/ChenyangWei/Public:Modules/Treeline/Global_ATE.js");
var TNA = require("users/ChenyangWei/Public:Modules/Treeline/Transect_NDVI_Analysis.js");
var VIS = require("users/ChenyangWei/Public:Modules/General/Visualization.js");


/* Object definition. */

// Determine the continent ID (0 ~ 5).
var contID = 3;

// Determine the target projection.
var targetPrj = IMG.WGS84_30m;

// Create a list of the working directories.
var WDs_List = ATEI_EA.WDs_AllContinents_List;

// Define a list of the AOIs.
var AOIs_List = ATEI_EA.AOIs_AllContinents_List;

// Load the elevational transects.
var ATETs = ee.FeatureCollection(
  "users/treeline/Global/Elevational_Transects/"
    + "Alpine_Treeline_Elevational_Transects_v1_0");


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

// Define a function to load the gradient direction of 
//  the median-smoothed elevation.
var Read_MedElvDir = function(wd_Cont) {
  var medElvDir_Cont = ee.Image(wd_Cont
    + "ATEI_Estimation/" 
    + "medianSmdElv_GradDir_NewCATE")
    .reproject(targetPrj);
  
  return medElvDir_Cont;
};

// Define a function to load the smoothed open-forest NDVI 
//  in each continent.
var Read_SmdOpenfNDVI = function(wd_Cont) {
  var smdOpenfNDVI_Cont = ee.Image(wd_Cont
    + "ATEI_Estimation/OpenForestNDVI/" 
    + "3kmSmoothed_OpenForestNDVI_NewCATE")
    .reproject(targetPrj)
    .rename("OpenF_NDVI");
  
  return smdOpenfNDVI_Cont;
};

// Define a function to load the smaller NDVI difference 
//  in each continent.
var Read_SmallerNDVIdiff = function(wd_Cont) {
  var smallerNDVIdiff_Cont = ee.Image(wd_Cont
    + "ATEI_Estimation/" 
    + "3kmSmoothedLcNDVIs_SmallerDiff")
    .reproject(targetPrj)
    .rename("NDVI_diff");
  
  return smallerNDVIdiff_Cont;
};


/* Acquire the information of each continent. */

// Determine the working directory of the continent.
var contWD = WDs_List[contID];

// Determine the AOI of the continent.
var contAOI = AOIs_List[contID];


/* Load the annual NDVIs of the buffered new CATE. */

var annualNDVIs;

if (contID === 0) {
  // Load the annual NDVIs in North America.
  annualNDVIs = ee.Image(GATE.wd_NorthAmerica
    + "ATEI_Estimation/"
    + TNA.annualMaxNDVI_300mBufNewCATE_NorthAmerica_fileName)
    .reproject(targetPrj);
  
} else if (contID === 5) {
  // Load the annual NDVIs in Asia 
  //  (using a different working directory).
  annualNDVIs = Read_AnnualNDVIs_BufferedCATE(
    GATE.wd_Asia_2);
  
} else {
  // Load the annual NDVIs in other continents.
  annualNDVIs = Read_AnnualNDVIs_BufferedCATE(
    contWD);
}


/* Load other ATEI variables by continent. */

// Load the new CATE.
var newCATE = Read_NewCATE(contWD);

// Load the gradient direction of 
//  the median-smoothed elevation.
var medElv_Dir = Read_MedElvDir(contWD);

// Load the smoothed open-forest NDVI.
var smdOpenfNDVI = Read_SmdOpenfNDVI(contWD);

// Load the smaller NDVI difference.
var smallerNDVIdiff = Read_SmallerNDVIdiff(contWD);

  
/* Construct the ATEIs by year. */

// Determine the coefficients in the logistic regression.
var Intercept = -1.9203;
var Coef_green = -3.3828;
var Coef_Mag_dir = 24.9804;
var Coef_green_dir = 5.7058;

// Derive the band names of NDVI and ATEI.
var NDVI_bandName_Str = "smdNDVI_2020";

var ATEI_bandName_Str = "ATEI_2020";

// Select the annual NDVI.
var annual_NDVI = annualNDVIs
  .select([NDVI_bandName_Str], ["annual_NDVI"])
  .reproject(targetPrj);

// Compute the NDVI gradient.
var NDVI_grad = annual_NDVI.gradient()
  .reproject(targetPrj);

// Derive the magnitude of the NDVI gradient.
var NDVI_mag = NDVI_grad.select("y")
  .hypot(NDVI_grad.select("x"))
  .reproject(targetPrj)
  .rename("NDVI_mag");

// Determine the direction of the NDVI gradient.
var NDVI_dir = NDVI_grad.select("y")
  .atan2(NDVI_grad.select("x"))
  .reproject(targetPrj);

// Calculate the absolute angle between the NDVI and elevation gradients.
var dir_Angle = NDVI_dir
  .subtract(medElv_Dir).abs()
  .reproject(targetPrj)
  .rename("dir_Angle");

// Combine the derived ATEI variables.
var combinedVars = annual_NDVI
  .addBands(NDVI_mag)
  .addBands(dir_Angle)
  .addBands(smdOpenfNDVI)
  .addBands(smallerNDVIdiff)
  .updateMask(newCATE)
  .reproject(targetPrj);

// Generate the "greenness" component.
var b_Img = combinedVars.select("OpenF_NDVI");

var c_Img = combinedVars.select("NDVI_diff");

var z_Img = combinedVars.select("annual_NDVI")
  .subtract(b_Img)
  .divide(c_Img);

var green_Comp = z_Img.pow(2)
  .multiply(-1 / 2).exp();

// Generate the gradient direction component.
var cos_Angle = combinedVars.select("dir_Angle")
  .cos();

var dir_Comp = ee.Image(1).subtract(cos_Angle)
  .divide(2);

// Generate the weighted magnitude component.
var normal_Mag = combinedVars.select("NDVI_mag")
  .divide(0.00855141);

var Mag_dir = normal_Mag.multiply(dir_Comp);

var green_dir = green_Comp.multiply(dir_Comp);

// Construct the annual ATEI.
var logit = green_Comp.multiply(Coef_green)
  .add(Mag_dir.multiply(Coef_Mag_dir))
  .add(green_dir.multiply(Coef_green_dir))
  .add(Intercept);

var exp_Logit = logit.exp();

var annual_ATEI = exp_Logit.divide(exp_Logit.add(1))
  .reproject(targetPrj)
  .rename(ATEI_bandName_Str);


/* Display the results. */

// IMG.printImgInfo(
//   "annual_ATEI:", 
//   annual_ATEI);

Map.setOptions("Satellite");
// Map.centerObject(contAOI, 8);
Map.setCenter(169.42512, -44.05243, 14);


// Mask the annual ATEIs with an optimal threshold.
// var ATEI_thres = 0.5460715;
var ATEI_thres = 0.5;

var ATEImask = annual_ATEI.gt(ATEI_thres);

Map.addLayer(annual_ATEI,
  // {min: 0, max: 1, palette: "0000ff, ffffff, ff0000"},
  {min: 0, max: 1, palette: "ffffff, ff0000"},
  "ATEI_2020",
  true, 1
);

Map.addLayer(ATEImask.selfMask(), 
  {palette: "228B22"}, 
  "ATEImask_2020", 
  true, 1);

Map.addLayer(annual_NDVI, VIS.NDVI_vis, 
  "smdNDVI_2020", 
  true);

// Map.addLayer(Mag_dir,
//   {min: 0, max: 1, palette: "ffffff, ff0000"},
//   "Mag_dir",
//   true, 0.5
// );

// Map.addLayer(green_dir,
//   {min: 0, max: 1, palette: "ffffff, ff0000"},
//   "green_dir",
//   true, 0.5
// );

// Map.addLayer(green_Comp,
//   {min: 0, max: 1, palette: "ffffff, ff0000"},
//   "green_Comp",
//   true, 0.5
// );

// Map.addLayer(normal_Mag.gt(0.1).selfMask(),
//   {palette: "0000ff"},
//   "normal_Mag",
//   true, 0.5
// );

Map.addLayer(ATETs,
  {color: "ffffff"},
  "ATETs",
  true, 1
);

Map.addLayer(annual_ATEI.updateMask(ATEImask),
  {min: 0, max: 1, palette: "ffffff, ff0000"},
  "ATEI_2020",
  true, 0.5
);

