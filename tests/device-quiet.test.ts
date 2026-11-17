// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from 'vite-plus/test';
import { initDeviceDetection } from '../DS1/0-face/device';

afterEach(() => {
  vi.restoreAllMocks();
  delete (window as unknown as { DS_ONE_DEBUG?: boolean }).DS_ONE_DEBUG;
});

test('device detection keeps the console quiet unless the debug switch is on', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  initDeviceDetection();
  expect(log).not.toHaveBeenCalled();

  (window as unknown as { DS_ONE_DEBUG?: boolean }).DS_ONE_DEBUG = true;
  initDeviceDetection();
  expect(log).toHaveBeenCalled();
});
