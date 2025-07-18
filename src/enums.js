const enums = {
  ProjectionMode: {
    0: "Perspective",
    1: "Equirectangular",
    2: "Fisheye",
    3: "Equirectangular360",
    4: "Cubemap",
    5: "EquiangularCubemap",
  },
  StereoMode: {
    0: "Mono",
    1: "SideBySide",
    2: "TopBottom",
  },
  KeyFrameTransitionType: {
    0: "Blink",
    1: "SidewaysBlink",
    2: "Circle",
  },
  AspectRatioType: {
    0: "Autodetect",
    1: "Standard",
    2: "HighDefinition",
    3: "WideScreen",
    4: "Custom",
  },
  OrientationType: {
    0: "Up",
    1: "Left",
    2: "Right",
    3: "Down",
  },
  BackgroundType: {
    0: "GlobalSetting",
    1: "Color",
    2: "Passthrough",
  },
  MaskType: {
    0: "None",
    1: "ChromaKey",
    2: "AlphaPacked",
  },
};

// allows reverse lookups
// to get key by value
Object.values(enums).forEach((enumeration) => {
  Object.entries(enumeration).forEach(([key, value]) => {
    enumeration[value] = key;
  });
});

module.exports = enums;
