import { vi } from './vi';

export const en = {
  appTitle: 'Digital Compass',
  simulator: 'Simulator',
  simulatorHint: 'Click & drag or scroll mouse to rotate compass',
  altitude: 'Elevation',
  accuracy: 'Accuracy',
  permissionPromptTitle: 'Motion Sensor Access',
  permissionPromptDesc: 'To navigate accurately, please allow access to device motion and orientation sensors.',
  enableSensor: 'Enable Sensors',
  settings: 'Settings',
  sound: 'Mechanical Tick Sound',
  haptics: 'Haptic Feedback',
  coordinateFormat: 'Coordinate Format (DMS / Decimal)',
  calibrationHelp: 'Calibration Guide',
  calibrationDesc: 'If compass drifts, wave phone in a figure-8 motion 3-5 times.',
  close: 'Close',
  north: 'North',
  east: 'East',
  south: 'South',
  west: 'West',
  deviation: 'Deviation',
  tapToLock: 'Tap to lock bearing',
  locked: 'Bearing locked',
  unlock: 'Unlock',
  levelZero: 'True Level',
  gpsUnavailable: 'GPS Unavailable',
};

export type Translations = typeof vi;
