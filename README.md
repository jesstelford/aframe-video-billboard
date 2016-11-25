# aframe-video-billboard

A Video Billboard entity & component for [A-Frame](https://aframe.io).

Create an `<a-video-billboard />` entity, streaming video from the user's camera
to a plane in 3D space.

_Note: Requires the latest WebRTC spec.
This can be easily shimmed with
[`webrtc-adapter`](https://github.com/webrtc/adapter)_

By default, will select the "back" facing camera.

### Installation

#### Browser

Use directly from the unpkg CDN:

```html
<head>
  <script src="https://aframe.io/releases/0.3.0/aframe.min.js"></script>
  <script src="https://unpkg.com/webrtc-adapter/out/adapter.js"></script>
  <script src="https://unpkg.com/aframe-video-billboard"></script>
  <script>
    registerAframeVideoBillboard(window.AFRAME);
  </script>
</head>

<body>
  <a-scene>
    <a-video-billboard position="0 0 -5"></a-video-billboard>
    <a-camera></a-camera>
  </a-scene>
</body>
```

#### npm

Install via npm:

```bash
npm install aframe-video-billboard
```

Then register and use.

```javascript
import aframe from 'aframe';
import registerVideoBillboard from 'aframe-video-billboard';
registerVideoBillboard(aframe);
```

### `video-billboard` component

_Note: The `<a-video-billboard>` entity automatically includes the
`video-billboard` component._

#### Schema

| attribute | type | default | description |
|---|---|---|---|
| `deviceId` | string | `''` | Select the specific device for display. If omitted, will attempt to get the rear-facing video stream. If rear-facing video stream not detected, will get the first video stream found. Note that if it is not a valid video device, nothing will be shown. |
| `minWidth` | number | 4 | The minimum width in world-units to display the video. Video aspect ratio will be preserved. |
| `minHeight` | number | 3 | The minimum height in world-units to display the video. Video aspect ratio will be preserved. |

#### Events

| event name | data | description |
|---|---|---|
| `video-play` | `{source, stream}` | `source` is an instance of MediaDeviceInfo. `stream` is an instance of MediaStream. Fired every time the source changes and video playback begins.
