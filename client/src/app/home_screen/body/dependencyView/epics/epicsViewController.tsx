import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { IViewController, IScreenController } from "../../../../../core/lib";
import { Epic, SVGContainerID, TeamEpics } from "../../../_defs";

/** @jsx gtap.$jsx */

import "./epicsView.css"

const colGap = 25;
const shapeEornerRadius = 10;
const shapeHeight = 40;
const rowPadding = 20; /** The space at the start and end of the row */
class EpicsView extends lib.BaseView {
    private content = <div className='epics-container-wrapper' />;
    private epicNames = <ul className="epics-container"></ul>

    private xOffset: number = rowPadding;
    viewContent() {
        return this.content;
    }

    initView() {
        this.content.appendChild(this.epicNames);
        super.initView();
    }

    updateViewWidth(width: number) {
        this.content.style.width = `${width}px`;
    }

    addEpic(svgCtx: any, lastRowIndex: number, epic: Epic): any {
        // let elm = <div>{epic.Name}</div>;
        // this.epicNames.appendChild(<li className="epic-name">{elm}</li>);

        const x = this.xOffset
        const y = 12 + lastRowIndex * 64;
        const r = gtap.rect(SVGContainerID)
        r.$class("epic")
        r.$x(x);
        r.$y(y);
        r.$width(40);
        r.$height(shapeHeight);
        r.$rxy(shapeEornerRadius);

        const t = gtap.text(SVGContainerID);
        t.$xy(x + 10, y + 25);
        t.$text(epic.Name);

        const textWidth = t.$textBoundingBox().width + 20;
        const width = textWidth < 40 ? 40 : textWidth;
        console.log(`epic name ${epic.Name} size: ${t.$textBoundingBox().width}`)

        r.$width(width);

        this.xOffset += width + colGap;

        return r;
    }
}

export class EpicsViewController extends lib.BaseViewController {
    protected _view: lib.IView = new EpicsView(this);

    private svgCtx: any;
    private lastRowIndex: number;
    private teamEpics: TeamEpics;

    public onEpicCreated?: (epic: Epic, epicSvgNode: any) => void;
    public onCompleted?: (rowsCreated: number, maxXBounds: number) => void;

    constructor(parentController: IViewController | IScreenController, svgCtx: any, lastRowIndex: number, epics: TeamEpics) {
        super(parentController);

        this.svgCtx = svgCtx;
        this.teamEpics = epics;
        this.lastRowIndex = lastRowIndex;
    }

    initView() {
        let epicsView = this.view as EpicsView
        let maxXBounds = 0;

        this.teamEpics.Epics.forEach((e) => {
            const svgNode = epicsView.addEpic(this.svgCtx, this.lastRowIndex, e);
            const xbounds = svgNode.$x() + svgNode.$width() + rowPadding;
            maxXBounds = xbounds > maxXBounds ? xbounds : maxXBounds;
            this.onEpicCreated?.(e, svgNode);
        });

        this.onCompleted?.(1, maxXBounds);

        super.initView();
    }

    updateViewWidth(maxRowWidth: number) {
        (this.view as EpicsView).updateViewWidth(maxRowWidth);
    }
}
