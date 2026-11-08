# Börzsöny Volcano

An interactive 3D reconstruction of the High Börzsöny in northern Hungary, from a Miocene andesite dome complex about 14.4 million years ago to today's eroded caldera.

**Open it:** https://tothur.github.io/borzsony-volcano/

Pick a stage or drag the time column on the right to move through time. Use the dock at the bottom to fly, walk, jump to places and change the light. It needs a browser with WebGL 2 and downloads tens of megabytes of terrain.

## How accurate it is

This is a speculative reconstruction. Today's terrain and imagery are real. The ancient volcano follows Balla (1978) and Karátson et al. (2019): a cone about 13 km across and about 1,200 m high, active 15.0–14.3 million years ago. Its gullies, lava flows, domes and the eruption are modelled. Fine detail below the data resolution is generated.

## What's here

- `index.html`: the viewer (three.js, no build step)
- `data/`: terrain, imagery and detail tiles
- `pipeline/`: the scripts that built `data/` (Python and Node)

To run it locally, serve this folder with any static server, for example `python3 -m http.server`.

## Data credits

- Elevation: Copernicus GLO-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA.
- Imagery: [Sentinel-2 cloudless 2020](https://s2maps.eu) by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2020), licensed [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). `data/sat.jpg` is a derivative and stays under that licence, so it can't be used commercially.
