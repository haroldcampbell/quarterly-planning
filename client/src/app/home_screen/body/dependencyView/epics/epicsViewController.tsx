import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { IViewController, IScreenController } from "../../../../../core/lib";
import { OSubjectViewEpicDetails } from "../../../selectedEpicDetails/selectedEpicDetailsViewController";
import { Epic, SVGContainerID, TeamEpics } from "../../../_defs";

/** @jsx gtap.$jsx */

import "./epicsView.css"
import { OSubjectTeamEpicsScrollContainerResized } from "./teamEpicsViewController";

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

    addEpic(lastRowIndex: number, epic: Epic): any {
        const x = this.xOffset
        const y = 12 + lastRowIndex * 64;
        const r = gtap.rect(SVGContainerID)
        r.$class("epic")
        r.$x(x);
        r.$y(y);
        r.$width(40);
        r.$height(shapeHeight);
        r.$rxy(shapeEornerRadius);

        r.onclick = () => { this.onEpicSelected(epic); }

        const t = gtap.text(SVGContainerID);
        t.$class("epic-name")
        t.$xy(x + 10, y + 25);
        t.$text(epic.Name);

        const textWidth = t.$textBoundingBox().width + 20;
        const width = textWidth < 40 ? 40 : textWidth;

        r.$width(width);

        this.xOffset += width + colGap;

        return r;
    }

    onEpicSelected(epic: Epic) {
        lib.Observable.notify(OSubjectViewEpicDetails, {
            source: this,
            value: { epic: epic },
        });
    }
}

export class EpicsViewController extends lib.BaseViewController implements lib.IObserver {
    protected _view: lib.IView = new EpicsView(this);

    private lastRowIndex: number;
    private teamEpics: TeamEpics;

    private maxXBounds = 0;
    private maxRowWidth = 0;/** The max row with across all of the epic view controllers */

    public onEpicCreated?: (epic: Epic, epicSvgNode: any) => void;
    public onCompleted?: (rowsCreated: number, maxXBounds: number) => void;

    constructor(parentController: IViewController | IScreenController, lastRowIndex: number, epics: TeamEpics) {
        super(parentController);

        this.teamEpics = epics;
        this.lastRowIndex = lastRowIndex;
    }

    initView() {
        let epicsView = this.view as EpicsView

        this.teamEpics.Epics.forEach((e) => {
            const svgNode = epicsView.addEpic(this.lastRowIndex, e);
            const xbounds = svgNode.$x() + svgNode.$width() + rowPadding;
            this.maxXBounds = xbounds > this.maxXBounds ? xbounds : this.maxXBounds;
            this.onEpicCreated?.(e, svgNode);
        });

        this.onCompleted?.(1, this.maxXBounds);

        lib.Observable.subscribe(OSubjectTeamEpicsScrollContainerResized, this);

        super.initView();
    }

    onUpdate(subject: string, state: lib.ObserverState): void {
        switch (subject) {
            case OSubjectTeamEpicsScrollContainerResized: {
                const { contentWidth } = state.value;
                this.onTeamEpicsScrollContainerResized(contentWidth);
                break;
            }
        }
    }

    setMaxRowWidth(maxRowWidth: number) {
        this.maxRowWidth = maxRowWidth;
    }

    private updateViewWidth(width: number) {
        (this.view as EpicsView).updateViewWidth(width);
    }

    onTeamEpicsScrollContainerResized(contentWidth: DOMRectReadOnly) {
        if (contentWidth.width > this.maxRowWidth) {
            this.updateViewWidth(contentWidth.width);
        } else {
            this.updateViewWidth(this.maxRowWidth);
        }
    }
}
