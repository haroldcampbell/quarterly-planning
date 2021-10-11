import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { IViewController, IScreenController } from "../../../../../core/lib";
import { OSubjectViewEpicDetails } from "../../../selectedEpicDetails/selectedEpicDetailsViewController";
import { Epic, OSubjectCreateNewEpic, OSubjectWillUpdateEpicName, SVGContainerID, TeamEpics } from "../../../_defs";

/** @jsx gtap.$jsx */

import "./epicsView.css"
import { OSubjectTeamEpicsScrollContainerResized } from "./teamEpicsViewController";

const colGap = 25;
const shapeHeight = 20;
const rowPadding = 20; /** The space at the start and end of the row */
const shapeEornerRadius = 5;

export const ShapeYOffset = 10;

type EpicViewSVGNode = {
    svgRectNode: any;
    svgTextNode: any;
    btn?: NewEpicButton;
}

class NewEpicButton {
    private rCon: any;
    private r: any;
    private l: any;
    private t: any;

    constructor() {
        this.rCon = gtap.rect(SVGContainerID);
        this.rCon.$class("new-epic-btn-container");

        this.r = gtap.rect(SVGContainerID);
        this.r.$class("new-epic-btn-head");

        this.l = gtap.vLine(SVGContainerID);
        this.l.$class("new-epic-btn-line");

        this.t = gtap.text(SVGContainerID);
        this.t.$class("new-epic-btn-text")
        this.t.$text("+");
    }

    positionButton(svgNodesY: number, lastSVGNodes?: EpicViewSVGNode) {
        const x = lastSVGNodes?.svgRectNode.$x() + lastSVGNodes?.svgRectNode.$width();

        this.rCon.$width(15);
        this.rCon.$height(30);
        this.rCon.$x(x + 5);
        this.rCon.$y(svgNodesY - 2);

        this.r.$width(15);
        this.r.$height(10);
        this.r.$x(x + 5);
        this.r.$y(svgNodesY - 2);

        this.l.$x(x + colGap / 2 - .5);
        this.l.$y(svgNodesY + 9);
        this.l.$height(20);

        this.t.$x(x + 9);
        this.t.$y(svgNodesY + 7);
    }

    addHandler(newEpicCallback: () => void) {
        this.rCon.onclick = () => {
            newEpicCallback();
        }
    }
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

    addEpic(epic: Epic): EpicViewSVGNode {
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

    constructor(parentController: IViewController | IScreenController, lastRowIndex: number, teamEpics: TeamEpics) {
        super(parentController);

        this.teamEpics = teamEpics;
        this.lastRowIndex = lastRowIndex;
    }

    initController() {
        this.xOffset = rowPadding;
        this.teamEpics.Epics?.forEach((epic) => {
            this.createEpic(epic);
            this.layoutEpic(epic);

        });

        this.onCompleted?.(1, this.maxXBounds);

        lib.Observable.subscribe(OSubjectTeamEpicsScrollContainerResized, this);
        lib.Observable.subscribe(OSubjectWillUpdateEpicName, this);

        super.initController();
    }

    createEpic(epic: Epic) {
        let epicsView = this.view as EpicsView
        const svgNodes = epicsView.addEpic(epic);

        const btn = new NewEpicButton();
        btn.addHandler(() => { this.onCreateNewEpicCallback(epic.TeamID, epic) });

        svgNodes.btn = btn;

        this.epicsViewSVGMap.set(epic.ID, svgNodes);
        this.onEpicCreated?.(epic);
    }

    createEpicAtIndex(epic: Epic) {
        this.createEpic(epic)

        this.layoutAllEpics();
    }

    layoutEpic(epic: Epic) {
        const svgNodes = this.epicsViewSVGMap.get(epic.ID);

        if (svgNodes === undefined) {
            return;
        }

        this.sizeSVGNodes(svgNodes);
        this.updateRowBounds(svgNodes);

        svgNodes.btn!.positionButton(this.getSVGNodeY(), svgNodes);
    }

    layoutAllEpics() {
        this.xOffset = rowPadding;
        this.teamEpics.Epics?.forEach((e) => {
            this.layoutEpic(e);
        });

        this.onLayoutNeeded?.(this.maxXBounds, this.teamEpics.Team.ID);
    }

    /**
     *
     * @param previousNode is the node infront of where the new node will be created
     */
    onCreateNewEpicCallback(teamID: string, previousEpic?: Epic) {
        const newEpic: Epic = {
            ID: `epic-${Date.now()}`,
            TeamID: teamID,
            Name: "New Epic",
        }

        const index = previousEpic === undefined ? 0 : this.teamEpics.Epics?.indexOf(previousEpic);

        lib.Observable.notify(OSubjectCreateNewEpic, {
            source: this,
            value: {
                epic: newEpic,
                epicController: this,
                insertionIndex: index,
            },
        });
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

    getSVGNodeY(): number {
        return 2 + this.lastRowIndex * 64;
    }

    sizeSVGNodes(svgNodes: EpicViewSVGNode) {
        const x = this.xOffset
        const y = this.getSVGNodeY();

        svgNodes.svgRectNode.$x(x);
        svgNodes.svgRectNode.$y(y + ShapeYOffset);

        svgNodes.svgRectNode.$width(40);
        svgNodes.svgRectNode.$height(shapeHeight);
        svgNodes.svgRectNode.$rxy(shapeEornerRadius);

        svgNodes.svgTextNode.$xy(x + 10, y + 23);

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

        this.layoutAllEpics();
    }

    getEpicSVGRectNode(epicID: string): any {
        let svgNodes = this.epicsViewSVGMap.get(epicID);

        return svgNodes?.svgRectNode
    }
}
