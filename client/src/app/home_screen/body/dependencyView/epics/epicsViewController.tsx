import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { IViewController, IScreenController } from "../../../../../core/lib";
import { OSubjectViewEpicDetails } from "../../../selectedEpicDetails/selectedEpicDetailsViewController";
import { Epic, OSubjectWillUpdateEpicName, SVGContainerID, TeamEpics } from "../../../_defs";

/** @jsx gtap.$jsx */

import "./epicsView.css"
import { OSubjectTeamEpicsScrollContainerResized } from "./teamEpicsViewController";

const colGap = 25;
const shapeEornerRadius = 10;
const shapeHeight = 40;
const rowPadding = 20; /** The space at the start and end of the row */

type EpicViewSVGNode = {
    svgRectNode: any;
    svgTextNode: any;
}
class EpicsView extends lib.BaseView {
    private epicNames = <ul className="epics-container"></ul>
    private content = <div className='epics-container-wrapper' >{this.epicNames}</div>;

    viewContent() {
        return this.content;
    }

    updateViewWidth(width: number) {
        this.content.style.width = `${width}px`;
    }

    addEpic(lastRowIndex: number, epic: Epic): EpicViewSVGNode {
        const r = gtap.rect(SVGContainerID);
        r.$class("epic")

        r.onclick = () => { this.onEpicSelected(epic); }

        const t = gtap.text(SVGContainerID);
        t.$class("epic-name")
        t.$text(epic.Name);

        return {
            svgRectNode: r,
            svgTextNode: t
        }
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

    public onEpicCreated?: (epic: Epic) => void;
    public onCompleted?: (rowsCreated: number, maxXBounds: number) => void;
    public onLayoutNeeded?: (maxXBounds: number, didUpdateTeamId?: string) => void;

    private epicsViewSVGMap = new Map<string, EpicViewSVGNode>();
    private xOffset!: number;

    constructor(parentController: IViewController | IScreenController, lastRowIndex: number, epics: TeamEpics) {
        super(parentController);

        this.teamEpics = epics;
        this.lastRowIndex = lastRowIndex;
    }

    initController() {
        let epicsView = this.view as EpicsView

        this.xOffset = rowPadding;
        this.teamEpics.Epics?.forEach((e) => {
            const svgNodes = epicsView.addEpic(this.lastRowIndex, e);

            this.epicsViewSVGMap.set(e.ID, svgNodes);
            this.sizeSVGNodes(svgNodes);
            this.updateRowBounds(svgNodes);
            this.onEpicCreated?.(e);
        });

        this.onCompleted?.(1, this.maxXBounds);

        lib.Observable.subscribe(OSubjectTeamEpicsScrollContainerResized, this);
        lib.Observable.subscribe(OSubjectWillUpdateEpicName, this);

        super.initController();
    }

    onUpdate(subject: string, state: lib.ObserverState): void {
        switch (subject) {
            case OSubjectTeamEpicsScrollContainerResized: {
                const { contentWidth } = state.value;
                this.onTeamEpicsScrollContainerResized(contentWidth);
                break;
            }
            case OSubjectWillUpdateEpicName: {
                const { epic } = state.value;
                this.onEpicNameUpdated(epic);
                break;
            }
        }
    }

    sizeSVGNodes(svgNodes: EpicViewSVGNode) {
        const x = this.xOffset
        const y = 12 + this.lastRowIndex * 64;

        svgNodes.svgRectNode.$x(x);
        svgNodes.svgRectNode.$y(y);

        svgNodes.svgRectNode.$width(40);
        svgNodes.svgRectNode.$height(shapeHeight);
        svgNodes.svgRectNode.$rxy(shapeEornerRadius);

        svgNodes.svgTextNode.$xy(x + 10, y + 25);

        const textWidth = svgNodes.svgTextNode.$textBoundingBox().width + 20;
        const width = textWidth < 40 ? 40 : textWidth;

        svgNodes.svgRectNode.$width(width);

        this.xOffset += width + colGap;
    }

    updateRowBounds(svgNodes: EpicViewSVGNode) {
        const svgRectNode = svgNodes.svgRectNode;
        const xbounds = svgRectNode.$x() + svgRectNode.$width() + rowPadding;
        this.maxXBounds = xbounds > this.maxXBounds ? xbounds : this.maxXBounds;
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

    onEpicNameUpdated(epic: Epic) {
        if (this.teamEpics.Team.ID != epic.TeamID) {
            return;
        }

        let svgNodes = this.epicsViewSVGMap.get(epic.ID);

        svgNodes?.svgTextNode.$text(epic.Name);

        this.xOffset = rowPadding;
        this.teamEpics.Epics?.forEach((e) => {
            svgNodes = this.epicsViewSVGMap.get(e.ID);
            if (svgNodes === undefined) {
                return;
            }

            this.sizeSVGNodes(svgNodes);
            this.updateRowBounds(svgNodes);
        });

        this.onLayoutNeeded?.(this.maxXBounds, epic.TeamID);
    }

    getEpicSVGRectNode(epicID: string): any {
        let svgNodes = this.epicsViewSVGMap.get(epicID);

        return svgNodes?.svgRectNode
    }
}
