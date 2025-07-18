const { hsp2json } = require("./src/hsp2json");
const { json2hsp } = require("./src/json2hsp");
const path = require("path");

let option = process.argv[2];

if (option === "hsp2json") {
  input_hsp = process.argv[3] || path.join(__dirname, "input", "input.hsp");
  output_json =
    process.argv[4] || path.join(__dirname, "output", "output.json");
  hsp2json(input_hsp, output_json);
} else if (option === "json2hsp") {
  input_json = process.argv[3] || path.join(__dirname, "input", "input.json");
  output_hsp = process.argv[4] || path.join(__dirname, "output", "output.hsp");
  json2hsp(input_json, output_hsp);
} else {
  console.log(`Invalid or missing parameter.

Usage:
    node app.js <option> <input file path> <output file path>

Parameters:
    <option>            "hsp2json" to convert from hsp to json
                        "json2hsp" to convert from json to hsp
    <input file path>   path to the input file (e.g. ./input/input.hsp)
    <output file path>  path to the output file (e.g. ./output/output.json)

Examples:
    convert from hsp to json
        node app.js hsp2json ./input/input.hsp ./output/output.json
        
    convert from json to hsp
        node app.js json2hsp ./input/input.json ./output/output.hsp`);
}
