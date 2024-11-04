export const MAP_STYLES = [
  {
    key: "defaultSetting",
    value: "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    title: "Light (default)",
  },
  {
    key: "nightMapSetting",
    value: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    title: "Dark",
  },
  {
    key: "lightMapSetting",
    value: "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
    title: "Bright",
  },
  {
    key: "streetMapSetting",
    value: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    title: "Streets",
  },
  {
    key: "satelliteMapSetting",
    value:
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&apistyle=s.t:2|s.e:l|p.v:off,s.t:4|s.e:l|p.v:off",
    title: "Satellite Hybrid",
  },
];
