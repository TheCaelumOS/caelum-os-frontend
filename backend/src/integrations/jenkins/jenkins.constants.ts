export const JENKINS_LOCAL_PROBE_PORTS = [8080, 8081, 8443, 9090];
export const JENKINS_REQUEST_TIMEOUT_MS = 12000;
export const JENKINS_CONSOLE_TIMEOUT_MS = 8000;
export const JENKINS_USER_AGENT = 'CaelumOS-Jenkins/1.0';

export enum JenkinsConnectionStatus {
  CONNECTED = 'CONNECTED',
  NOT_CONNECTED = 'NOT_CONNECTED',
  UNAVAILABLE = 'UNAVAILABLE',
  ERROR = 'ERROR',
  CONNECTING = 'CONNECTING',
}

export enum JenkinsBuildResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  UNSTABLE = 'UNSTABLE',
  ABORTED = 'ABORTED',
  NOT_BUILT = 'NOT_BUILT',
  BUILDING = 'BUILDING',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Standard mapping from Jenkins color code to status and building flag.
 * Jenkins uses color codes: 'blue', 'blue_anime', 'red', 'yellow', 'grey', 'disabled', 'aborted', etc.
 */
export function parseJenkinsColor(color?: string): {
  status: JenkinsBuildResult;
  isBuilding: boolean;
} {
  if (!color) {
    return { status: JenkinsBuildResult.UNKNOWN, isBuilding: false };
  }

  const isBuilding = color.endsWith('_anime');
  const baseColor = color.replace(/_anime$/, '').toLowerCase();

  switch (baseColor) {
    case 'blue':
      return { status: JenkinsBuildResult.SUCCESS, isBuilding };
    case 'red':
      return { status: JenkinsBuildResult.FAILURE, isBuilding };
    case 'yellow':
      return { status: JenkinsBuildResult.UNSTABLE, isBuilding };
    case 'grey':
    case 'disabled':
    case 'notbuilt':
      return { status: JenkinsBuildResult.NOT_BUILT, isBuilding };
    case 'aborted':
      return { status: JenkinsBuildResult.ABORTED, isBuilding };
    default:
      return { status: isBuilding ? JenkinsBuildResult.BUILDING : JenkinsBuildResult.UNKNOWN, isBuilding };
  }
}
