/**
 * @jest-environment jsdom
 */

import { EpicSizeToSlotLength, EpicSlots, RowSlotAvailabilityStatus, RowSlots } from "./epicSlots";
import { EpicSizes } from "./nodePositions";

describe("Convert Epic size to slot length", () => {
    test("XSmall epic length", () => {
        expect(EpicSizeToSlotLength(EpicSizes.XSmall)).toBe(1);
    });

    test("Small epic length", () => {
        expect(EpicSizeToSlotLength(EpicSizes.Small)).toBe(2);
    });

    test("Medium epic length", () => {
        expect(EpicSizeToSlotLength(EpicSizes.Medium)).toBe(4);
    });

    test("Large epic length", () => {
        expect(EpicSizeToSlotLength(EpicSizes.Large)).toBe(8);
    });

    test("XLarge epic length", () => {
        expect(EpicSizeToSlotLength(EpicSizes.XLarge)).toBe(16);
    });

    test("Unknown epic length", () => {
        expect(EpicSizeToSlotLength(EpicSizes.Unknown)).toBe(24);
    });
});

describe("EpicSlots position elements", () => {

    test("getRowAndEnsureRow creates new RowSlots", () => {
        const slotIndex = 0;
        const numSlots = EpicSizeToSlotLength(EpicSizes.XSmall);
        const s = new EpicSlots();

        expect(s.getRowAndEnsureRow(0)).toBeTruthy();
    });

    describe("EpicSlots.nextFreeSlot", () => {
        test("Creates new RowSlots", () => {
            const slotIndex = 0;
            const numSlots = EpicSizeToSlotLength(EpicSizes.XSmall);

            const s = new EpicSlots();

            const row = s.getRowAndEnsureRow(0);
            let availability = row.isSlotSpanAvailable(slotIndex, numSlots);
            expect(availability.isAvailable).toBeTruthy();
            expect(availability.firstOwerEpicID).toBeUndefined()

            expect(s.nextFreeSlot(slotIndex, numSlots, "E1")).toBe(0);

            availability = row.isSlotSpanAvailable(slotIndex, numSlots);
            expect(availability.isAvailable).toBeFalsy();
            expect(availability.firstOwerEpicID).toBe("E1");
        });

        test("Creates new RowSlots for same index and same size", () => {
            const slotIndex = 0;
            const numSlots = EpicSizeToSlotLength(EpicSizes.XSmall);

            const s = new EpicSlots();

            s.nextFreeSlot(slotIndex, numSlots, "E1");
            expect(s.nextFreeSlot(slotIndex, numSlots, "E2")).toBe(1);
        });

        test("Creates new RowSlots for same index and different size", () => {
            const slotIndex = 0;
            const numSlotsXSmall = EpicSizeToSlotLength(EpicSizes.XSmall);
            const numSlotsSmall = EpicSizeToSlotLength(EpicSizes.Small);

            const s = new EpicSlots();

            s.nextFreeSlot(slotIndex, numSlotsXSmall, "E1");
            expect(s.nextFreeSlot(slotIndex, numSlotsSmall, "E2")).toBe(1);
        });

        test("Creates new RowSlots for different index and different size", () => {
            const slotIndex1 = 1; // This would map to epic.ExpectedStartPeriod == 0.5
            const slotIndex2 = 0;
            const numSlotsXSmall = EpicSizeToSlotLength(EpicSizes.XSmall);
            const numSlotsSmall = EpicSizeToSlotLength(EpicSizes.Small);

            const s = new EpicSlots();

            let rowIndex: number;
            let row: RowSlots;
            let availability: RowSlotAvailabilityStatus;

            rowIndex = s.nextFreeSlot(slotIndex1, numSlotsXSmall, "E1");
            expect(rowIndex).toBe(0);

            row = s.getRowAndEnsureRow(0);
            availability = row.isSlotSpanAvailable(slotIndex1, numSlotsXSmall);
            expect(availability.firstOwerEpicID).toBe("E1");

            rowIndex = s.nextFreeSlot(slotIndex2, numSlotsSmall, "E2");
            expect(rowIndex).toBe(1);

            row = s.getRowAndEnsureRow(1);
            availability = row.isSlotSpanAvailable(slotIndex2, numSlotsSmall);
            expect(availability.firstOwerEpicID).toBe("E2");
        });
    });
});