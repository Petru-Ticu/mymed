import {
  parseInventoryAmount,
  applyTakenDose,
} from '../src/inventoryAmount';

const dailyFrequency = (amount, threshold = 5) =>
  `Daily X Times a Day\n\nTimes when you are taking the Meds in a Day:\n\n1. 08:00 - meds: 2\n\nAmount: ${amount}\n\nThreshold: ${threshold}\n`;

describe('parseInventoryAmount', () => {
  it('returns null for skipped inventory (Amount: Null) instead of throwing', () => {
    expect(parseInventoryAmount(dailyFrequency('Null'))).toBeNull();
  });

  it('returns null when Amount is missing', () => {
    expect(parseInventoryAmount('Daily X Times a Day\n\n1. 08:00 - meds: 2')).toBeNull();
  });

  it('parses a numeric inventory amount including zero', () => {
    expect(parseInventoryAmount(dailyFrequency(12))).toBe(12);
    expect(parseInventoryAmount(dailyFrequency(0))).toBe(0);
  });
});

describe('applyTakenDose', () => {
  it('does not crash or rewrite frequency when inventory is Null', () => {
    const frequency = dailyFrequency('Null', 'Null');
    expect(applyTakenDose(frequency, 2)).toEqual({
      modalFrequency: frequency,
      amount: null,
      depleted: false,
      belowThreshold: false,
    });
  });

  it('decrements inventory and keeps threshold unchanged', () => {
    const result = applyTakenDose(dailyFrequency(10, 3), 2);
    expect(result.amount).toBe(8);
    expect(result.depleted).toBe(false);
    expect(result.belowThreshold).toBe(false);
    expect(result.modalFrequency).toMatch(/Amount: 8/);
    expect(result.modalFrequency).toMatch(/Threshold: 3/);
  });

  it('allows inventory to reach 0 without overwriting threshold', () => {
    const result = applyTakenDose(dailyFrequency(2, 5), 2);
    expect(result.amount).toBe(0);
    expect(result.depleted).toBe(true);
    expect(result.modalFrequency).toMatch(/Amount: 0/);
    expect(result.modalFrequency).toMatch(/Threshold: 5/);
  });

  it('flags refill warning when remaining amount is at or below threshold', () => {
    const result = applyTakenDose(dailyFrequency(6, 5), 2);
    expect(result.amount).toBe(4);
    expect(result.belowThreshold).toBe(true);
    expect(result.depleted).toBe(false);
  });
});
