// =====================================================
// DELHI NCR - URBAN HEAT ISLAND AIML DATASET
// Competition: Urban Heat Mitigation & Cooling Strategies
// =====================================================

// =====================================================
// STUDY AREA
// =====================================================

var delhi = ee.Geometry.Polygon([
  [
    [76.8476752800247, 28.316782863100222],
    [77.58101268236845, 28.316782863100222],
    [77.58101268236845, 28.79444972306629],
    [76.8476752800247, 28.79444972306629],
    [76.8476752800247, 28.316782863100222]
  ]
]);

Map.centerObject(delhi, 10);

// =====================================================
// DATE RANGE
// =====================================================

var START_DATE = '2026-04-15';
var END_DATE   = '2026-06-01';

// =====================================================
// SENTINEL-2
// =====================================================

var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(delhi)
  .filterDate(START_DATE, END_DATE)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .median()
  .clip(delhi);

// Scale reflectance

var B2  = s2.select('B2').divide(10000);
var B3  = s2.select('B3').divide(10000);
var B4  = s2.select('B4').divide(10000);
var B8  = s2.select('B8').divide(10000);
var B11 = s2.select('B11').divide(10000);
var B12 = s2.select('B12').divide(10000);

// =====================================================
// VEGETATION & URBAN INDICES
// =====================================================

var ndvi = B8.subtract(B4)
  .divide(B8.add(B4))
  .rename('NDVI');

var ndbi = B11.subtract(B8)
  .divide(B11.add(B8))
  .rename('NDBI');

var ndwi = B3.subtract(B8)
  .divide(B3.add(B8))
  .rename('NDWI');
  
// =====================================================
// DRYNESS INDEX
// =====================================================

var drynessIndex = ndbi
  .subtract(ndvi)
  .rename('DrynessIndex');  

// =====================================================
// BROADBAND ALBEDO
// =====================================================

var albedo =
    B2.multiply(0.2266)
  .add(B3.multiply(0.1236))
  .add(B4.multiply(0.1573))
  .add(B8.multiply(0.3417))
  .add(B11.multiply(0.1170))
  .add(B12.multiply(0.0338))
  .rename('Albedo');

// =====================================================
// LAND SURFACE EMISSIVITY
// =====================================================

var pv = ndvi
  .subtract(0.2)
  .divide(0.5 - 0.2)
  .clamp(0, 1)
  .pow(2);

var emissivity = pv
  .multiply(0.004)
  .add(0.986)
  .rename('Emissivity');

// =====================================================
// ESA WORLDCOVER
// =====================================================

var lulc = ee.ImageCollection('ESA/WorldCover/v200')
  .first()
  .select('Map')
  .clip(delhi)
  .rename('LULC');

// =====================================================
// URBAN MORPHOLOGY FEATURES
// =====================================================

// ---------------------------
// Built-up mask
// ---------------------------

var builtup = lulc.eq(50);

// Built-up Density (300 m)

var builtupDensity = builtup
  .reduceNeighborhood({
    reducer: ee.Reducer.mean(),
    kernel: ee.Kernel.circle({
      radius: 300,
      units: 'meters'
    })
  })
  .rename('BuiltupDensity');

// Built-up Fraction (500 m)

var builtupFraction = builtup
  .reduceNeighborhood({
    reducer: ee.Reducer.mean(),
    kernel: ee.Kernel.circle({
      radius: 500,
      units: 'meters'
    })
  })
  .rename('BuiltupFraction');

// ---------------------------
// Tree Cover
// ---------------------------

var tree = lulc.eq(10);

var treeDensity = tree
  .reduceNeighborhood({
    reducer: ee.Reducer.mean(),
    kernel: ee.Kernel.circle({
      radius: 300,
      units: 'meters'
    })
  })
  .rename('TreeDensity');

// ---------------------------
// Green Fraction
// ---------------------------

var vegetation = lulc.eq(10)
  .or(lulc.eq(20))
  .or(lulc.eq(30))
  .or(lulc.eq(40));

var greenFraction = vegetation
  .reduceNeighborhood({
    reducer: ee.Reducer.mean(),
    kernel: ee.Kernel.circle({
      radius: 500,
      units: 'meters'
    })
  })
  .rename('GreenFraction');

// ---------------------------
// Water Features
// ---------------------------

var water = lulc.eq(80);

var waterDensity = water
  .reduceNeighborhood({
    reducer: ee.Reducer.mean(),
    kernel: ee.Kernel.circle({
      radius: 300,
      units: 'meters'
    })
  })
  .rename('WaterDensity');

// Distance to Water

var waterMask = lulc.eq(80);

var distanceToWater = waterMask.distance(
  ee.Kernel.euclidean({
    radius: 5000,
    units: 'meters'
  })
).rename('DistanceToWater');

// ---------------------------
// Cooling Potential Index
// ---------------------------

var coolingPotential = greenFraction
  .subtract(builtupFraction)
  .rename('CoolingPotential');

// =====================================================
// DEM & TERRAIN
// =====================================================

var dem = ee.Image('USGS/SRTMGL1_003')
  .select('elevation')
  .clip(delhi)
  .rename('DEM');

var slope = ee.Terrain.slope(dem)
  .rename('Slope');

// =====================================================
// POPULATION DENSITY
// =====================================================

var population = ee.Image(
  'JRC/GHSL/P2023A/GHS_POP/2020'
)
.select('population_count')
.clip(delhi)
.rename('Population');


// =====================================================
// GHSL BUILT SURFACE
// =====================================================

var ghslBuiltSurface = ee.Image(
  'JRC/GHSL/P2023A/GHS_BUILT_S/2025'
)
.select('built_surface')
.clip(delhi)
.rename('GHSL_BuiltSurface');


// =====================================================
// VIIRS NIGHT LIGHTS
// =====================================================

var viirs = ee.ImageCollection(
  'NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG'
)
.filterBounds(delhi)
.filterDate(START_DATE, END_DATE)
.median()
.select('avg_rad')
.clip(delhi)
.rename('VIIRS');

// =====================================================
// ERA5-LAND METEOROLOGY
// =====================================================

var era5 = ee.ImageCollection(
  'ECMWF/ERA5_LAND/HOURLY'
)
.filterBounds(delhi)
.filterDate(START_DATE, END_DATE)
.mean();

// Air Temperature

var airTemp = era5
  .select('temperature_2m')
  .subtract(273.15)
  .rename('AirTemp');

// Dew Point

var dewPoint = era5
  .select('dewpoint_temperature_2m')
  .subtract(273.15);

// Relative Humidity

var humidity = dewPoint.expression(
  '100 * (exp((17.625 * Td)/(243.04 + Td)) / exp((17.625 * T)/(243.04 + T)))',
  {
    Td: dewPoint,
    T: airTemp
  }
).rename('Humidity');

// Wind Speed

var windSpeed = era5.expression(
  'sqrt(u*u + v*v)',
  {
    u: era5.select('u_component_of_wind_10m'),
    v: era5.select('v_component_of_wind_10m')
  }
).rename('WindSpeed');

// =====================================================
// LANDSAT 8 LST
// =====================================================

var landsat = ee.ImageCollection(
  'LANDSAT/LC08/C02/T1_L2'
)
.filterBounds(delhi)
.filterDate(START_DATE, END_DATE)
.filter(ee.Filter.lt('CLOUD_COVER', 20))
.median()
.clip(delhi);

var lst = landsat
  .select('ST_B10')
  .multiply(0.00341802)
  .add(149.0)
  .subtract(273.15)
  .rename('LST');
  

// =====================================================
// FINAL FEATURE STACK
// =====================================================

var dataset = ee.Image.cat([

  // Spectral
  ndvi,
  ndbi,
  ndwi,
  drynessIndex,
  albedo,
  emissivity,

  // Urban Morphology
  builtupDensity,
  builtupFraction,

  treeDensity,
  greenFraction,

  waterDensity,
  distanceToWater,

  coolingPotential,

  // Terrain
  dem,
  slope,

  // Human Activity
  population,
  ghslBuiltSurface,
  viirs,

  // Meteorology
  airTemp,
  humidity,
  windSpeed,

  // Land Cover
  lulc,

  // Target
  lst

]);

// =====================================================
// REMOVE NULL PIXELS FIRST
// =====================================================

dataset = dataset.updateMask(
  dataset.reduce(ee.Reducer.min()).mask()
);

// =====================================================
// STRATIFIED SAMPLING
// =====================================================

var samples = dataset.stratifiedSample({

  classBand: 'LULC',

  numPoints: 15000,

  region: delhi,

  scale: 100,

  seed: 42,

  geometries: true

});

// =====================================================
// FILTER NULLS
// =====================================================

samples = samples.filter(
  ee.Filter.notNull(dataset.bandNames())
);

// =====================================================
// PREVIEW
// =====================================================

print('Number of Samples', samples.size());
print('First Samples', samples.limit(10));

// Draw the boundary
Map.addLayer(
  ee.FeatureCollection([
    ee.Feature(delhi)
  ]).style({
    color: 'red',
    fillColor: '00000000',
    width: 3
  }),
  {},
  'Delhi NCR Polygon'
);

Map.addLayer(
  lst,
  {
    min: 25,
    max: 55,
    palette: ['blue', 'green', 'yellow', 'orange', 'red']
  },
  'LST'
);


print('Mean LST', lst.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: delhi,
  scale: 100,
  maxPixels: 1e13
}));

// =====================================================
// EXPORT CSV
// =====================================================

Export.table.toDrive({
  collection: samples,
  description: 'DelhiNCR_UHI_AIML_Final_Dataset',
  fileFormat: 'CSV'
});