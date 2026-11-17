export const WINDOW_RATIO = 16 / 10;
export const PHONE_WINDOW_RATIO = 4 / 5;
export const PHONE_WIDTH = 600;
export const TALLEST_WINDOW_RATIO = 1;

export const windowRatioFloor = (pageWidth: number) => pageWidth <= PHONE_WIDTH ? PHONE_WINDOW_RATIO : TALLEST_WINDOW_RATIO;
