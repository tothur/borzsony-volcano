# Börzsöny Volcano

An interactive 3D reconstruction of the High Börzsöny in northern Hungary, from a Miocene andesite dome complex about 14.4 million years ago to today's eroded caldera.

**Open it:** https://tothur.github.io/borzsony-volcano/

Pick a stage or drag the time column on the right to move through time. Use the dock at the bottom to fly, walk, jump to places and change the light. It needs a browser with WebGL 2 and downloads tens of megabytes of terrain.

## How accurate it is

This is a speculative reconstruction. Today's terrain and imagery are real. The ancient volcano follows Balla (1978) and Karátson et al. (2019): a cone about 13 km across and about 1,200 m high, active 15.0–14.3 million years ago. Its gullies, lava flows, domes and the eruption are modelled. Fine detail below the data resolution is generated.

## What's here

- `index.html`: the viewer (three.js, no build step)
- `eruption-model.mjs`: deterministic dome deformation, connected runout, plume parcels and ashfall
- `tests/`: model regression checks against the supplied terrain
- `data/`: terrain, imagery and detail tiles
- `pipeline/`: the scripts that built `data/` (Python and Node)

To run it locally, serve this folder with any static server, for example `python3 -m http.server`.

## Data credits

- Elevation: Copernicus GLO-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA.
- Imagery: [Sentinel-2 cloudless 2020](https://s2maps.eu) by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2020), licensed [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). `data/sat.jpg` is a derivative and stays under that licence, so it can't be used commercially.

## Eruption playback

The selected timeline position controls a single event clock: fourteen days of dome growth, the first two minutes of explosions, ten more minutes of dome-collapse activity, then ash dispersal and settling out to two days. The compressed time scale changes between stages; the caption shows elapsed event time. Pause freezes the entire event. Scrubbing in either direction reconstructs the same seeded particles and deposits. “Watch the eruption” restarts playback from dome growth.

The summit surface grows and loses its northwest-facing lobe, leaving a scar and an opening notch. Currents originate at the dome headwall and continue through that notch into downhill drainage. Gravity, basal resistance and quadratic drag constrain travel along these illustrative routes. A buoyant-parcel approximation replaces the fixed plume-top altitude. Lofted particles drift in the assumed east-northeast wind and settle at different terminal velocities; ashfall and coarse block-and-ash deposits use separate ground layers.

These are schematic process illustrations. The wind, source parameters, opening notch, flow resistance and deposit intensity are not a calibrated reconstruction of an identified ancient eruption or a hazard forecast. No new terrain tiles are required.

Run the regression checks with Node:

```sh
node --test tests/*.test.mjs
```

## Quest tabletop mode

Open the HTTPS-hosted site in Quest Browser and select **Place on desk (Quest)**. Look at the desk and press a controller trigger to place the model. If surface detection is unavailable, touch the controller to the desk and press its trigger for manual placement. Squeeze one controller to grab/move/rotate; squeeze both to resize and rotate. Point at the floating panel to play/pause, scrub time or place again. A/X also toggles playback; B/Y resets placement; a thumbstick scrubs time. Exit using the headset system menu.

The headset uses a lighter terrain mesh and particle representation derived from the same heights and eruption clock. Desktop rendering is preserved. WebXR requires HTTPS (or a headset-local localhost origin); the computer's 127.0.0.1 address will not work from the headset. Room permissions and runtime surface support vary. This controller-based implementation still requires testing on physical Quest hardware; hand gestures, persistent placement and real-world occlusion are not implemented.
