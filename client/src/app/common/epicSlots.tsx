import { Epic, EpicID, EpicViewSVGNode, InterRowGap, ShapeHeight } from "../home_screen/_defs";
import { CalcEpicWeekPosition, ShapeYOffset, TextShapeYGap } from "./nodePositions";

export class EpicSlots {
    /**
     * The format of the key is 'cell.x:cell.y'
     * If possibleEpicSlots.get('cell.x:cell.y') has a value then it is used.
    */
    private possibleEpicSlots = new Map<string, EpicID>();
    private maxNumberOfRows: number = 1;

    calcRowHeight(): number {
        return this.maxNumberOfRows * (InterRowGap + ShapeHeight) - InterRowGap + 2 * ShapeYOffset;
    }

    resetSlots() {
        this.possibleEpicSlots = new Map<string, EpicID>();
    }

    positionSVGNodesByWeek(epic: Epic, svgEpicNode: EpicViewSVGNode, boundsY: number) {
        const positionInfo = svgEpicNode.calcPositionInfo(epic, boundsY);

        let rows = 1;
        let didFindEmptySlot = false;
        let updatedY = positionInfo.rectPostion.y;

        let cellKey = `${positionInfo.rectPostion.x}:${positionInfo.rectPostion.y}`;

        do {
            if (this.possibleEpicSlots.get(cellKey) === undefined) {
                this.possibleEpicSlots.set(cellKey, epic.ID); /** Slot is now used */

                didFindEmptySlot = true;
            } else {
                updatedY += (ShapeHeight + InterRowGap);
                cellKey = `${positionInfo.rectPostion.x}:${updatedY}`;
                rows++;
            }
        } while (!didFindEmptySlot && rows < 500); // 500 is just a sanity check TODO: Find a better way to do this as it currently limits the number of epic rows per team

        if (rows > 0) {
            this.maxNumberOfRows = Math.max(rows, this.maxNumberOfRows);
        }

        svgEpicNode.svgRectNode.$y(updatedY);
        svgEpicNode.svgTextNode.$y(updatedY + TextShapeYGap);

        svgEpicNode.svgRectNode.$x(positionInfo.rectPostion.x)
        svgEpicNode.svgTextNode.$x(positionInfo.textPosition.x)
    }
}