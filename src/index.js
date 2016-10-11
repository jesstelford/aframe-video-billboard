import aframeVideoBillboardComponent from './component';
import aframeVideoBillboardEntity from './entity';

const COMPONENT_NAME = 'video-billboard';

/**
 * @param aframe {Object} The Aframe instance to register with. Default:
 * `window.AFRAME`
 * @param componentName {String} The component name to use. Default: 'video-billboard'
 */
export default function registerAframeVideoBillboard(
  aframe = window.AFRAME,
  componentName = COMPONENT_NAME
) {
  aframeVideoBillboardComponent(aframe, componentName);
  aframeVideoBillboardEntity(aframe, componentName);
}
