// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from 'vite-plus/test';
import { render } from 'lit';
import { TableColumns } from '../DS1/3-unit/table-columns';
afterEach(() => { document.body.replaceChildren(); vi.unstubAllGlobals(); });

test('rapid pointer reversals apply the latest width at most once per animation frame', () => {
  const frames = new Map<number, FrameRequestCallback>(); let next = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++next, callback); return next; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  const host = Object.assign(document.createElement('div'), { addController() {}, removeController() {}, requestUpdate() {}, updateComplete: Promise.resolve(true) });
  const viewport = document.createElement('div'), header = document.createElement('div');
  host.append(viewport); viewport.append(header); document.body.append(host);
  header.getBoundingClientRect = () => ({width: 160}) as DOMRect;
  const apply = vi.fn();
  const controller = new TableColumns(host, {scroller: () => viewport, headers: () => [header], apply});
  render(controller.handle(0, 'Name'), header);
  const handle = header.querySelector<HTMLElement>('[role="separator"]')!;
  handle.getBoundingClientRect = () => ({width: 20}) as DOMRect;
  handle.setPointerCapture = () => {}; handle.hasPointerCapture = () => false;
  const pointer = (type: string, x: number) => handle.dispatchEvent(Object.assign(new Event(type), {button: 0, pointerId: 1, clientX: x}));
  pointer('pointerdown', 160);
  for(let i=0;i<30;i++) pointer('pointermove', 170 + i * (i % 2 ? -1 : 1));
  expect(apply.mock.calls.length).toBeLessThanOrEqual(1);
  const batch=[...frames.values()]; frames.clear(); for(const frame of batch) frame(16);
  expect(apply).toHaveBeenCalledTimes(1);
  expect(apply.mock.calls[0]![0][0]).toBe(141);
  pointer('pointerup', 141);
  expect(controller.widths).toEqual([140]);
});
