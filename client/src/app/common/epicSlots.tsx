import { Epic, EpicID, EpicViewSVGNode, InterRowGap, ShapeHeight } from "../home_screen/_defs";
import { CalcEpicWeekPosition, EpicSizes, EpicWeekStartToIndex, NodePos, ShapeYOffset, TextShapeYGap, XYOnly } from "./nodePositions";

type Slot = EpicID | undefined;

/**
 * A prepopulated table that translates an epic-size to the number of slots if should occupy
 */
const _epicSizeSlotMap = ((): Map<EpicSizes, number> => {
    const slotMap = new Map<EpicSizes, number>();

    slotMap.set(EpicSizes.XSmall, 1);
    slotMap.set(EpicSizes.Small, 2);
    slotMap.set(EpicSizes.Medium, 4);
    slotMap.set(EpicSizes.Large, 8);
    slotMap.set(EpicSizes.XLarge, 16);
    slotMap.set(EpicSizes.Unknown, 24);

    return slotMap;
})()

/** Returns how many slots are taken up by an epic of the specified size */
export function EpicSizeToSlotLength(size: EpicSizes): number {
    return _epicSizeSlotMap.get(size)!;
}

export type RowSlotAvailabilityStatus = {
    isAvailable: boolean;
    firstOwerEpicID?: EpicID; /** Called the first since there may be others after this slot */
}
export class RowSlots {
    private _id = new Date().getTime();
    private slots: Slot[] = [];

    constructor() {
        this.initSlots();
    }

    initSlots() {
        for (let index = 0; index < 12; index++) {
            this.slots.push(undefined);
        }
    }

    /** Returns false if at least one slot is used. */
    isSlotSpanAvailable(slotStartIndex: number, numSlots: number): RowSlotAvailabilityStatus {
        for (let index = slotStartIndex; index < slotStartIndex + numSlots; index++) {
            if (this.slots[index] !== undefined) {
                return {
                    isAvailable: false,
                    firstOwerEpicID: this.slots[index]
                }
            }
        }

        return {
            isAvailable: true
        }
    }

    marktSlotAsUsed(slotStartIndex: number, numSlots: number, owner: EpicID) {
        // console.log(">>[marktSlotAsUsed]: owner:", owner, slotStartIndex, numSlots)
        // console.log(">>[marktSlotAsUsed]BEFORE:", this)
        for (let index = slotStartIndex; index < (slotStartIndex + numSlots); index++) {
            this.slots[index] = owner;
        }
        // console.log(">>[marktSlotAsUsed]AFTER:", this)
    }

    freeSlots(slotStartIndex: number, numSlots: number) {

    }
}
export class EpicSlots {
    private rows: RowSlots[] = [];
    private maxNumberOfRows: number = 1;

    calcRowHeight(): number {
        return this.maxNumberOfRows * (InterRowGap + ShapeHeight) - InterRowGap + 2 * ShapeYOffset;
    }

    resetSlots() {
        this.rows = [];
        this.maxNumberOfRows = 1;
    }

    getRowAndEnsureRow(targetRowIndex: number): RowSlots {
        if (targetRowIndex >= this.rows.length) {
            this.rows.push(new RowSlots());
        }

        return this.rows[targetRowIndex];
    }

    nextFreeSlot(slotStartIndex: number, numSlots: number, epicID: EpicID): number {
        let targetRowIndex = 0;
        let didFindEmptySlot = false;

        while (!didFindEmptySlot) {
            let row = this.getRowAndEnsureRow(targetRowIndex);

            if (row.isSlotSpanAvailable(slotStartIndex, numSlots).isAvailable) {
                row.marktSlotAsUsed(slotStartIndex, numSlots, epicID);
                didFindEmptySlot = true;
            } else {
                ++targetRowIndex;
            }
        }

        return targetRowIndex;
    }

    positionSVGNodesByWeek(epic: Epic, svgEpicNode: EpicViewSVGNode, boundsY: number): NodePos {
        const numSlots = EpicSizeToSlotLength(epic.Size);
        const slotIndex = (epic.ExpectedStartPeriod - 1) / 0.5;

        const positionInfo = svgEpicNode.calcPositionInfo(epic, boundsY);
        const rows = this.nextFreeSlot(slotIndex, numSlots, epic.ID);
        const updatedY = positionInfo.rectPostion.y + rows * (ShapeHeight + InterRowGap);

        if (rows > 0) {
            this.maxNumberOfRows = Math.max(rows + 1, this.maxNumberOfRows);
        }

        const rectPos: XYOnly = {
            x: positionInfo.rectPostion.x,
            y: updatedY,
        }

        const textPos: XYOnly = {
            x: positionInfo.textPosition.x,
            y: (updatedY + TextShapeYGap),
        }

        return {
            rectPos, textPos
        }
    }
}