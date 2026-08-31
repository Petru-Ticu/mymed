import { isRunningInExpoGo } from 'expo';

export function runningInExpoGo() {
  try {
    return isRunningInExpoGo();
  } catch {
    return false;
  }
}
