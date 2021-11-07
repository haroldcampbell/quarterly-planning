import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { ColGap } from "../../../../common/nodePositions";
import { SVGContainerID } from "../../../_defs";

/** @jsx gtap.$jsx */

export class NewEpicButton {
    private rCon: any;
    private r: any;
    private l: any;
    private t: any;

    constructor(parentGroupSVGNode: any) {
        this.rCon = gtap.prect(SVGContainerID);
        this.rCon.$class("new-epic-btn-container");

        this.t = gtap.text(SVGContainerID);
        this.t.$class("new-epic-btn-text");
        this.t.$text("+");

        parentGroupSVGNode.appendChild(this.rCon);
        parentGroupSVGNode.appendChild(this.t);
    }

    positionButton(parentX: number, y: number) {
        const x = parentX;

        this.rCon.$draw({ x, y: y + 1 }, { width: 15, height: 15 }, { c3: 10 });

        this.t.$x(x + 3);
        this.t.$y(y + 12);
    }

    addHandler(newEpicCallback: () => void) {
        this.rCon.onclick = () => {
            newEpicCallback();
        }
    }

    static indexToXPosition(index: number): number {
        return index * 100 + ColGap * index;
    }
}