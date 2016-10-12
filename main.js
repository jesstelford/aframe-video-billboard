import aframe from 'aframe';
import extras from 'aframe-extras';
import keyboardControls from 'aframe-keyboard-controls';
import registerVideoBillboard from '../src/index';

extras.physics.registerAll(aframe);
aframe.registerComponent('keyboard-controls', keyboardControls);
registerVideoBillboard(aframe);
