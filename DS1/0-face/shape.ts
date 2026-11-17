import "./theme-bootstrap.js";

export type Shape = "square" | "rounded" | "circular";
export const SHAPES: readonly Shape[] = ["square", "rounded", "circular"];

export interface ShapeRuntime {
  shape(): Shape | null;
  set(shape: Shape): void;
  apply(): Shape | null;
}

declare global {
  interface Window {
    DS_ONE_SHAPE?: ShapeRuntime;
  }
}

export function getShape(): Shape {
  return window.DS_ONE_SHAPE?.shape() ?? "rounded";
}

export function setShape(shape: Shape): void {
  window.DS_ONE_SHAPE?.set(shape);
}
