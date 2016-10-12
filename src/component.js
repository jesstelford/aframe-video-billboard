import cuid from 'cuid';
import {default as getVideoStream, getDevices, askPermission} from './video-stream';

const PERMISSION_DENIED_EVENT = 'video-permission-denied';
const PLAY_EVENT = 'video-play';

function createVideoElementAsAsset(id) {

  let video = document.querySelector(`#${id}`);

  if (!video) {
    video = document.createElement('video');
  }

  video.setAttribute('id', id);
  video.setAttribute('autoplay', true);
  video.setAttribute('src', '');

  let assets = document.querySelector('a-assets');

  if (!assets) {
    assets = document.createElement('a-assets');
    document.querySelector('a-scene').appendChild(assets);
  }

  if (!assets.contains(video)) {
    assets.appendChild(video);
  }

  return video;
}

function shrinkwrapMinDimensions(
  {width: minWidth, height: minHeight},
  {width, height}
) {

  const aspectRatio = width / height;

  // assume width is exact, and height is taller than minHeight
  let shrunkWidth = minWidth;
  let shrunkHeight = shrunkWidth / aspectRatio;

  if (shrunkHeight < minHeight) {
    // our assumption was wrong, so we need to grow the shrunk sizes to make
    // height exact
    shrunkHeight = minHeight;
    shrunkWidth = shrunkHeight * aspectRatio;
  }

  return {
    width: shrunkWidth,
    height: shrunkHeight,
  };
}

/**
 * @param aframe {Object} The Aframe instance to register with
 * @param componentName {String} The component name to use. Default: 'video-billboard'
 */
export default function aframeVideoBillboardComponent(aframe, componentName) {

  /**
   * Draggable component for A-Frame.
   */
  aframe.registerComponent(componentName, {
    schema: {
      /*
       * @param {string} [deviceId=null] - Select the specific device for
       * display. Note that if it is not a valid video device, nothing will be
       * shown.
       */
      deviceId: {default: null},

      /*
       * @param {number} [minWidth=4] - The minimum width in world-units to
       * display the video at. Video aspect ratio will be preserved.
       */
      minWidth: {default: 4},

      /*
       * @param {number} [minHeight=3] - The minimum height in world-units to
       * display the video at. Video aspect ratio will be preserved.
       */
      minHeight: {default: 3},
    },

    /**
     * Called once when component is attached. Generally for initial setup.
     */
    init() {
      this._videoId = cuid();
    },

    /**
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     */
    update() {

      getVideoStream(this.data.deviceId).then(videoStream => {

        // Creating an aframe asset out of a new video tag
        const videoEl = createVideoElementAsAsset(this._videoId);
        const entityEl = this.el;

        // And starting the video streaming
        videoEl.srcObject = videoStream;

        const onLoadedMetaData = _ => {

          // Only want this event listener to execute once
          videoEl.removeEventListener('loadedmetadata', onLoadedMetaData);

          videoEl.play();

          // Pointing this aframe entity to that video as its source
          entityEl.setAttribute('src', `#${this._videoId}`);

          const {width, height} = shrinkwrapMinDimensions(
            {width: this.data.minWidth, height: this.data.minHeight},
            {width: videoEl.videoWidth, height: videoEl.videoHeight}
          );

          // Set the width and height correctly
          entityEl.setAttribute('width', width);
          entityEl.setAttribute('height', height);

          entityEl.emit(PLAY_EVENT, {stream: videoStream});
        };

        videoEl.addEventListener('loadedmetadata', onLoadedMetaData);

        this._permissionGranted = true;
        this._videoElement = videoEl;

      }).catch(error => {
        // TODO: Check error.name for 'PermissionDeniedError'?
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        this.el.emit(PERMISSION_DENIED_EVENT, {error});
      });
    },

    /**
     * Called when a component is removed (e.g., via removeAttribute).
     * Generally undoes all modifications to the entity.
     */
    remove() {
      if (this._videoElement) {
        this._videoElement.parentNode.removeChild(this._videoElement);
        this._videoElement = null;
      }
    },

    /**
     * Called when entity pauses.
     * Use to stop or remove any dynamic or background behavior such as events.
     */
    pause() {
      if (this._videoElement) {
        this._videoElement.pause();
      }
    },

    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     */
    play() {
      if (this._videoElement) {
        this._videoElement.play();
      }
    },

    getDevices() {

      if (!this._permissionGranted) {
        return askPermission()
          .then(_ => {
            this._permissionGranted = true;
          })
          .then(getDevices)
          .catch(error => {
            // TODO: Check error.name for 'PermissionDeniedError'?
            // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
            this.el.emit(PERMISSION_DENIED_EVENT, {error});
          });
      }

      return getDevices();
    },
  });
}
