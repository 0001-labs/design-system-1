// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from "vite-plus/test";
import { act, createElement as h, useState } from "react";
import { createRoot } from "react-dom/client";
import { bindOverlaySwipe, overlayEdge } from "../DS1/0-face/overlay-swipe";
import { Overlay, OverlayContent, OverlayTitle } from "../DS1/react/overlay";
vi.stubGlobal("fetch", vi.fn(async () => new Response("{}")));
await import("../DS1/4-page/ds-overlay");

afterEach(() => { document.body.replaceChildren(); document.documentElement.removeAttribute("style"); });

const frames = async (count = 3) => { for (let i = 0; i < count; i++) await new Promise(resolve => setTimeout(resolve, 20)); };

/** A finger on the dialog, as a touch event with its touches, a frame between moves. */
async function swipe(dialog: HTMLDialogElement, path: [number, number][], { hold = 0 } = {}) {
  const target = dialog.firstElementChild ?? dialog;
  const fire = (type: string, x: number, y: number, held: boolean, time: number) => {
    const touch = { identifier: 1, clientX: x, clientY: y, target };
    const event = new Event(type, { bubbles: true, cancelable: true, composed: true });
    Object.defineProperties(event, { touches: { value: held ? [touch] : [] }, changedTouches: { value: [touch] }, timeStamp: { value: time } });
    target.dispatchEvent(event);
    return event;
  };
  let time = 1000;
  fire("touchstart", ...path[0]!, true, time);
  const moves: Event[] = [];
  for (const [x, y] of path.slice(1)) { time += 16; moves.push(fire("touchmove", x, y, true, time)); }
  time += hold;
  const dragging = dialog.hasAttribute("data-ds-overlay-dragging");
  const dragged = dialog.style.getPropertyValue("--ds-overlay-drag");
  fire("touchend", ...path.at(-1)!, false, time);
  return { dragging, dragged, prevented: moves.some(move => move.defaultPrevented) };
}

const tall = (dialog: HTMLDialogElement, height = 400) =>
  vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue({ width: 375, height, top: 412, left: 0, right: 375, bottom: 812, x: 0, y: 412 } as DOMRect);
const QUICK: [number, number][] = [[100, 400], [100, 430], [100, 470], [100, 520], [100, 580]];

/** An overlay of a type (a drawer at its side), opened. */
async function sheet(type = "sheet", side = "end") {
  const host = document.createElement("ds-overlay");
  host.setAttribute("type", type);
  host.setAttribute("side", side);
  host.innerHTML = '<dialog aria-label="Sheet"><p>Words</p></dialog>';
  document.body.append(host);
  await host.show();
  const dialog = host.querySelector("dialog")!;
  tall(dialog);
  return { host, dialog };
}

test("type marks the native frame and its edge, a modal by default; only a sheet and a drawer have an edge", async () => {
  const host = document.createElement("ds-overlay");
  host.innerHTML = '<dialog aria-label="Example"></dialog>';
  document.body.append(host);
  await host.updateComplete;
  const dialog = host.querySelector("dialog")!;
  expect(host.type).toBe("modal");
  expect(dialog.getAttribute("data-ds-type")).toBe("modal");
  expect(dialog.hasAttribute("data-ds-edge")).toBe(false);
  for (const [type, side, edge] of [["sheet", "end", "bottom"], ["drawer", "end", "end"], ["drawer", "start", "start"]] as const) {
    host.type = type;
    host.side = side;
    await host.updateComplete;
    expect(dialog.getAttribute("data-ds-type")).toBe(type);
    expect(dialog.getAttribute("data-ds-edge")).toBe(edge);
    expect(host.getAttribute("type")).toBe(type);
    expect(overlayEdge(dialog)).toBe(edge);
  }
  for (const type of ["popover", "screen", "modal"] as const) {
    host.type = type;
    await host.updateComplete;
    expect(dialog.getAttribute("data-ds-type")).toBe(type);
    expect(dialog.hasAttribute("data-ds-edge")).toBe(false);
  }
  // An unknown type is drawn as a modal.
  host.setAttribute("type", "center");
  await host.updateComplete;
  expect(dialog.getAttribute("data-ds-type")).toBe("modal");
  // A native frame tells its edge by its classes.
  const native = document.createElement("dialog");
  native.className = "ds-overlay ds-overlay--drawer ds-overlay--start";
  expect(overlayEdge(native)).toBe("start");
  native.className = "ds-overlay ds-overlay--sheet";
  expect(overlayEdge(native)).toBe("bottom");
});

test("a quick swipe asks to close with the reason swipe, and closes; keyboard and focus stay the dialog's", async () => {
  const opener = document.createElement("button");
  document.body.append(opener); opener.focus();
  const { host, dialog } = await sheet();
  const reasons: string[] = [];
  host.addEventListener("ds-close-request", event => reasons.push((event as CustomEvent<{ reason: string }>).detail.reason));
  const gesture = await swipe(dialog, QUICK);
  expect(gesture.dragging).toBe(true);
  expect(gesture.prevented).toBe(true);
  expect(gesture.dragged).toMatch(/px$/);
  expect(reasons).toEqual(["swipe"]);
  expect(host.open).toBe(false);
  expect(dialog.open).toBe(false);
  expect(document.activeElement).toBe(opener);
});

test("a declined swipe keeps it open and settles it home; a slow, short drag settles without asking", async () => {
  const { host, dialog } = await sheet();
  const reasons: string[] = [];
  host.addEventListener("ds-close-request", event => { reasons.push((event as CustomEvent<{ reason: string }>).detail.reason); event.preventDefault(); });
  await swipe(dialog, QUICK);
  expect(reasons).toEqual(["swipe"]);
  await frames();
  expect(host.open).toBe(true);
  expect(dialog.style.getPropertyValue("--ds-overlay-drag")).toBe("0px");
  expect(dialog.style.getPropertyValue("--ds-overlay-progress")).toBe("0");
  expect(dialog.hasAttribute("data-ds-overlay-dragging")).toBe(false);
  await swipe(dialog, [[100, 400], [100, 420], [100, 440], [100, 460]], { hold: 200 });
  expect(reasons).toEqual(["swipe"]);
  expect(dialog.style.getPropertyValue("--ds-overlay-drag")).toBe("0px");
});

test("dragged towards the page it gives a little, and fades the backdrop as it goes", async () => {
  const { dialog } = await sheet();
  const up = await swipe(dialog, [[100, 400], [100, 370], [100, 300], [100, 200]]);
  expect(up.dragging).toBe(true);
  // Rubber-banded: 190px up moves it far less.
  expect(Math.abs(parseFloat(up.dragged))).toBeLessThan(190);
  expect(parseFloat(up.dragged)).toBeLessThan(0);
  const target = dialog.firstElementChild!;
  const touch = (type: string, y: number, held = true) => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperties(event, { touches: { value: held ? [{ identifier: 2, clientX: 100, clientY: y, target }] : [] } });
    target.dispatchEvent(event);
  };
  // Tracked from where the drag began, twenty pixels down: 200 of 400 is half way.
  touch("touchstart", 400); touch("touchmove", 420); touch("touchmove", 620);
  expect(dialog.style.getPropertyValue("--ds-overlay-progress")).toBe("0.5");
  touch("touchcancel", 620, false);
  expect(dialog.style.getPropertyValue("--ds-overlay-drag")).toBe("0px");
});

test("a sideways move, a slider and content scrolled down keep their touches", async () => {
  const { host, dialog } = await sheet();
  const close = vi.fn();
  host.addEventListener("ds-close-request", close);
  expect((await swipe(dialog, [[100, 400], [140, 404], [190, 408], [260, 412]])).dragging).toBe(false);
  dialog.firstElementChild!.setAttribute("role", "slider");
  expect((await swipe(dialog, QUICK)).dragging).toBe(false);
  dialog.firstElementChild!.removeAttribute("role");
  dialog.style.overflowY = "auto";
  Object.defineProperties(dialog, { scrollHeight: { value: 900, configurable: true }, clientHeight: { value: 400, configurable: true } });
  dialog.scrollTop = 50;
  Object.defineProperty(dialog, "scrollTop", { value: 50, configurable: true });
  expect((await swipe(dialog, QUICK)).dragging).toBe(false);
  expect(close).not.toHaveBeenCalled();
  expect(host.open).toBe(true);
});

test("a drawer at the end swipes away to the right, and in a right-to-left page to the left", async () => {
  const { host, dialog } = await sheet("drawer", "end");
  const reasons: string[] = [];
  host.addEventListener("ds-close-request", event => reasons.push((event as CustomEvent<{ reason: string }>).detail.reason));
  expect((await swipe(dialog, [[200, 300], [230, 300], [270, 300], [320, 300], [370, 300]])).dragged).toMatch(/^\d/);
  expect(reasons).toEqual(["swipe"]);
  expect(host.open).toBe(false);

  const rtl = await sheet("drawer", "end");
  rtl.host.setAttribute("dir", "rtl");
  rtl.dialog.style.direction = "rtl";
  expect((await swipe(rtl.dialog, [[200, 300], [230, 300], [270, 300], [320, 300]])).dragged, "towards the page: it gives").toMatch(/^\d/);
  expect(rtl.host.open).toBe(true);
  await swipe(rtl.dialog, [[300, 300], [270, 300], [230, 300], [180, 300], [120, 300]]);
  expect(rtl.host.open).toBe(false);
});

test("a centred dialog is never swiped", async () => {
  const { host, dialog } = await sheet("modal");
  expect((await swipe(dialog, QUICK)).dragging).toBe(false);
  expect(host.open).toBe(true);
});

test("a native sheet asks with a cancelable ds-close-request on the dialog, closes unless declined, and starts clean when opened again", async () => {
  document.body.innerHTML = '<dialog class="ds-overlay ds-overlay--sheet" aria-label="Native"><p>Words</p></dialog>';
  const dialog = document.querySelector("dialog")!;
  tall(dialog);
  expect(overlayEdge(dialog)).toBe("bottom");
  const unbind = bindOverlaySwipe(dialog);
  dialog.showModal();
  let decline = true;
  const reasons: string[] = [];
  dialog.addEventListener("ds-close-request", event => { reasons.push((event as CustomEvent<{ reason: string }>).detail.reason); if (decline) event.preventDefault(); });
  await swipe(dialog, QUICK);
  expect(dialog.open).toBe(true);
  decline = false;
  await swipe(dialog, QUICK);
  expect(reasons).toEqual(["swipe", "swipe"]);
  expect(dialog.open).toBe(false);
  expect(dialog.style.getPropertyValue("--ds-overlay-drag")).not.toBe("");
  dialog.showModal();
  await frames(1);
  expect(dialog.style.getPropertyValue("--ds-overlay-drag")).toBe("");
  unbind();
  expect((await swipe(dialog, QUICK)).dragging).toBe(false);
});

test("onDismiss replaces the close request; a product closing a moment later is not settled home", async () => {
  document.body.innerHTML = '<dialog class="ds-overlay ds-overlay--drawer ds-overlay--start" aria-label="Native"><p>Words</p></dialog>';
  const dialog = document.querySelector("dialog")!;
  tall(dialog);
  const onDismiss = vi.fn(() => setTimeout(() => dialog.close(), 5));
  bindOverlaySwipe(dialog, { onDismiss });
  dialog.showModal();
  await swipe(dialog, [[300, 300], [270, 300], [230, 300], [180, 300], [120, 300]]);
  expect(onDismiss).toHaveBeenCalledWith(dialog);
  await frames();
  expect(dialog.open).toBe(false);
  expect(dialog.style.getPropertyValue("--ds-overlay-drag")).not.toBe("0px");
});

test("React passes the type, keeps a sliding sheet on the page until it has slid out, and removes a modal at once", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const mount = document.createElement("div"); document.body.append(mount);
  const root = createRoot(mount);
  let toggle: (open: boolean) => void = () => {};
  function Example({ type }: { type: "sheet" | "modal" }) {
    const [open, setOpen] = useState(true);
    toggle = setOpen;
    return h(Overlay, { open, onOpenChange: setOpen, children: h(OverlayContent, { type }, h(OverlayTitle, null, "Trade")) });
  }
  await act(async () => { root.render(h(Example, { type: "sheet" })); });
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
  const host = document.querySelector("ds-overlay")!;
  expect(host.type).toBe("sheet");
  expect(host.querySelector("dialog")!.getAttribute("data-ds-edge")).toBe("bottom");
  await act(async () => { toggle(false); });
  expect(document.querySelector("ds-overlay")).toBe(host);
  expect(host.open).toBe(false);
  await act(async () => {
    const event = new Event("transitionend");
    Object.defineProperties(event, { propertyName: { value: "transform" }, pseudoElement: { value: "" } });
    host.querySelector("dialog")!.dispatchEvent(event);
  });
  expect(document.querySelector("ds-overlay")).toBeNull();

  await act(async () => { root.render(h(Example, { type: "modal" })); });
  await act(async () => { toggle(true); });
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
  expect(document.querySelector("ds-overlay")).not.toBeNull();
  await act(async () => { toggle(false); });
  expect(document.querySelector("ds-overlay")).toBeNull();
  act(() => root.unmount());
});

test("detail follows the viewport without replacing the open dialog or changing non-modal interaction", async () => {
  let phone = false;
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: phone })));
  const opener = document.createElement("button");
  document.body.append(opener); opener.focus();
  const host = document.createElement("ds-overlay");
  host.type = "detail";
  host.nonModal = true;
  host.innerHTML = '<dialog aria-label="People"><input aria-label="Name"><button data-ds-overlay-dismiss>Close</button></dialog>';
  document.body.append(host);
  await host.show();
  const dialog = host.querySelector("dialog")!, field = host.querySelector("input")!;
  expect(dialog.dataset.dsType).toBe("drawer");
  field.focus(); field.value = "Draft";
  phone = true;
  window.dispatchEvent(new Event("resize"));
  expect(dialog.dataset.dsType).toBe("sheet");
  expect(dialog.dataset.dsEdge).toBe("bottom");
  expect(dialog.open).toBe(true);
  expect(document.activeElement).toBe(field);
  expect(document.documentElement.style.overflow).toBe("");
  expect(document.body.style.position).toBe("");
  phone = false;
  window.dispatchEvent(new Event("resize"));
  expect(dialog.dataset.dsType).toBe("drawer");
  expect(field.value).toBe("Draft");
  host.querySelector("button")!.click();
  expect(host.open).toBe(false);
  expect(document.activeElement).toBe(opener);
  await host.show();
  expect(host.querySelector("dialog")).toBe(dialog);
  host.requestClose("escape");
  vi.unstubAllGlobals();
});

test("a modeless sheet closes on a press on the page above it, which stands for its backdrop", async () => {
  const page = document.createElement("button");
  const pressed = vi.fn();
  page.addEventListener("click", pressed);
  document.body.append(page);
  const host = document.createElement("ds-overlay");
  host.type = "sheet";
  host.nonModal = true;
  host.closeOnOutside = false;
  host.innerHTML = '<dialog aria-label="People"><button>Inside</button></dialog>';
  document.body.append(host);
  await host.show();
  const reasons: string[] = [];
  host.addEventListener("ds-close-request", event => reasons.push((event as CustomEvent).detail.reason));
  host.querySelector("dialog button")!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }));
  host.querySelector<HTMLButtonElement>("dialog button")!.click();
  expect(host.open, "a press inside keeps it").toBe(true);
  page.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }));
  page.click();
  expect(reasons).toEqual(["outside"]);
  expect(host.open).toBe(false);
  expect(pressed, "the press reaches the page, as every modeless outside press does").toHaveBeenCalledTimes(1);

  host.closeOnBackdrop = false;
  await host.show();
  page.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }));
  page.click();
  expect(host.open, "closeOnBackdrop off keeps it").toBe(true);
  expect(pressed).toHaveBeenCalledTimes(2);

  const drawer = document.createElement("ds-overlay");
  drawer.type = "drawer";
  drawer.nonModal = true;
  drawer.innerHTML = '<dialog aria-label="Panel"></dialog>';
  host.remove();
  document.body.append(drawer);
  await drawer.show();
  page.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }));
  page.click();
  expect(drawer.open, "a modeless drawer stays while the page is used").toBe(true);
  expect(pressed).toHaveBeenCalledTimes(3);
});

test("before it decides, a move towards the edge is held from the page, so Safari cannot scroll the page instead", async () => {
  const { dialog } = await sheet();
  const first = (path: [number, number][]) => {
    const target = dialog.firstElementChild!;
    const fire = (type: string, [x, y]: [number, number], held = true) => {
      const touch = { identifier: 3, clientX: x, clientY: y, target };
      const event = new Event(type, { bubbles: true, cancelable: true, composed: true });
      Object.defineProperties(event, { touches: { value: held ? [touch] : [] }, changedTouches: { value: [touch] } });
      target.dispatchEvent(event);
      return event;
    };
    fire("touchstart", path[0]!);
    const move = fire("touchmove", path[1]!);
    fire("touchend", path[1]!, false);
    return move.defaultPrevented;
  };
  expect(first([[100, 400], [100, 404]]), "down, under the ten pixels").toBe(true);
  expect(first([[100, 400], [100, 396]]), "up: the content's or the page's").toBe(false);
  expect(first([[100, 400], [106, 402]]), "sideways").toBe(false);
  dialog.style.overflowY = "auto";
  Object.defineProperties(dialog, { scrollHeight: { value: 900, configurable: true }, clientHeight: { value: 400, configurable: true }, scrollTop: { value: 50, configurable: true } });
  expect(first([[100, 400], [100, 404]]), "content scrolled down scrolls back first").toBe(false);
});

test("a finger lifted outside closes a modeless overlay without waiting for a click Safari never sends; a mouse waits for its click", async () => {
  const page = document.createElement("div");
  document.body.append(page);
  const host = document.createElement("ds-overlay");
  host.type = "sheet";
  host.nonModal = true;
  host.innerHTML = '<dialog aria-label="People"><button>Inside</button></dialog>';
  document.body.append(host);
  const lift = (target: Element, pointerType: string) => {
    target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true, pointerType }));
    target.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, composed: true, pointerType }));
  };
  await host.show();
  lift(host.querySelector("dialog button")!, "touch");
  expect(host.open, "a finger inside keeps it").toBe(true);
  lift(page, "mouse");
  expect(host.open, "a mouse waits for its click").toBe(true);
  page.click();
  expect(host.open).toBe(false);
  await host.show();
  lift(page, "touch");
  expect(host.open, "a finger lifted on the page above closes it").toBe(false);
  await host.show();
  page.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, composed: true, pointerType: "touch" }));
  expect(host.open, "a lift without its press outside (a drag that ended there) keeps it").toBe(true);
  host.closeOnBackdrop = false;
  lift(page, "touch");
  expect(host.open, "closeOnBackdrop off keeps it").toBe(true);
});
