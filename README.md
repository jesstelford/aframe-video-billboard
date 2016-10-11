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
