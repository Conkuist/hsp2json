# hsp2json

A Node.js application that converts HereSphere hsp files to json and back,
to allow the user to view and edit the content of the file in plain text

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Installation

1. Clone the repository:

```bash
   git clone https://gitea.conkuist.ddnsgeek.com/Conkuist/hsp2json.git
   cd hsp2json
```

2. Install dependencies

```bash
npm install
```

## Usage

```bash
node convert.js <option> <input file path> <output file path>
```

### Parameters:

```
<option>            "hsp2json" to convert from hsp to json

                    "json2hsp" to convert from json to hsp

<input file path>   path to the input file (e.g. ./input/input.hsp)

<output file path>  path to the output file (e.g. ./output/output.json)
```

### Examples:

#### convert from hsp to json

```bash
node convert.js hsp2json ./input/input.hsp ./output/output.json
```

#### convert from json to hsp

```bash
node convert.js json2hsp ./input/input.json ./output/output.hsp
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Thanks to the developer of HereSphere for providing the necessary documentation and Noah from the HereSphere Discord for providing an old hsp to json conversion script to make this project possible.
