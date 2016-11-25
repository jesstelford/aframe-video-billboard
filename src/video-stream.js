// for pausing promises when there is an inflight permission request
let askingPermissionPromise = false;
let hasPermission = false;

function getVideoBySource(videoSource) {
  const constraints = {
    video: {
      deviceId: videoSource && videoSource.deviceId ? {exact: videoSource.deviceId} : undefined,
    },
  };

  return navigator.mediaDevices.getUserMedia(constraints);
}

function getRearFacingVideoSource() {

  return getDevices().then(sources => {

    if (!sources.length) {
      throw new Error('Could not find any video sources');
    }

    let rearVideoSource;

    sources.some(sourceInfo => {
      const labelLower = sourceInfo.label.toLowerCase();
      if (
        labelLower.indexOf('back') !== -1
        || labelLower.indexOf('environment') !== -1
        || labelLower.indexOf('rear') !== -1
      ) {
        rearVideoSource = sourceInfo;
        return true;
      }
      return false;
    });

    return rearVideoSource || sources[0];

  });

}

function getSourceByDeviceId(deviceId) {

  return getDevices().then(sources => {

    if (!sources.length) {
      throw new Error('Could not find any video sources');
    }

    return (
      sources.filter(sourceInfo => sourceInfo.deviceId === deviceId)[0]
      || sources[0]
    );

  });

}

function handleError(error) {
  // eslint-disable-next-line no-console
  console.error('navigator.getUserMedia error: ', error);
}

export function askPermission() {

  // Already has permission, so resolve immediately
  if (hasPermission) {
    return Promise.resolve();
  }

  // There's already a permission request in flight
  // So return that promise (aka; queue up while we wait)
  if (askingPermissionPromise) {
    return askingPermissionPromise;
  }

  // Trigger an ask for permission dialog
  askingPermissionPromise = getVideoBySource().then(_ => {
    // Permission received! Nothing in flight, so remove reference to stored
    // promise
    askingPermissionPromise = null;
    hasPermission = true;
  });

  return askingPermissionPromise;
}

export function getDevices() {
  return navigator.mediaDevices.enumerateDevices().then(sources => (
    sources.filter(source => source.kind === 'videoinput')
  ));
}

/**
 * @param deviceId {String|null} The device ID to get the stream for. If
 * omitted, will attempt to get the rear-facing video stream. If rear-facing
 * video stream not detected, will get the first video stream found.
 *
 * @return {source, stream}. source: MediaDeviceInfo. stream: MediaStream.
 */
export default function getVideoStream(deviceId) {

  let streamPromise = askPermission();

  if (deviceId) {
    streamPromise = streamPromise.then(_ => getSourceByDeviceId(deviceId));
  } else {
    streamPromise = streamPromise.then(getRearFacingVideoSource);
  }

  return streamPromise
    .then(source => (
      getVideoBySource(source)
        .then(stream => ({
          source,
          stream,
          stop: _ => stream.getTracks().forEach(track => track.stop()),
          pause: _ => stream.getTracks().forEach(track => { track.enabled = false; }),
          play: _ => stream.getTracks().forEach(track => { track.enabled = true; }),
        }))
    ))
    .catch(handleError);
}
