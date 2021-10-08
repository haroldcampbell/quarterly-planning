import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { IViewController, IScreenController } from "../../../../../core/lib";
import { Epic, SVGContainerID, TeamEpics } from "../../../_defs";

/** @jsx gtap.$jsx */

import "./epicsView.css"

class EpicsView extends lib.BaseView {
    // 63
    // 42
    private content = <div className='epics-container-wrapper' />;
    private epicNames = <ul className="epics-container"></ul>

    private xOffset: number = 20;
    viewContent() {
        return this.content;
    }

    initView() {
        this.content.appendChild(this.epicNames);
        super.initView();
    }

    addEpic(svgCtx: any, lastRowIndex: number, epic: Epic): any {
        // let elm = <div>{epic.Name}</div>;
        // this.epicNames.appendChild(<li className="epic-name">{elm}</li>);

        const rowPadding = 25;
        const x = this.xOffset
        const y = 12 + lastRowIndex * 64;
        const r = gtap.rect(SVGContainerID)
        r.$class("epic")
        r.$x(x);
        r.$y(y);
        r.$rxy(10);
        r.$width(40);
        r.$height(40);

        const t = gtap.text(SVGContainerID);
        t.$xy(x + 10, y + 25);
        t.$text(epic.Name);

        const textWidth = t.$textBoundingBox().width + 20;
        const width = textWidth < 40 ? 40 : textWidth;
        console.log(`epic name ${epic.Name} size: ${t.$textBoundingBox().width}`)

        r.$width(width);

        this.xOffset += width + rowPadding;

        return r;
    }
}

export class EpicsViewController extends lib.BaseViewController {
    protected _view: lib.IView = new EpicsView(this);

    private svgCtx: any;
    private lastRowIndex: number;
    private teamEpics: TeamEpics;

    public onEpicCreated?: (epic: Epic, epicSvgNode: any) => void;
    public onCompleted?: (rowsCreated: number) => void;

    constructor(parentController: IViewController | IScreenController, svgCtx: any, lastRowIndex: number, epics: TeamEpics) {
        super(parentController);

        this.svgCtx = svgCtx;
        this.teamEpics = epics;
        this.lastRowIndex = lastRowIndex;
    }

    initView() {
        let epicsView = this.view as EpicsView

        this.teamEpics.Epics.forEach((e) => {
            let svgNode = epicsView.addEpic(this.svgCtx, this.lastRowIndex, e);
            this.onEpicCreated?.(e, svgNode);
        });

        this.onCompleted?.(1);

        super.initView();
    }
}
