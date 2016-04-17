# CellMap

Protein Localization and Protein-Protein Interaction (PPI) visualization tool.

## Prerequisites:

1. Mongo
2. [Fantom data](http://fantom.gsc.riken.jp/5/suppl/Ramilowski_et_al_2015/), turned into `.json` files inside the `./data` folder. **[1]**
2. [Küster data](https://www.proteomicsdb.org/), turned into `.json` files inside the `./data` folder.

## Fill up database

 - Once all prerequisites have been met, you can run `npm run import` to fill the database with the data contained in the `.json` files in the `/data` folder.   
 - The script that fills the database will only fill the collections for which a corresponsing file exists. Collection name == File name
 - The insertion happens through a mongo upsert, thus existing entries will be updated if existent, while new ones will be inserted anew.
 - The list of file names accepted is:
    - `ExpressionLigRec.json` [Riken]
    - `PairsLigRec.json` [Riken]
    - `SubcelLoc.Ages.Proteins.json` [Riken]
    - `AllTissues.json` [Küster]






---
**[1]**: You can use [parsjs](https://www.npmjs.com/package/parsjs) to convert the tab-separated files from the Riken group to json files.