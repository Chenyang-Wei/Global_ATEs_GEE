/**
 * Introduction:
 * 
 *  1) Divide each transect centerline into two equal segments.
 * 
 *  2) Buffer each centerline segment by 45 m.
 * 
 * 
 * Need to check: 4.
 * 
 * Update: 7/28/2022.
 * 
 * Runtime: 23m ~ 29m (shared).
 */


/* Load module(s). */

var GATE = require("users/ChenyangWei/Public:Modules/Global_ATE");
var TNA = require("users/ChenyangWei/Public:Modules/Transect_NDVI_Analysis");


/* Data and function preparation. */

// Set the major working directory.
var wd_Main = GATE.wd_NorthAmerica   /**** 1) Need to change. ****/
  + "Elevational_Transect_Generation/";

// Determine the universal file path of
//  the selected transect centerlines.
var wd_SelectedCLs = wd_Main
  + TNA.selectedCLs_fileName
  + "/"
  + TNA.selectedCLs_byBasinGroup_fileName;   /**** 2) Need to check. ****/

// Name the centerline ID.
var CLid = "CL_newID";   /**** 3) Need to check. ****/

// Whether output the result(s).
var output = true; // true OR false.


/* Perform the following operations for each basin group. */

for (var basinGroupID = 1; basinGroupID <= 5; basinGroupID ++) {

  // Load the selected transect centerlines of each basin group.
  var selectedCLs = ee.FeatureCollection(wd_SelectedCLs
    + basinGroupID);
  

  /* 1) Divide each transect centerline into two equal segments. */
  
  var CLsegments = TNA.divide_Centerlines_byBasin(selectedCLs, CLid);
  
  
  /* 2) Buffer each centerline segment by 45 m. */
  
  var transectSegments = TNA.buffer_Centerlines_by45m(CLsegments);


  if (!output) { //// Check the result(s).
  
    print("selectedCLs:", 
      selectedCLs.size());
  
    print("transectSegments:", 
      transectSegments.first());
  
  } else { //// Export the result(s).
    
    var wd_Output = wd_Main
      + TNA.transectSegments_FullName   /**** 4) Need to create. ****/
      // "transectSegments_MiddleDivided".
      + "/";
    
    var fileName = TNA.transectSegments_ShortName
      + "_BasinGroup_"
      + basinGroupID;
    
    Export.table.toAsset({
      collection: transectSegments, 
      description: fileName, 
      assetId: wd_Output
        + fileName
    });
  }
}


/* Check the result(s). */

if (!output) {

  Map.setOptions("satellite");
  Map.centerObject(selectedCLs.first(), 10);
  
  Map.addLayer(selectedCLs, {color: "FF0000"}, "selectedCLs");
}

