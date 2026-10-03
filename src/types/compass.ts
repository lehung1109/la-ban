export interface CardinalInfo {
  code: string;
  name: string;
}

export interface GeolocationData {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracy: number | null;
  error: string | null;
}

export interface CompassState {
  heading: number;
  rawHeading: number;
  pitch: number;
  roll: number;
  accuracy: number | null;
  targetBearing: number | null;
  isLocked: boolean;
  isDesktop: boolean;
  hasPermission: boolean;
  isCalibrated: boolean;
}
