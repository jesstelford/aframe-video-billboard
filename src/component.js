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
       * @param {string} [deviceId=''] - Select the specific device for
       * display. Note that if it is not a valid video device, nothing will be
       * shown.
       */
      deviceId: {
        default: '',
        type: 'string',
      },

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

    setDimensions() {
      const entityEl = this.el;
      const videoEl = this._videoElement;
      const {width, height} = shrinkwrapMinDimensions(
        {width: this.data.minWidth, height: this.data.minHeight},
        {width: videoEl.videoWidth, height: videoEl.videoHeight}
      );

      // Set the width and height correctly
      entityEl.setAttribute('width', width);
      entityEl.setAttribute('height', height);
    },

    /**
     * Called once when component is attached. Generally for initial setup.
     */
    init() {},

    /**
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     */
    update(oldData) {

      if (aframe.utils.deepEqual(oldData, this.data)) {
        return;
      }

      if (
        this._videoElement
        && (
          oldData.minWidth !== this.data.minWidth
          || oldData.minHeight !== this.data.minHeight
        )
      ) {
        this.setDimensions();
      }

      if (oldData.deviceId === this.data.deviceId) {
        return;
      }
      // From hree on, device id has changed

      this.cleanUp();

      this._videoId = cuid();
      this._activeVideo = {
        source: null,
        stream: null,
        stop: null,
        pause: null,
        play: null,
      };

      getVideoStream(this.data.deviceId).then(({source, stream, stop, play, pause}) => {

        this._activeVideo.soure = source;
        this._activeVideo.stream = stream;
        this._activeVideo.stop = stop;
        this._activeVideo.pause = pause;
        this._activeVideo.play = play;

        // Creating an aframe asset out of a new video tag
        const videoEl = createVideoElementAsAsset(this._videoId);
        const entityEl = this.el;

        const onLoadedMetaData = _ => {

          // Only want this event listener to execute once
          videoEl.removeEventListener('loadeddata', onLoadedMetaData);

          videoEl.play();

          // Pointing this aframe entity to that video as its source
          entityEl.setAttribute('src', `#${this._videoId}`);

          this.setDimensions();

          entityEl.emit(PLAY_EVENT, {source, stream});
        };

        videoEl.addEventListener('loadeddata', onLoadedMetaData);

        // And starting the video streaming
        videoEl.srcObject = stream;

        this._videoElement = videoEl;

      }).catch(error => {
        // TODO: Check error.name for 'PermissionDeniedError'?
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        this.el.emit(PERMISSION_DENIED_EVENT, {error});
      });
    },

    cleanUp() {
      if (this._videoElement) {
        this.el.removeAttribute('src');
        this._videoElement.srcObject = null;
        this._videoElement.parentNode.removeChild(this._videoElement);
        this._videoElement = null;
      }

      if (this._activeVideo && this._activeVideo.stop) {
        // stop the stream
        this._activeVideo.stop();
      }

      this._videoId = undefined;
      this._activeVideo = {
        source: null,
        stream: null,
        stop: null,
        pause: null,
        play: null,
      };
    },

    /**
     * Called when a component is removed (e.g., via removeAttribute).
     * Generally undoes all modifications to the entity.
     */
    remove() {
      this.cleanUp();
    },

    /**
     * Called when entity pauses.
     * Use to stop or remove any dynamic or background behavior such as events.
     */
    pause() {
      if (this._videoElement) {
        this._videoElement.pause();
      }

      if (this._activeVideo && this._activeVideo.pause) {
        this._activeVideo.pause();
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

      if (this._activeVideo && this._activeVideo.play) {
        this._activeVideo.play();
      }
    },

    getDevices() {
      return askPermission()
        .then(getDevices);
    },

    getActiveDevice() {
      return this.activeVideo.source;
    },
  });
}
