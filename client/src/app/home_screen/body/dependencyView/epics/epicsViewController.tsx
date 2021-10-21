import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { IViewController, IScreenController } from "../../../../../core/lib";
import { calcSVGNodesXYForWeek, EpicControllerBounds, epicSizeToWidth, MinWeekCellWidth, placeTextWithEllipsis, RowPadding, ShapeYOffset, SVGMaxContextWidth, TextShapeYGap } from "../../../../common/nodePositions";
import { OSubjectViewEpicDetails } from "../../../selectedEpicDetails/selectedEpicDetailsViewController";
import { DateMonthPeriod, Epic, EpicSizes, OSubjectCreateNewEpic, OSubjectWillUpdateEpicName, SVGContainerID, TeamEpics, XYOnly } from "../../../_defs";

/** @jsx gtap.$jsx */

import "./epicsView.css"
import { OSubjectTeamEpicsScrollContainerResized } from "./teamEpicsViewController";
// import { OSubjectTeamEpicsScrollContainerResized } from "./teamEpicsViewController";

const shapeHeight = 20;
const shapeEornerRadius = 5;
export const interRowGap = 10; /** The horizontal space between epics for the same team */

type EpicViewSVGNode = {
    svgRectNode: any;
    svgTextNode: any;
    parentNode: any;
    btn?: NewEpicButton;
}

class NewEpicButton {
    private rCon: any;
    private r: any;
    private l: any;
    private t: any;

    constructor() {
        // this.rCon = gtap.rect(SVGContainerID);
        // this.rCon.$class("new-epic-btn-container");

        // this.r = gtap.rect(SVGContainerID);
        // this.r.$class("new-epic-btn-head");

        // this.l = gtap.vLine(SVGContainerID);
        // this.l.$class("new-epic-btn-line");

        // this.t = gtap.text(SVGContainerID);
        // this.t.$class("new-epic-btn-text")
        // this.t.$text("+");
    }

    positionButton(svgNodesY: number, lastSVGNodes?: EpicViewSVGNode) {
        // const x = lastSVGNodes?.svgRectNode.$x() + lastSVGNodes?.svgRectNode.$width();

        // this.rCon.$width(15);
        // this.rCon.$height(30);
        // this.rCon.$x(x + 5);
        // this.rCon.$y(svgNodesY - 2);

        // this.r.$width(15);
        // this.r.$height(10);
        // this.r.$x(x + 5);
        // this.r.$y(svgNodesY - 2);

        // this.l.$x(x + colGap / 2 - .5);
        // this.l.$y(svgNodesY + 9);
        // this.l.$height(20);

        // this.t.$x(x + 9);
        // this.t.$y(svgNodesY + 7);
    }

    addHandler(newEpicCallback: () => void) {
        // this.rCon.onclick = () => {
        //     newEpicCallback();
        // }
    }
}
class EpicsView extends lib.BaseView {
    private epicsContainerSVGNode = gtap.rect(SVGContainerID);
    private epicsDivderSVGNode = gtap.line(SVGContainerID);
    private topPosition!: number;
    private activePeriods!: DateMonthPeriod[];

    setActivePeriods(periods: DateMonthPeriod[]) {
        this.activePeriods = periods;
    }

    viewContent() {
        return undefined;//this.epicsContainerSVGNode;
    }

    initView() {
        this.epicsContainerSVGNode.$class("epics-container");
        this.epicsDivderSVGNode.$class("epics-container-divider");
        this.updateViewWidth(SVGMaxContextWidth);
        super.initView();
    }

    updateViewWidth(width: number) {
        // MinWeekCellWidth
        // this.epicsContainerSVGNode.$width(width);
        this.epicsContainerSVGNode.$width(width);
        this.epicsDivderSVGNode.$x1(0);
        this.epicsDivderSVGNode.$x2(width);
        // this.epicsDivderSVGNode.$x2(width);
    }

    setEpicsContainerSVGNodeY(y: number) {
        this.topPosition = y;
        this.epicsContainerSVGNode.$y(this.topPosition);
    }

    setEpicsContainerHeight(height: number) {
        const bottomPosition = this.topPosition + height;

        this.epicsContainerSVGNode.$height(height);
        this.epicsDivderSVGNode.$y1(bottomPosition);
        this.epicsDivderSVGNode.$y2(bottomPosition);
    }

    addEpic(epic: Epic): EpicViewSVGNode {
        const r = gtap.rect(SVGContainerID);
        r.$class("epic")

        r.onclick = () => { this.onEpicSelected(epic); }

        const t = gtap.text(SVGContainerID);
        t.$class("epic-name")
        t.$text(epic.Name);

        return {
            parentNode: this.epicsContainerSVGNode,
            svgRectNode: r,
            svgTextNode: t
        }
    }

    onEpicSelected(epic: Epic) {
        lib.Observable.notify(OSubjectViewEpicDetails, {
            source: this,
            value: { epic: epic, activePeriods: this.activePeriods },
        });
    }
}

export class EpicsViewController extends lib.BaseViewController implements lib.IObserver {
    protected _view: lib.IView = new EpicsView(this);

    private teamEpics: TeamEpics;
    private bounds!: EpicControllerBounds;
    private maxRowWidth = 0;/** The max row with across all of the epic view controllers */

    public onEpicCreated?: (epic: Epic) => void;
    public onCompleted?: (bounds: EpicControllerBounds) => void;
    public onLayoutNeeded?: (maxXBounds: number, didUpdateTeamId?: string) => void;

    private epicsViewSVGMap = new Map<string, EpicViewSVGNode>();
    private xOffset!: number;

    /**
     * The format of the key is 'cell.x:cell.y'
     * When possibleEpicSlots.get('cell.x:cell.y') is  true it indicates that the slot is used.
    */
    private possibleEpicSlots = new Map<string, boolean>();
    private maxNumberOfRows: number = 1;

    private get epicsView(): EpicsView {
        return (this.view as unknown) as EpicsView
    }

    setActivePeriods(periods: DateMonthPeriod[]) {
        this.epicsView.setActivePeriods(periods);
    }


    constructor(parentController: IViewController | IScreenController, teamEpics: TeamEpics, previousControllerBounds?: EpicControllerBounds) {
        super(parentController);

        this.teamEpics = teamEpics;

        this.initBounds(previousControllerBounds);
    }

    initBounds(previousControllerBounds?: EpicControllerBounds) {
        this.bounds = {
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 0,
                height: 0
            }
        };

        if (previousControllerBounds !== undefined) {
            this.bounds.position.y =
                previousControllerBounds.position.y +
                previousControllerBounds.size.height;
        }
    }

    initController() {
        this.xOffset = RowPadding;

        this.epicsView.setEpicsContainerSVGNodeY(this.getSVGNodeY());

        this.teamEpics.Epics?.forEach((epic) => {
            this.createEpic(epic);
            this.layoutEpic(epic);
        });

        const height = this.maxNumberOfRows * (interRowGap + shapeHeight) - interRowGap + 2 * ShapeYOffset;
        this.bounds.size.height = height;

        this.epicsView.setEpicsContainerHeight(height);
        this.onCompleted?.(this.bounds!);

        lib.Observable.subscribe(OSubjectTeamEpicsScrollContainerResized, this);
        lib.Observable.subscribe(OSubjectWillUpdateEpicName, this);

        super.initController();
    }

    initView() {
        /**
         * Have to call epicsView.initView() expicitly because I using the the view doesn't have a content node.
         */
        this.epicsView.initView();
        super.initView();
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
        const svgEpicNode = this.epicsViewSVGMap.get(epic.ID);

        if (svgEpicNode === undefined) {
            return;
        }

        this.sizeSVGNodes(epic, svgEpicNode);
        this.positionSVGNodesByWeek(epic, svgEpicNode);
        this.updateRowBounds(svgEpicNode);

        svgEpicNode.btn!.positionButton(this.getSVGNodeY(), svgEpicNode);
    }

    layoutAllEpics() {
        this.xOffset = RowPadding;
        this.teamEpics.Epics?.forEach((e) => {
            this.layoutEpic(e);
        });

        this.onLayoutNeeded?.(this.bounds.size.width, this.teamEpics.Team.ID);
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
            Size: EpicSizes.Small,
            ExpectedStartPeriod: 1, // TODO: Specify the week
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
        return this.bounds.position.y;
    }

    sizeSVGNodes(epic: Epic, svgEpicNode: EpicViewSVGNode) {
        const width = epicSizeToWidth(epic.Size)!

        svgEpicNode.svgRectNode.$height(shapeHeight);
        svgEpicNode.svgRectNode.$rxy(shapeEornerRadius);

        placeTextWithEllipsis(svgEpicNode.svgTextNode, epic.Name, width);

        svgEpicNode.svgRectNode.$width(width);
    }

    positionSVGNodesByWeek(epic: Epic, svgEpicNode: EpicViewSVGNode) {
        const positionInfo = calcSVGNodesXYForWeek(epic.ExpectedStartPeriod,
            this.xOffset,
            this.getSVGNodeY(),
            epicSizeToWidth(epic.Size)!,
            svgEpicNode.svgTextNode.$textBoundingBox().width);

        svgEpicNode.svgRectNode.$y(positionInfo.rectPostion.y);
        svgEpicNode.svgTextNode.$y(positionInfo.textPosition.y);

        let cellKey = `${positionInfo.rectPostion.x}:${positionInfo.rectPostion.y}`;

        let didFindEmptySlot = false;
        let updatedY = positionInfo.rectPostion.y;
        let rows = 1;
        do {
            if (this.possibleEpicSlots.get(cellKey) === undefined) {
                this.possibleEpicSlots.set(cellKey, true); /** Slot is now used */

                didFindEmptySlot = true;
            } else {
                updatedY += (shapeHeight + interRowGap);
                cellKey = `${positionInfo.rectPostion.x}:${updatedY}`;
                rows++;
            }
        } while (!didFindEmptySlot && rows < 10); // 10 is just a sanity check

        if (rows > 0) {
            this.maxNumberOfRows = Math.max(rows, this.maxNumberOfRows);
        }

        svgEpicNode.svgRectNode.$y(updatedY);
        svgEpicNode.svgTextNode.$y(updatedY + TextShapeYGap);

        svgEpicNode.svgRectNode.$x(positionInfo.rectPostion.x)
        svgEpicNode.svgTextNode.$x(positionInfo.textPosition.x)
    }

    updateRowBounds(svgNodes: EpicViewSVGNode) {
        const svgRectNode = svgNodes.svgRectNode;
        const xbounds = svgRectNode.$x() + svgRectNode.$width() + RowPadding;
        this.bounds.size.width = Math.max(xbounds, this.bounds.size.width);
    }

    setMaxRowWidth(maxRowWidth: number) {
        this.maxRowWidth = maxRowWidth;
    }

    private updateViewWidth(width: number) {
        console.log(">>epicsViewController: width", width)
        this.epicsView.updateViewWidth(Math.max(SVGMaxContextWidth, width));
    }

    onTeamEpicsScrollContainerResized(contentWidth: DOMRectReadOnly) {
        console.log(">>this.maxRowWidth", this.maxRowWidth)
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

