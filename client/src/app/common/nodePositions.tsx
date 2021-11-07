export type XYOnly = { x: number, y: number };

export type SizeOnly = {
    width: number;
    height: number;
}

export type NodePos = {
    rectPos: XYOnly,
    textPos: XYOnly
}

export enum EpicSizes {
    XSmall = .5, // 1/4 Sprint, 2-ish Days?
    Small = 1, // 1/2 Sprint, 5 Days
    Medium = 2, // 1 Sprint, 10 Days
    Large = 3, // 2 Sprints, 20 Days
    XLarge = 5, // 4 Sprints, 40 Days
    Unknown = 11 // at least Sprints, 60 Days
}

export type EpicWeekPosition = { rectPostion: XYOnly, textPosition: XYOnly };

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

export function EpicWeekStartToIndex(expectedStartPeriod: number): number {
    return Math.floor(expectedStartPeriod) - 1; /** Convert to zero-based index */
}

export function CalcEpicWeekPosition(expectedStartPeriod: number, svgNodeY: number, epicSize: EpicSizes, svgTextNodeWidth: number): EpicWeekPosition {
    const y = svgNodeY;
    const epicNodeWidth = EpicSizeToWidth(epicSize)!;
    const weekIndex = EpicWeekStartToIndex(expectedStartPeriod)
    const textXOffset = (epicNodeWidth - svgTextNodeWidth) / 2.0;

    /** Calculate the position from the ExpectedStartPeriod */
    // let x = RowPadding + weekIndex * MinWeekCellWidth;
    let x = RowPadding / 2.0 + weekIndex * (MinWeekCellWidth + ColGap)
    //  (ww + RowPadding + ColGap / 2.0) + RowPadding / 2.0 //+ (weekIndex - 1) * RowPadding//+ RowPadding * 2 + ColGap / 2) + RowPadding / 2.0
    x += (expectedStartPeriod - Math.floor(expectedStartPeriod)) * MinWeekCellWidth
    //+ ColGap * weekIndex;


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
    const sizeMap = new Map<EpicSizes, number>();
    const tinyCellWidth = MinWeekCellWidth / 2.0 - RowPadding

    sizeMap.set(EpicSizes.XSmall, tinyCellWidth);
    sizeMap.set(EpicSizes.Small, MinWeekCellWidth - RowPadding);
    sizeMap.set(EpicSizes.Medium, MinWeekCellWidth * 2.0 - RowPadding);
    sizeMap.set(EpicSizes.Large, MinWeekCellWidth * 4 - RowPadding);
    sizeMap.set(EpicSizes.XLarge, MinWeekCellWidth * 8 - RowPadding);
    sizeMap.set(EpicSizes.Unknown, MinWeekCellWidth * 12 - RowPadding);

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