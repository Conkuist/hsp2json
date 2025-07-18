const fs = require("fs");
const SmartBuffer = require("smart-buffer").SmartBuffer;
const zlib = require("zlib");
const enums = require("./enums.js");

SmartBuffer.prototype.writeFString = function (str) {
  if (typeof str == "string") {
    if (str.length > 0) {
      this.writeInt32LE(str.length + 1); // string length and 1 byte for terminator
      this.writeString(str);
      this.writeUInt8(); // null-termination
    } else {
      this.writeInt32LE(0); // empty string
    }
  } else {
    console.error("error in writeFString: not a string");
  }
};

SmartBuffer.prototype.writeDateTime = function (date) {
  if (typeof date == "number") {
    // date in ms
    // add offset to convert from unix epoch
    ticks = BigInt((date + 62135596800000) * 10000); // 1 tick is 100ns
    this.writeBigInt64LE(ticks);
  } else {
    console.error("error in writeFDateTime: not a number");
  }
};

SmartBuffer.prototype.writeTimespan = function (time) {
  if (typeof time == "number") {
    // time in ms
    ticks = BigInt(time * 10000); // 1 tick is 100ns
    this.writeBigInt64LE(ticks);
  } else {
    console.error("error in writeFTimespan: not a number");
  }
};

SmartBuffer.prototype.writeBool = function (bool) {
  if (typeof bool == "boolean") {
    this.writeUInt32LE(bool ? 1 : 0);
  } else {
    console.error("error in writeBool: not a boolean");
  }
};

SmartBuffer.prototype.writeVector2D = function (vector) {
  this.writeFloatLE(vector.x);
  this.writeFloatLE(vector.y);
};

SmartBuffer.prototype.writeVector = function (vector) {
  this.writeFloatLE(vector.x);
  this.writeFloatLE(vector.y);
  this.writeFloatLE(vector.z);
};

SmartBuffer.prototype.writeVector4 = function (vector) {
  this.writeFloatLE(vector.x);
  this.writeFloatLE(vector.y);
  this.writeFloatLE(vector.z);
  this.writeFloatLE(vector.w);
};

SmartBuffer.prototype.writeRotator = function (rotator) {
  this.writeFloatLE(rotator.pitch);
  this.writeFloatLE(rotator.yaw);
  this.writeFloatLE(rotator.roll);
};

SmartBuffer.prototype.writeLinearColor = function (color) {
  this.writeFloatLE(color.red);
  this.writeFloatLE(color.green);
  this.writeFloatLE(color.blue);
  this.writeFloatLE(color.alpha);
};

SmartBuffer.prototype.writeArray = function (array, callback) {
  this.writeUInt32LE(array.length);
  for (let object of array) {
    callback(object);
  }
};

// heresphere ustructs

SmartBuffer.prototype.writeHSTag = function (tag) {
  this.writeFString(tag.name);
  this.writeFloatLE(tag.rating);
  this.writeTimespan(tag.start);
  this.writeTimespan(tag.end);
  this.writeInt32LE(tag.track);
};

SmartBuffer.prototype.writeFormatKeyFrame = function (kf) {
  this.writeTimespan(kf.time);
  this.writeUInt8(enums.ProjectionMode[kf.projectionMode]);
  this.writeUInt8(enums.StereoMode[kf.stereoMode]);
  this.writeBool(kf.eyeSwapEnabled);
  this.writeBool(kf.forceMonoEnabled);
  this.writeBool(kf.flipFrontBack);
  this.writeBool(kf.flipLeftRight);
  this.writeBool(kf.flipUpDown);
  this.writeUInt8(enums.AspectRatioType[kf.aspectRatioType]);
  this.writeFloatLE(kf.aspectRatio);
  this.writeVector2D(kf.zoom);
  this.writeVector2D(kf.pan);
  this.writeUInt8(enums.OrientationType[kf.orientationType]);
};

SmartBuffer.prototype.writeLensKeyFrame = function (kf) {
  this.writeTimespan(kf.time);
  this.writeFString(kf.trueLensName);
  this.writeFString(kf.exportLensName);
  this.writeLinearColor(kf.trueLensCalibration); // c1 c2 c3 c4
  this.writeLinearColor(kf.exportLensCalibration); // c1 c2 c3 c4
  this.writeFloatLE(kf.trueFOV);
  this.writeFloatLE(kf.exportFOV);
};

SmartBuffer.prototype.writeStitchKeyFrame = function (kf) {
  this.writeTimespan(kf.time);
  this.writeVector4(kf.shift);
  this.writeVector4(kf.scale);
  this.writeVector4(kf.shear);
  this.writeVector4(kf.flare);
  this.writeVector4(kf.slant);
};

SmartBuffer.prototype.writeAlignmentKeyFrame = function (kf) {
  this.writeTimespan(kf.time);
  this.writeVector(kf.position);
  this.writeRotator(kf.rotation);
};

SmartBuffer.prototype.writeOrientationKeyFrame = function (kf) {
  this.writeTimespan(kf.time);
  this.writeRotator(kf.orientation);
};

SmartBuffer.prototype.writeOriginKeyFrame = function (kf) {
  this.writeTimespan(kf.time);
  this.writeVector(kf.origin);
};

SmartBuffer.prototype.writeMotionKeyFrame = function (kf) {
  this.writeTimespan(kf.time);
  this.writeFloatLE(kf.motionDistance);
};

SmartBuffer.prototype.writeAutoFocusKeyFrame = function (kf) {
  this.writeTimespan(kf.time);
  this.writeRotator(kf.rotation);
  this.writeFloatLE(kf.focalDistanceOverride);
  this.writeFloatLE(kf.minFocusDistance);
  this.writeFloatLE(kf.maxFocusDistance);
  this.writeFloatLE(kf.focusTransitionSpeed);
};

SmartBuffer.prototype.writeSyncKeyFrame = function (kf) {
  this.writeTimespan(kf.time);
  this.writeTimespan(kf.startingTicksOffset);
  this.writeTimespan(kf.ticksPerHoursOffset);
};

SmartBuffer.prototype.writeTransitionKeyFrame = function (kf) {
  this.writeTimespan(kf.time);
  this.writeUInt8(enums.KeyFrameTransitionType[kf.type]);
  this.writeTimespan(kf.duration);
};

SmartBuffer.prototype.writeImageKeyFrame = function (kf) {
  this.writeTimespan(kf.time);
  this.writeFloatLE(kf.sharpness); // Sharpen
  this.writeFloatLE(kf.colorExposureBias);
  this.writeFloatLE(kf.colorWhiteTemperature); // ColorWhiteTemp
  this.writeFloatLE(kf.colorWhiteTint);
  this.writeVector4(kf.colorSaturation);
  this.writeVector4(kf.colorContrast);
  this.writeVector4(kf.colorGamma);
  this.writeVector4(kf.colorGain);
  this.writeVector4(kf.colorOffset);
  this.writeFloatLE(kf.shadows);
  this.writeFloatLE(kf.midtones);
  this.writeFloatLE(kf.highlights);
};

SmartBuffer.prototype.writeAudioKeyFrame = function (kf) {
  this.writeTimespan(kf.time);
  this.writeFloatLE(kf.timeOffset);
  this.writeFloatLE(kf.volumeMultiplier);
};

SmartBuffer.prototype.writeEnvironmentKeyFrame = function (kf) {
  this.writeTimespan(kf.time);
  this.writeUInt8(enums.BackgroundType[kf.backgroundType]);
  this.writeLinearColor(kf.backgroundColor);
  this.writeFString(kf.backgroundName);
  this.writeUInt8(enums.MaskType[kf.maskType]);
  this.writeFloatLE(kf.opacityScale);
  this.writeLinearColor(kf.chromaKey1Color);
  this.writeLinearColor(kf.chromaKey1Settings);
  this.writeLinearColor(kf.chromaKey2Color);
  this.writeLinearColor(kf.chromaKey2Settings);
  this.writeLinearColor(kf.chromaKey3Color);
  this.writeLinearColor(kf.chromaKey3Settings);
  this.writeLinearColor(kf.despillColor);
  this.writeLinearColor(kf.despillSettings);
  this.writeLinearColor(kf.lightColor);
  this.writeLinearColor(kf.alphaCoordinates);
};

function writeData(data) {
  const sb = new SmartBuffer();
  sb.writeUInt32LE(0);
  sb.writeUInt32LE(data.version);
  sb.writeFString(data.uniqueID);
  sb.writeFString(data.title);
  sb.writeFString(data.description);
  sb.writeDateTime(data.dateAdded);
  sb.writeDateTime(data.dateReleased);
  sb.writeDateTime(data.dateLastPlayed);
  sb.writeDateTime(data.dateEdited);
  sb.writeTimespan(data.duration);
  sb.writeTimespan(data.resumeTime);
  sb.writeTimespan(data.abLoopStartTime);
  sb.writeTimespan(data.abLoopEndTime);
  sb.writeUInt32LE(data.playCount);
  sb.writeUInt32LE(data.comments);
  sb.writeUInt32LE(data.favorites);
  sb.writeBool(data.isFavorite);
  sb.writeFloatLE(data.averageRating);
  sb.writeUInt32LE(data.audioTrack);
  sb.writeArray(data.tags, (tag) => sb.writeHSTag(tag)); // alternative to anonymous function sb.writeHSTag.bind(sb)

  let pkfs = data.projectionKFs;
  sb.writeArray(pkfs.formatKFs, (kf) => sb.writeFormatKeyFrame(kf));
  sb.writeArray(pkfs.lensKFs, (kf) => sb.writeLensKeyFrame(kf));
  sb.writeArray(pkfs.stitchKFs, (kf) => {
    sb.writeStitchKeyFrame(kf);
  });
  sb.writeArray(pkfs.alignmentKFs, (kf) => sb.writeAlignmentKeyFrame(kf));
  sb.writeArray(pkfs.orientationKFs, (kf) => sb.writeOrientationKeyFrame(kf));
  sb.writeArray(pkfs.originKFs, (kf) => sb.writeOriginKeyFrame(kf));
  sb.writeArray(pkfs.motionKFs, (kf) => sb.writeMotionKeyFrame(kf));
  sb.writeArray(pkfs.autoFocusKFs, (kf) => sb.writeAutoFocusKeyFrame(kf));
  sb.writeArray(pkfs.syncKFs, (kf) => sb.writeSyncKeyFrame(kf));
  sb.writeArray(pkfs.transitionKFs, (kf) => sb.writeTransitionKeyFrame(kf));
  sb.writeArray(pkfs.imageKFs, (kf) => sb.writeImageKeyFrame(kf));
  sb.writeArray(pkfs.audioKFs, (kf) => sb.writeAudioKeyFrame(kf));
  sb.writeArray(pkfs.environmentKFs, (kf) => sb.writeEnvironmentKeyFrame(kf));

  // jump to offset 0 and write content length
  sb.writeOffset = 0;
  sb.writeUInt32LE(sb.length - 4);

  return sb.toBuffer();
}

function writeHeader(dataSize, compressedSize) {
  header = new SmartBuffer();

  header.writeBigInt64LE(BigInt(2653586369));
  header.writeBigInt64LE(BigInt(131072));

  header.writeBigInt64LE(BigInt(compressedSize));
  header.writeBigInt64LE(BigInt(dataSize));

  header.writeBigInt64LE(BigInt(compressedSize));
  header.writeBigInt64LE(BigInt(dataSize));

  return header.toBuffer();
}

function json2hsp(jsonPath, hspPath) {
  try {
    const jsonFile = fs.readFileSync(jsonPath);
    const json = JSON.parse(jsonFile);
    //check version
    if (json.version !== 7) {
      throw new Error(
        `hsp version ${json.version} is not supported. This converter only supports hsp version 7.`
      );
    }
    const data = writeData(json);
    const compressed = zlib.deflateSync(data);
    const header = writeHeader(data.length, compressed.length);
    const combinedBuffer = Buffer.concat([header, compressed]);

    fs.writeFileSync(hspPath, combinedBuffer);
    console.log("hsp file written successfully");
  } catch (error) {
    console.error(`error: ${error.message}`);
  }
}

module.exports = { json2hsp };
