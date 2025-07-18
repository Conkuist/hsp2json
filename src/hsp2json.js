const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const SmartBuffer = require("smart-buffer").SmartBuffer;
const enums = require("./enums.js");
const { version } = require("typescript");

SmartBuffer.prototype.readStr = function () {
  let len = this.readInt32LE();
  if (len < 0)
    // UTF16
    len *= 2;

  const str = this.readString(
    Math.abs(len),
    len < 0 ? "utf16le" : "utf8"
  ).slice(0, -1); // remove null terminator
  return str;
};

SmartBuffer.prototype.readTime = function () {
  // nanoseconds to milliseconds
  n = Number(this.readBigInt64LE() / 10000n);
  return n;
};

SmartBuffer.prototype.readDate = function () {
  // Unix timestamp
  return this.readTime() - 62135596800000;
};

SmartBuffer.prototype.readArray = function (type) {
  const len = this.readUInt32LE();
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(type(this));
  }
  return arr;
};

SmartBuffer.prototype.readFVector2D = function () {
  return {
    x: this.readFloatLE(),
    y: this.readFloatLE(),
  };
};
SmartBuffer.prototype.readFVector = function () {
  return {
    x: this.readFloatLE(),
    y: this.readFloatLE(),
    z: this.readFloatLE(),
  };
};
SmartBuffer.prototype.readFVector4 = function () {
  return {
    x: this.readFloatLE(),
    y: this.readFloatLE(),
    z: this.readFloatLE(),
    w: this.readFloatLE(),
  };
};
SmartBuffer.prototype.readFRotator = function () {
  return {
    pitch: this.readFloatLE(),
    yaw: this.readFloatLE(),
    roll: this.readFloatLE(),
  };
};
SmartBuffer.prototype.readFLinearColor = function () {
  return {
    red: this.readFloatLE(),
    green: this.readFloatLE(),
    blue: this.readFloatLE(),
    alpha: this.readFloatLE(),
  };
};
function time(t) {
  t = Math.floor(t / 1000);
  h = Math.floor(t / 3600);
  m = Math.floor((t % 3600) / 60);
  s = Math.floor(t % 60);
  return `${h}:${m}:${s}`;
}
function parse(file) {
  const sb = SmartBuffer.fromBuffer(file);
  const data = {};
  sb.readUInt32LE(); // content length = sb.length - 4
  let version = sb.readUInt32LE();
  // check hsp version
  if (version !== 7) {
    throw new Error(
      `hsp version ${version} is not supported. This converter only supports hsp version 7.`
    );
  } else {
    data.version = version;
  }
  data.uniqueID = sb.readStr();
  data.title = sb.readStr();
  data.description = sb.readStr();
  data.dateAdded = sb.readDate();
  data.dateReleased = sb.readDate();
  data.dateLastPlayed = sb.readDate();
  data.dateEdited = sb.readDate();
  data.duration = sb.readTime();
  data.resumeTime = sb.readTime();
  data.abLoopStartTime = sb.readTime();
  data.abLoopEndTime = sb.readTime();
  data.playCount = sb.readUInt32LE();
  data.comments = sb.readUInt32LE();
  data.favorites = sb.readUInt32LE();
  data.isFavorite = sb.readUInt32LE() > 0;
  data.averageRating = sb.readFloatLE();
  data.audioTrack = sb.readUInt32LE();

  data.tags = sb.readArray((sb) => ({
    name: sb.readStr(),
    rating: sb.readFloatLE(),
    start: sb.readTime(),
    end: sb.readTime(),
    track: sb.readUInt32LE(),
  }));

  let pkf = (data.projectionKFs = {});

  pkf.formatKFs = sb.readArray((sb) => ({
    time: sb.readTime(),
    projectionMode: enums.ProjectionMode[sb.readUInt8()],
    stereoMode: enums.StereoMode[sb.readUInt8()],
    eyeSwapEnabled: sb.readUInt32LE() > 0,
    forceMonoEnabled: sb.readUInt32LE() > 0,
    flipFrontBack: sb.readUInt32LE() > 0,
    flipLeftRight: sb.readUInt32LE() > 0,
    flipUpDown: sb.readUInt32LE() > 0,
    aspectRatioType: enums.AspectRatioType[sb.readUInt8()],
    aspectRatio: sb.readFloatLE(),
    zoom: sb.readFVector2D(),
    pan: sb.readFVector2D(),
    orientationType: enums.OrientationType[sb.readUInt8()],
  }));

  pkf.lensKFs = sb.readArray((sb) => ({
    time: sb.readTime(),
    trueLensName: sb.readStr(),
    exportLensName: sb.readStr(),
    trueLensCalibration: sb.readFLinearColor(),
    exportLensCalibration: sb.readFLinearColor(),
    trueFOV: sb.readFloatLE(),
    exportFOV: sb.readFloatLE(),
  }));

  pkf.stitchKFs = sb.readArray((sb) => ({
    time: sb.readTime(),
    shift: sb.readFVector4(),
    scale: sb.readFVector4(),
    shear: sb.readFVector4(),
    flare: sb.readFVector4(),
    slant: sb.readFVector4(),
  }));

  pkf.alignmentKFs = sb.readArray((sb) => ({
    time: sb.readTime(),
    position: sb.readFVector(),
    rotation: sb.readFRotator(),
  }));

  pkf.orientationKFs = sb.readArray((sb) => ({
    time: sb.readTime(),
    orientation: sb.readFRotator(),
  }));

  pkf.originKFs = sb.readArray((sb) => ({
    time: sb.readTime(),
    origin: sb.readFVector(),
  }));

  pkf.motionKFs = sb.readArray((sb) => ({
    time: sb.readTime(),
    motionDistance: sb.readFloatLE(),
  }));

  pkf.autoFocusKFs = sb.readArray((sb) => ({
    time: sb.readTime(),
    rotation: sb.readFRotator(),
    focalDistanceOverride: sb.readFloatLE(),
    minFocusDistance: sb.readFloatLE(),
    maxFocusDistance: sb.readFloatLE(),
    focusTransitionSpeed: sb.readFloatLE(),
  }));

  pkf.syncKFs = sb.readArray((sb) => ({
    time: sb.readTime(),
    startingTicksOffset: sb.readTime(),
    ticksPerHoursOffset: sb.readTime(),
  }));

  pkf.transitionKFs = sb.readArray((sb) => ({
    time: sb.readTime(),
    type: enums.KeyFrameTransitionType[sb.readUInt8()],
    duration: sb.readTime(),
  }));

  pkf.imageKFs = sb.readArray((sb) => ({
    time: sb.readTime(),
    sharpness: sb.readFloatLE(),
    colorExposureBias: sb.readFloatLE(),
    colorWhiteTemperature: sb.readFloatLE(),
    colorWhiteTint: sb.readFloatLE(),
    colorSaturation: sb.readFVector4(),
    colorContrast: sb.readFVector4(),
    colorGamma: sb.readFVector4(),
    colorGain: sb.readFVector4(),
    colorOffset: sb.readFVector4(),
    shadows: sb.readFloatLE(),
    midtones: sb.readFloatLE(),
    highlights: sb.readFloatLE(),
  }));

  pkf.audioKFs = sb.readArray((sb) => ({
    time: sb.readTime(),
    timeOffset: sb.readFloatLE(),
    volumeMultiplier: sb.readFloatLE(),
  }));

  pkf.environmentKFs = sb.readArray((sb) => ({
    time: sb.readTime(),
    backgroundType: enums.BackgroundType[sb.readUInt8()],
    backgroundColor: sb.readFLinearColor(),
    backgroundName: sb.readStr(),
    maskType: enums.MaskType[sb.readUInt8()],
    opacityScale: sb.readFloatLE(),
    chromaKey1Color: sb.readFLinearColor(),
    chromaKey1Settings: sb.readFLinearColor(),
    chromaKey2Color: sb.readFLinearColor(),
    chromaKey2Settings: sb.readFLinearColor(),
    chromaKey3Color: sb.readFLinearColor(),
    chromaKey3Settings: sb.readFLinearColor(),
    despillColor: sb.readFLinearColor(),
    despillSettings: sb.readFLinearColor(),
    lightColor: sb.readFLinearColor(),
    alphaCoordinates: sb.readFLinearColor(),
  }));
  return data;
}

function hsp2json(hspPath, jsonPath) {
  try {
    let file = fs.readFileSync(hspPath);
    let decompressed = zlib.inflateSync(file.slice(0x30));
    output = parse(decompressed);
    fs.writeFile(jsonPath, JSON.stringify(output, null, 2), "utf8", (err) => {
      err
        ? console.error("error while writing file")
        : console.log("successfully written json to file");
    });
  } catch (error) {
    console.error(`error: ${error.message}`);
  }
}

module.exports = { hsp2json };
