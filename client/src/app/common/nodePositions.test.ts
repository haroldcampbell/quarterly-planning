/**
 * @jest-environment jsdom
 */

import { CalcEpicWeekPosition, ColGap, EpicSizes, EpicSizeToWidth, EpicWeekStartToIndex, MinWeekCellWidth, RowPadding } from "./nodePositions"


describe("Convert Epic size to pixel width", () =>{
    test("XSmall epic width", ()=>{
        const tartgetWidth = MinWeekCellWidth/2.0 - RowPadding;

        expect(EpicSizeToWidth(EpicSizes.XSmall)!).toBe(tartgetWidth);
    });

    test("Small epic width", ()=>{
        const tartgetWidth = MinWeekCellWidth - RowPadding;

        expect(EpicSizeToWidth(EpicSizes.Small)!).toBe(tartgetWidth);
    });

    test("Medium epic width", ()=>{
        const tartgetWidth = 2*MinWeekCellWidth - RowPadding;

        expect(EpicSizeToWidth(EpicSizes.Medium)!).toBe(tartgetWidth);
    });

    test("Large epic width", ()=>{
        const tartgetWidth = 4*MinWeekCellWidth - RowPadding;

        expect(EpicSizeToWidth(EpicSizes.Large)!).toBe(tartgetWidth);
    });

    test("XLarge epic width", ()=>{
        const tartgetWidth = 8*MinWeekCellWidth - RowPadding;

        expect(EpicSizeToWidth(EpicSizes.XLarge)!).toBe(tartgetWidth);
    });

    test("Unknown epic width", ()=>{
        const tartgetWidth = 12*MinWeekCellWidth - RowPadding;

        expect(EpicSizeToWidth(EpicSizes.Unknown)!).toBe(tartgetWidth);
    });
});

describe("Node positions", ()=> {
    test("slot #1", ()=>{
        const nodePos = CalcEpicWeekPosition(1, 0, EpicSizes.XSmall, 80);
        const targetX = RowPadding/2;

        expect(nodePos.rectPostion.x).toBe(targetX);
    });

    test("slot #2", ()=>{
        const expectedStartPeriod = 1.5;
        const nodePos = CalcEpicWeekPosition(expectedStartPeriod, 0, EpicSizes.XSmall, 80);
        const weekIndex = EpicWeekStartToIndex(expectedStartPeriod);

        const xbase = RowPadding / 2.0 + weekIndex * (MinWeekCellWidth + ColGap)
        expect(xbase).toBe(RowPadding / 2.0)

        // xFractionalOffset will return either 0 or MinWeekCellWidth/2.0;
        // It is needed for those epic that are xx.5, yy.5, etc.
        const xFractionalOffset = (expectedStartPeriod - Math.floor(expectedStartPeriod)) * MinWeekCellWidth;
        expect(xFractionalOffset).toBe(MinWeekCellWidth / 2.0)

        const targetX = xbase + xFractionalOffset;
        expect(nodePos.rectPostion.x).toBe(targetX)
    });

    test("slot #3", ()=>{
        const expectedStartPeriod = 2;
        const nodePos = CalcEpicWeekPosition(expectedStartPeriod, 0, EpicSizes.XSmall, 80);
        const weekIndex = EpicWeekStartToIndex(expectedStartPeriod);
        const targetX = RowPadding / 2.0 + weekIndex * (MinWeekCellWidth + ColGap)

        expect(nodePos.rectPostion.x).toBe(targetX)
    });
});