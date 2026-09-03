# Urban Heat Island Analysis & LST Prediction

An end-to-end geospatial analytics and machine learning project for analyzing **Urban Heat Island (UHI) patterns and Land Surface Temperature (LST)** across Delhi NCR using satellite-derived, environmental, demographic, and spatial data.

The project combines **Google Earth Engine (GEE)** for geospatial data preparation with **Python, Pandas, XGBoost, SHAP, and spatial validation** for exploratory analysis, prediction, interpretation, and spatial analysis.

---

## Project Overview

Urban areas often experience higher surface temperatures due to built-up surfaces, reduced vegetation, limited water availability, and other environmental and morphological factors.

This project analyzes the spatial distribution of **Land Surface Temperature (LST)** across Delhi NCR and investigates how different environmental, land-use, demographic, and meteorological variables are associated with surface temperature.

The workflow consists of two major stages:

1. **Geospatial data generation using Google Earth Engine**
2. **Exploratory analysis and spatial machine learning using Python**

The final machine learning model uses **XGBoost regression** to predict LST and is evaluated using spatially separated validation data to reduce overly optimistic performance estimates caused by spatial autocorrelation.

---

## Key Highlights

* Generated multi-source geospatial datasets using **Google Earth Engine**
* Analyzed **2025 and 2026** Delhi NCR observations
* Combined satellite, land-use, demographic, and meteorological datasets
* Generated **119K+ geospatial observations**
* Performed exploratory data analysis using **Pandas and visualization**
* Engineered environmental and urban morphology indicators
* Built an **XGBoost regression model** for LST prediction
* Used **spatial holdout validation** instead of relying only on random train-test splitting
* Achieved approximately **0.82 R²** on the main spatial holdout
* Used **SHAP** for model interpretation
* Performed residual and spatial error analysis
* Investigated potential cooling-priority areas using relative spatial indicators

---

## Project Workflow

```text
Google Earth Engine
        │
        ├── Sentinel-2
        ├── Landsat 8
        ├── ESA WorldCover
        ├── SRTM DEM
        ├── GHSL
        ├── Population
        ├── VIIRS
        └── ERA5-Land
        │
        ▼
Feature Engineering & Spatial Sampling
        │
        ▼
2025 + 2026 Datasets
        │
        ▼
Python / Pandas
        │
        ├── Data Cleaning
        ├── EDA
        ├── Spatial Analysis
        └── Feature Analysis
        │
        ▼
XGBoost Regression
        │
        ▼
Spatial Validation
        │
        ├── R²
        ├── MAE
        └── RMSE
        │
        ▼
SHAP + Residual Analysis
        │
        ▼
Spatial Interpretation & Cooling-Priority Screening
```

---

## Repository Structure

```text
urban-heat-island-lst-xgboost/
│
├── UHI_LST_Spatial_XGBoost.ipynb
├── GEE_2025.js
├── GEE_2026.js
├── README.md
├── requirements.txt
└── .gitignore
```

### Files

**`UHI_LST_Spatial_XGBoost.ipynb`**

Main Python notebook containing:

* Data loading and preprocessing
* Exploratory Data Analysis
* Statistical analysis
* Spatial analysis
* Feature engineering
* XGBoost regression
* Spatial holdout validation
* SHAP-based model interpretation
* Residual analysis
* Cooling-priority screening

**`GEE_2025.js`**

Google Earth Engine script used to generate the **2025 Delhi NCR geospatial dataset**. It performs satellite data preprocessing, environmental feature engineering, spatial morphology calculations, and stratified spatial sampling.

**`GEE_2026.js`**

Google Earth Engine script used to generate the corresponding **2026 Delhi NCR geospatial dataset** using the same overall data-generation workflow.

**`README.md`**

Project documentation, methodology, data sources, results, and instructions.

**`requirements.txt`**

Python packages required to run the analysis notebook.

---

## Data Generation Using Google Earth Engine

The geospatial datasets were generated using **Google Earth Engine (GEE)** from multiple remote-sensing and environmental data sources.

The GEE workflow combines:

* **Sentinel-2 Surface Reflectance** for spectral information
* **Landsat 8 Collection 2 Level-2** for Land Surface Temperature
* **ESA WorldCover** for Land Use/Land Cover
* **SRTM** for elevation and slope
* **GHSL** for built-surface information
* **Population datasets** for demographic information
* **VIIRS nighttime lights** for nighttime radiance
* **ERA5-Land** for meteorological variables

The scripts additionally derive spatial and environmental indicators from these datasets.

---

## Features

The generated datasets contain variables representing vegetation, built-up surfaces, water availability, terrain, demographics, nighttime activity, and weather conditions.

### Spectral & Environmental Features

* NDVI
* NDBI
* NDWI
* Dryness Index
* Albedo
* Emissivity

### Urban Morphology & Green Infrastructure

* Built-up Density
* Built-up Fraction
* Tree Density
* Green Fraction
* Water Density
* Distance to Water
* Cooling Potential

### Terrain

* DEM
* Slope

### Demographic & Urban Activity

* Population
* GHSL Built Surface
* VIIRS Nighttime Radiance

### Meteorological Variables

* Air Temperature
* Humidity
* Wind Speed

### Land Surface Temperature

* LST

### Land Use / Land Cover

* LULC category derived from ESA WorldCover

---

## Land Surface Temperature

LST is derived from **Landsat 8 Collection 2 Level-2 surface temperature data**.

The resulting LST variable represents the estimated land surface temperature in degrees Celsius and serves as the primary prediction target for the machine learning analysis.

---

## Spatial Feature Engineering

Several spatial indicators are created from the land-cover data using neighborhood-based calculations.

Examples include:

* **BuiltupDensity** — local proportion of built-up land
* **BuiltupFraction** — built-up proportion within a larger neighborhood
* **TreeDensity** — local tree coverage
* **GreenFraction** — local proportion of vegetation-related land-cover classes
* **WaterDensity** — local water coverage
* **DistanceToWater** — distance from water-covered pixels
* **CoolingPotential** — relative balance between green and built-up fractions

These variables allow the analysis to move beyond individual pixels and capture aspects of the surrounding urban environment.

---

## Exploratory Data Analysis

The notebook performs exploratory analysis to understand the relationships between LST and the available predictors.

The analysis includes:

* Dataset inspection
* Missing-value analysis
* Descriptive statistics
* Distribution analysis
* Correlation analysis
* LST distribution
* Feature relationships
* LULC-based comparisons
* Spatial pattern analysis
* Year-wise comparison

The analysis helps identify important patterns before model development.

---

## Machine Learning

### Model

The primary machine learning model is:

**XGBoost Regression**

The final model uses a selected set of environmental and spatial predictors:

```text
WindSpeed
NDBI
AirTemp
TreeDensity
Albedo
NDVI
Humidity
DistanceToWater
NDWI
GreenFraction
```

XGBoost was selected because it performs well on structured/tabular data and can model nonlinear relationships and interactions between environmental variables.

---

## Spatial Validation

A key component of the project is the use of **spatial validation**.

Instead of relying exclusively on a random train-test split, the study area is divided into spatial blocks. Entire spatial blocks are kept separate between training and validation data.

This helps reduce the possibility that nearby observations with similar spatial characteristics appear in both training and validation sets.

The notebook also performs repeated spatial holdout evaluation to examine the stability of model performance across different spatial splits.

---

## Model Performance

### Main Spatial Holdout

| Metric |        Score |
| ------ | -----------: |
| R²     |   **0.8188** |
| MAE    | **1.1079°C** |
| RMSE   | **1.4806°C** |

### Repeated Spatial Holdouts

Across repeated spatial holdout evaluations:

**Mean R²:** 0.8081 ± 0.0264

These results indicate that the model captures a substantial portion of the spatial variation in LST while being evaluated on geographically separated observations.

---

## Model Explainability

The project uses **SHAP (SHapley Additive exPlanations)** to investigate how individual features contribute to model predictions.

SHAP analysis is used to examine:

* Overall feature importance
* Direction of feature contributions
* Individual prediction explanations
* Nonlinear feature effects
* Relationships between important predictors and predicted LST

This provides greater interpretability than relying solely on model-level feature importance.

---

## Residual Analysis

Residual analysis is performed to evaluate where the model performs well and where prediction errors are larger.

The notebook investigates:

* Distribution of residuals
* Actual vs predicted LST
* Spatial distribution of errors
* High-error observations
* Potential spatial patterns in model residuals

This helps identify areas where the model may not adequately capture local thermal behavior.

---

## Cooling-Priority Screening

The project also explores a **relative cooling-priority screening framework** using spatial indicators associated with urban heat.

The analysis considers factors such as:

* Built-up intensity
* Vegetation availability
* Tree density
* Water proximity
* Cooling potential
* Predicted thermal conditions

The resulting priority score is intended as a **relative analytical screening tool**, rather than a public-health risk index.

---

## Data Sources

The project uses data from the following platforms and datasets:

| Data                           | Source              |
| ------------------------------ | ------------------- |
| Sentinel-2 Surface Reflectance | Google Earth Engine |
| Landsat 8 Surface Temperature  | Google Earth Engine |
| ESA WorldCover                 | Google Earth Engine |
| SRTM DEM                       | Google Earth Engine |
| GHSL Built Surface             | Google Earth Engine |
| Population                     | Google Earth Engine |
| VIIRS Nighttime Lights         | Google Earth Engine |
| ERA5-Land                      | Google Earth Engine |

The complete preprocessing and feature-generation logic is available in:

```text
GEE_2025.js
GEE_2026.js
```

---

## Running the Project

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/urban-heat-island-lst-xgboost.git
cd urban-heat-island-lst-xgboost
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Open the notebook

Launch Jupyter Notebook or JupyterLab:

```bash
jupyter notebook
```

Then open:

```text
UHI_LST_Spatial_XGBoost.ipynb
```

---

## Google Earth Engine Scripts

The GEE scripts are provided for transparency and reproducibility of the data-generation process.

To reproduce the datasets:

1. Open the Google Earth Engine Code Editor.
2. Open `GEE_2025.js` or `GEE_2026.js`.
3. Define/import the Delhi NCR study-area geometry required by the script.
4. Run the script.
5. Review the generated layers and sample collection.
6. Export the resulting table as CSV.
7. Use the exported datasets in the Python notebook.

The exact dataset-generation parameters, feature calculations, spatial sampling, and data sources are contained in the respective scripts.

---

## Important Notes

### Correlation vs Causation

Correlation and model relationships identified in this project represent statistical associations. They should not automatically be interpreted as causal relationships.

### Spatial Validation

Spatial validation provides a more realistic assessment for geographically structured data than a purely random split, but it does not eliminate every possible source of spatial or temporal bias.

### Feature Importance

Feature importance and SHAP values describe model behavior and contribution to predictions. They should not be interpreted as direct causal effects.

### Year-to-Year Comparison

Differences in LST between 2025 and 2026 represent observed differences within the analyzed datasets. They should not be interpreted by themselves as evidence of climate change or urbanization-driven warming.

### Cooling-Priority Score

The cooling-priority analysis is a relative spatial screening framework intended for analytical exploration. It should not be interpreted as a validated public-health risk index or policy ranking.

---

## Technologies

* Python
* Pandas
* NumPy
* Matplotlib
* Seaborn
* Scikit-learn
* XGBoost
* SHAP
* GeoPandas
* Google Earth Engine
* Jupyter Notebook

---

## Project Type

**Geospatial Data Analytics + Machine Learning**

The project demonstrates an end-to-end workflow involving:

```text
Geospatial Data Acquisition
        ↓
Data Preprocessing
        ↓
Feature Engineering
        ↓
Exploratory Data Analysis
        ↓
Spatial Analysis
        ↓
Machine Learning
        ↓
Spatial Validation
        ↓
Model Explainability
        ↓
Residual Diagnostics
        ↓
Spatial Decision Screening
```

---

## Author

**Kuldeep Lohani**

MCA / Data Science

---

## License

This project is intended for educational, analytical, and portfolio purposes. Please review the licensing and usage requirements of the individual datasets before redistributing derived data.
