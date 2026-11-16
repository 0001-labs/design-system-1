import { describe, expect, test } from 'vite-plus/test';
import { countingText, otherTheme, readTurns, restartTurnLine, turnQueue } from '../shared/consistency-behaviours';

describe('a hero takes turns', () => {
  test('the turns to come are every other one: as written from the next, or shuffled', () => {
    expect(turnQueue(4, 1, 'in-order')).toEqual([2, 3, 0]);
    expect(turnQueue(4, 3, 'in-order')).toEqual([0, 1, 2]);
    const shuffled = turnQueue(6, 2, 'shuffled', () => 0);
    expect([...shuffled].sort()).toEqual([0, 1, 3, 4, 5]);
    expect(shuffled).not.toContain(2);
    expect(turnQueue(1, 0, 'shuffled')).toEqual([]);
  });

  test('digits count to their new number, settling from the left; other characters stand', () => {
    expect(countingText('0042', 0, () => 0.9)).toBe('9999');
    expect(countingText('0042', 0.5, () => 0.9)).toBe('0099');
    expect(countingText('0042', 1, () => 0.9)).toBe('0042');
    expect(countingText('No. 7', 0, () => 0.3)).toBe('No. 3');
  });

  test('turns are read from the hero\'s data, and anything else is no turns', () => {
    expect(readTurns('[{"kicker":"0002","title":"Two","src":"/two.webp","alt":""},{"title":3},null]')).toEqual([{ kicker: '0002', title: 'Two', src: '/two.webp', alt: '' }]);
    expect(readTurns('{"title":"One"}')).toEqual([]);
    expect(readTurns('not json')).toEqual([]);
    expect(readTurns(undefined)).toEqual([]);
  });

  test('a turn starts the theme\'s line to the next turn again, and no other animation', () => {
    const line = { animationName: 'c9y-turn', currentTime: 2400 }, other = { animationName: 'fade', currentTime: 2400 }, script = { currentTime: 2400 };
    restartTurnLine({ getAnimations: () => [line, other, script] as unknown as Animation[] });
    expect([line.currentTime, other.currentTime, script.currentTime]).toEqual([0, 2400, 2400]);
  });

  test('the theme control goes to the other theme', () => {
    expect(otherTheme('light')).toBe('dark');
    expect(otherTheme('dark')).toBe('light');
  });
});
