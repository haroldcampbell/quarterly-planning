import { EpicSizes, SizeOnly, XYOnly } from "../home_screen/_defs";

type EpicWeekPosition = { rectPostion: XYOnly, textPosition: XYOnly };

export const RowPadding = 12; /** The space at the start and end of the row */
export const ColGap = 1;

export const ShapeYOffset = 20;
export const TextYOffset = 33;

export type EpicControllerBounds = {
    position: XYOnly;
    size: SizeOnly;
};

export const MilliSecondsInDay = 86400000; //24 * 60 * 60 * 1000

/**
 * Quick way to align the text visually instead of using
 * textBoundingBox() and the Rect's BBox() to vertically align the text in the shape.
 */
export const TextShapeYGap = TextYOffset - ShapeYOffset;

/**
 * WARNING:
 * This should have the same width as .team-epics-scroll-container .week-detail-container .week
 * in the teamEpics.css
*/
export const MinWeekCellWidth = 100;
export const SVGMaxContextWidth = MinWeekCellWidth * 12 + 11; // 11 = the column gaps

export function CalcEpicWeekPosition(expectedStartPeriod: number, svgNodeY: number, epicSize: EpicSizes, svgTextNodeWidth: number): EpicWeekPosition {
    const y = svgNodeY;
    const epicNodeWidth = EpicSizeToWidth(epicSize)!;
    const weekIndex = Math.floor(expectedStartPeriod) - 1; /** Convert to zero-based index */
    const textXOffset = (epicNodeWidth - svgTextNodeWidth) / 2.0;

    /** Calculate the position from the ExpectedStartPeriod */
    let x = RowPadding + weekIndex * MinWeekCellWidth;

    if (!Number.isInteger(expectedStartPeriod)) {
        /** Offset for the fractional starting periods (1.5, 2.5, 3.5, etc.) */
        x += RowPadding + minEpicSize;
    }

    return {
        rectPostion: {
            x: x,
            y: y + ShapeYOffset
        },
        textPosition: {
            x: x + textXOffset,
            y: y + TextYOffset
        },
    }
}

/**
 *
 * @returns Mapping for EpicSizes to duration for the epic size in day
 */
function translateEpicSizeToDays(): Map<EpicSizes, number> {
    const durationMap = new Map<EpicSizes, number>();

    durationMap.set(EpicSizes.XSmall, 2.5);
    durationMap.set(EpicSizes.Small, 5);
    durationMap.set(EpicSizes.Medium, 10);
    durationMap.set(EpicSizes.Large, 20);
    durationMap.set(EpicSizes.XLarge, 40);
    durationMap.set(EpicSizes.Unknown, 60);

    return durationMap;
}
const epicSizeDurationMap = translateEpicSizeToDays();
export function epicSizeInDays(size: EpicSizes): number {
    return epicSizeDurationMap.get(size)!;
}

/**
 * Precalculated table for pixel-sizes based on epic-sizes.
 */
function translateEpicSizeToPixels(): Map<EpicSizes, number> {
    const rP2 = RowPadding * 2.0;

    const sizeMap = new Map<EpicSizes, number>();
    sizeMap.set(EpicSizes.XSmall, (MinWeekCellWidth + RowPadding) / 2.0 - rP2);
    sizeMap.set(EpicSizes.Small, MinWeekCellWidth - rP2);
    sizeMap.set(EpicSizes.Medium, MinWeekCellWidth * 2.0 - rP2);
    sizeMap.set(EpicSizes.Large, MinWeekCellWidth * 4 - rP2);
    sizeMap.set(EpicSizes.XLarge, MinWeekCellWidth * 8 - rP2);
    sizeMap.set(EpicSizes.Unknown, MinWeekCellWidth * 12 - rP2);

    return sizeMap;
}

const epicSizePixelMap = translateEpicSizeToPixels();
const minEpicSize = EpicSizeToWidth(EpicSizes.XSmall);

export function EpicSizeToWidth(size: EpicSizes): number {
    return epicSizePixelMap.get(size)!;
}

/**
 * Adds an ellipsis if text can't fit in width
 * Based on https://stackoverflow.com/questions/9241315/trimming-text-to-a-given-pixel-width-in-svg
 */
export function PlaceTextWithEllipsis(textObj: any, textString: string, width: number) {
    if (textObj.$textBoundingBox().width < width) {
        return;
    }

    //ellipsis is needed
    for (var x = textString.length; x > 0; x -= 1) {
        textObj.$text(textString.substring(0, x) + "...");

        if (textObj.$textBoundingBox().width <= width) {
            textObj.textContent = textString.substring(0, x) + "...";
            return;
        }
    }
    textObj.textContent = "..."; //can't place at all
}