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

export default function getVideoStream(deviceId) {

  const streamPromise = askPermission();

  if (deviceId) {
    streamPromise.then(_ => getSourceByDeviceId(deviceId));
  } else {
    streamPromise.then(getRearFacingVideoSource);
  }

  return streamPromise
    .then(getVideoBySource)
    .catch(handleError);
}

export function askPermission() {
  return getVideoBySource();
}

export function getDevices() {
  return navigator.mediaDevices.enumerateDevices().then(sources => (
    sources.filter(source => source.kind === 'videoinput')
  ));
}
