// @vitest-environment happy-dom
import { expect, test } from 'vite-plus/test';
import { DsDeviceBezel } from '../DS1/5-visual-kit/device-bezel';

test('device artwork loads near the viewport and decodes without blocking the page', async () => {
  const device = new DsDeviceBezel();
  device.device = 'iphone-17-pro-max-deep-blue';
  device.assetBase = '/device/';
  document.body.append(device);
  await device.updateComplete;
  const image = device.shadowRoot!.querySelector('img.art')!;
  expect(image.getAttribute('loading')).toBe('lazy');
  expect(image.getAttribute('decoding')).toBe('async');
  expect(Number(image.getAttribute('width'))).toBeGreaterThan(0);
  expect(Number(image.getAttribute('height'))).toBeGreaterThan(0);
  device.remove();
});
