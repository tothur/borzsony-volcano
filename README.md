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

Open the HTTPS-hosted viewer in Meta Quest Browser and select **Open Quest tabletop**. From your seat, look at a clear patch of desk. The square previews the 42 cm terrain tile. Pinch or pull the trigger to confirm. If the room supplies no horizontal hit, hold a tracked hand or controller at the desired centre and desk height and select there.

- **Slide** the terrain by pinching it directly or by pointing and holding the trigger. A controller grip also slides a targeted model. The base stays level at the original desk height.
- **Turn** by dragging the compass ring. **Resize** by dragging a corner. With both hands on the model, spread or twist around the midpoint of your contacts. Release one hand to continue sliding with the other.
- **Play or scrub** the timeline from the desk console. Open **Chapters** to jump to a geological stage, change speed, or replay the eruption. Point and select controls, or pinch directly at the panel.
- **View** offers one-handed controls for model size, orientation, relief, lighting and the modern terrain overlay. **Reset** returns the model and console to their original desk positions.
- **Park the console** by dragging the handle underneath it to either side, closer, or higher. The controls stay put when you lean in, turn, or enlarge the terrain. **Place** chooses a new desk position. **Exit** ends the session.

Tabletop mode uses the summit-focused terrain mesh and GPU terrain cache with the simulation's existing eruption playback. Hand tracking and room surface detection depend on headset settings. The desk position lasts for the current session. WebXR requires HTTPS or headset-local localhost.
