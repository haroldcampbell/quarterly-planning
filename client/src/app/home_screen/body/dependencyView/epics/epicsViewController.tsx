import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import * as dataStore from "../../../../data/dataStore";

import { IViewController, IScreenController } from "../../../../../core/lib";
import { calcSVGNodesXYForWeek, ColGap, EpicControllerBounds, epicSizeToWidth, MinWeekCellWidth, placeTextWithEllipsis, RowPadding, ShapeYOffset, SVGMaxContextWidth, TextShapeYGap } from "../../../../common/nodePositions";
import { DateMonthPeriod, Epic, EpicID, EpicSizes, EpicViewSVGNode, OSubjectChangedTeamEpicHeightBounds, OSubjectCreateNewEpicRequest, OSubjectDimUnhighlightedEpics, OSubjectHighlightDownstreamEpic, OSubjectHighlightUpstreamEpic, OSubjectUnHighlightAllEpic, OSubjectWillUpdateEpicName, SVGContainerID, TeamEpics, XYOnly } from "../../../_defs";

import { OSubjectEpicSelected } from "../../../selectedEpicDetails/selectedEpicDetailsViewController";
import { OSubjectTeamEpicsScrollContainerResized } from "./teamEpicsViewController";

/** @jsx gtap.$jsx */

import "./epicsView.css"
import { returnStatement } from "@babel/types";


const shapeHeight = 20;
const shapeEornerRadius = 5;
export const interRowGap = 10; /** The horizontal space between epics for the same team */

class NewEpicButton {
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
class EpicsView extends lib.BaseView {
    private epicsContainerSVGNode = gtap.rect(SVGContainerID);
    private epicsDivderSVGNode = gtap.line(SVGContainerID);
    private topPosition!: number;
    private activePeriods!: DateMonthPeriod[];

    setActivePeriods(periods: DateMonthPeriod[]) {
        this.activePeriods = periods;
    }

    viewContent() {
        return undefined;
    }

    initView() {
        this.epicsContainerSVGNode.$class("epics-container");
        this.epicsDivderSVGNode.$class("epics-container-divider");
        this.updateViewWidth(SVGMaxContextWidth);
        super.initView();
    }

    collectChildren(parentGroupSVGNode: any) {
        parentGroupSVGNode.appendChild(this.epicsContainerSVGNode);
        parentGroupSVGNode.appendChild(this.epicsDivderSVGNode);
    }

    updateViewWidth(width: number) {
        this.epicsDivderSVGNode.$x1(0);
        this.epicsDivderSVGNode.$x2(width);
        this.epicsContainerSVGNode.$width(width);
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

    addEpic(parentGroupSVGNode: any, epic: Epic): EpicViewSVGNode {
        const r = gtap.rect(SVGContainerID);
        r.$class("epic")

        const t = gtap.text(SVGContainerID);
        t.$class("epic-name")
        t.$text(epic.Name);

        parentGroupSVGNode.appendChild(r);
        parentGroupSVGNode.appendChild(t);

        const epicViewSVGNode = {
            parentNode: this.epicsContainerSVGNode,
            svgRectNode: r,
            svgTextNode: t
        }

        r.onclick = () => { this.onEpicSelected(epic, epicViewSVGNode); }

        return epicViewSVGNode;
    }

    onEpicSelected(epic: Epic, selectedEpicViewSVGNode: EpicViewSVGNode) {
        lib.Observable.notify(OSubjectEpicSelected, {
            source: this,
            value: {
                epic: epic,
                activePeriods: this.activePeriods,
                selectedEpicViewSVGNode: selectedEpicViewSVGNode,
            },
        });
    }
}

export class EpicsViewController extends lib.BaseViewController implements lib.IObserver {
    protected _view: lib.IView = new EpicsView(this);

    private teamEpics: TeamEpics;
    private bounds!: EpicControllerBounds;
    private maxRowWidth = 0;/** The max row with across all of the epic view controllers */

    public onEpicCreated?: (epic: Epic) => void;
    public onBoundsChanged!: (bounds: EpicControllerBounds) => void;
    public onLayoutNeeded!: (bounds: EpicControllerBounds) => void;

    private epicsViewSVGMap = new Map<EpicID, EpicViewSVGNode>();
    private xOffset!: number;

    private grounSVGNode: any;

    /** Array of the createNewEpic buttons */
    private buttonsArray: any[] = [];

    /**
     * The format of the key is 'cell.x:cell.y'
     * If possibleEpicSlots.get('cell.x:cell.y') has a value then it is used.
    */
    private possibleEpicSlots = new Map<string, EpicID>();
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

    private initBounds(previousControllerBounds?: EpicControllerBounds) {
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

    initView() {
        /**
         * Have to call epicsView.initView() expicitly because I using the the view doesn't have a content node.
         */
        this.epicsView.initView();
        super.initView();
    }

    initController() {
        this.xOffset = RowPadding;
        this.grounSVGNode = gtap.group(SVGContainerID);
        this.grounSVGNode.$class("epics-container-group")
        this.epicsView.collectChildren(this.grounSVGNode);

        this.epicsView.setEpicsContainerSVGNodeY(this.getBoundsY());
        this.teamEpics.Epics?.forEach((epic) => {
            this.createEpic(epic);
            this.layoutEpic(epic);
        });

        this.updateBoundsHeight();
        this.onBoundsChanged(this.bounds!);
        this.createNewEpicButtons();

        lib.Observable.subscribe(OSubjectTeamEpicsScrollContainerResized, this);
        lib.Observable.subscribe(OSubjectWillUpdateEpicName, this);
        lib.Observable.subscribe(OSubjectEpicSelected, this);
        lib.Observable.subscribe(OSubjectHighlightUpstreamEpic, this);
        lib.Observable.subscribe(OSubjectHighlightDownstreamEpic, this);
        lib.Observable.subscribe(OSubjectUnHighlightAllEpic, this);
        lib.Observable.subscribe(OSubjectDimUnhighlightedEpics, this);

        super.initController();
    }

    /**
     *
     * @param previousNode is the node infront of where the new node will be created
     */
    private onCreateNewEpicCallback(teamID: string, weekIndex: number) {
        const newEpic: Epic = {
            ID: `epic-${Date.now()}`,
            TeamID: teamID,
            Name: "New Epic",
            Size: EpicSizes.Small,
            ExpectedStartPeriod: weekIndex + 1, // TODO: Specify the week
        }

        lib.Observable.notify(OSubjectCreateNewEpicRequest, {
            source: this,
            value: {
                epic: newEpic,
                epicController: this,
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
            case OSubjectEpicSelected: {
                const { epic, selectedEpicViewSVGNode } = state.value;
                this.onEpicSelected(epic, selectedEpicViewSVGNode);
                break;
            }
            case OSubjectUnHighlightAllEpic: {
                this.onUnhighlighAllEpics();
                break;
            }
            case OSubjectHighlightUpstreamEpic: {
                const { upstreamEpicID, selectedEpicViewSVGNode } = state.value;
                this.onHighlightUpstreamEpic(upstreamEpicID, selectedEpicViewSVGNode);
                break;
            }
            case OSubjectHighlightDownstreamEpic: {
                const { downstreamEpicID } = state.value;
                this.onHighlightDownstreamEpic(downstreamEpicID);
                break;
            }
            case OSubjectDimUnhighlightedEpics: {
                // const { downstreamEpicID } = state.value;
                this.onDimUnhighlightedEpics();
                break;
            }
        }
    }

    private selectedEpicInfo?: { epic: Epic, selectedEpicViewSVGNode: EpicViewSVGNode };
    private highlightedUpstreamEpicSVGNodes: EpicViewSVGNode[] = [];
    private highlightedDownstreamEpicSVGNodes: EpicViewSVGNode[] = [];
    private dimmedEpicSVGNodes: EpicViewSVGNode[] = [];

    private onEpicSelected(epic: Epic, selectedEpicViewSVGNode: EpicViewSVGNode) {
        if (!this.epicsViewSVGMap.has(epic.ID)) {
            return;
        }

        lib.Observable.notify(OSubjectUnHighlightAllEpic, {
            source: this,
            value: { epic },
        });

        this.selectedEpicInfo = {
            epic,
            selectedEpicViewSVGNode,
        }

        this.highlightSelectedEpic(selectedEpicViewSVGNode);
        this.notifyUpstreamEpicsForHighlight(epic, selectedEpicViewSVGNode)
        this.notifyDownstreamEpicsForHighlight(epic);
        this.notifyDimHighlightedEpics();
    }

    private onUnhighlighAllEpics() {
        if (this.selectedEpicInfo !== undefined) {
            this.selectedEpicInfo.selectedEpicViewSVGNode.parentNode.$removeCSS("selected-epic-container");
            this.selectedEpicInfo.selectedEpicViewSVGNode.svgRectNode.$removeCSS("selected-epic");
            this.selectedEpicInfo.selectedEpicViewSVGNode.svgTextNode.$removeCSS("selected-epic");
        };

        this.highlightedUpstreamEpicSVGNodes.forEach((oldNode) => {
            oldNode.svgRectNode.$removeCSS("upstream-highlighed-epic");
        });

        this.highlightedDownstreamEpicSVGNodes.forEach((oldNode) => {
            oldNode.svgRectNode.$removeCSS("downstream-highlighed-epic");
        });

        this.dimmedEpicSVGNodes.forEach((oldNode) => {
            oldNode.svgRectNode.$removeCSS("dimmed-epic");
            oldNode.svgTextNode.$removeCSS("dimmed-epic");
        });

        this.selectedEpicInfo = undefined;
        this.dimmedEpicSVGNodes = [];
        this.highlightedUpstreamEpicSVGNodes = [];
        this.highlightedDownstreamEpicSVGNodes = [];
    }

    private highlightSelectedEpic(selectedEpicViewSVGNode: EpicViewSVGNode) {
        selectedEpicViewSVGNode.parentNode.$appendCSS("selected-epic-container");
        selectedEpicViewSVGNode.svgRectNode.$appendCSS("selected-epic");
        selectedEpicViewSVGNode.svgTextNode.$appendCSS("selected-epic");
    }

    private notifyUpstreamEpicsForHighlight(epic: Epic, selectedEpicViewSVGNode: EpicViewSVGNode) {
        if (epic.Upstreams === undefined || epic.Upstreams.length == 0) {
            return
        }

        epic.Upstreams.forEach((upstreamEpicID) => {
            lib.Observable.notify(OSubjectHighlightUpstreamEpic, {
                source: this,
                value: { upstreamEpicID, activeEpicID: epic.ID },
            });
        });
    }

    private notifyDownstreamEpicsForHighlight(epic: Epic) {
        const downstreamEpics = dataStore.getDownstreamEpicsByID(epic.ID);

        if (downstreamEpics === undefined) {
            return;
        }

        downstreamEpics.forEach((downstreamEpicID) => {
            lib.Observable.notify(OSubjectHighlightDownstreamEpic, {
                source: this,
                value: { downstreamEpicID, activeEpicID: epic.ID },
            });
        });
    }

    private notifyDimHighlightedEpics() {
        lib.Observable.notify(OSubjectDimUnhighlightedEpics, {
            source: this,
            value: {},
        });
    }

    private onHighlightUpstreamEpic(upstreamEpicID: EpicID, selectedEpicViewSVGNode: EpicViewSVGNode) {
        if (!this.epicsViewSVGMap.has(upstreamEpicID)) {
            return;
        }

        const upstreamEpicSVGNode = this.epicsViewSVGMap.get(upstreamEpicID)!
        upstreamEpicSVGNode.svgRectNode.$appendCSS("upstream-highlighed-epic");
        this.highlightedUpstreamEpicSVGNodes.push(upstreamEpicSVGNode);

        const upstreamEpic = dataStore.getEpicByID(upstreamEpicID)!
        if (upstreamEpic.Upstreams !== undefined) {
            /** Highlight the indirect upstream dependencies */
            upstreamEpic.Upstreams.forEach((nextUpstreamEpicID) => {
                lib.Observable.notify(OSubjectHighlightUpstreamEpic, {
                    source: this,
                    value: { upstreamEpicID: nextUpstreamEpicID, activeEpicID: upstreamEpicID },
                });
            });
        }
    }

    private onHighlightDownstreamEpic(downstreamEpicID: EpicID) {
        if (!this.epicsViewSVGMap.has(downstreamEpicID)) {
            return;
        }

        const downstreamEpicSVGNode = this.epicsViewSVGMap.get(downstreamEpicID)!
        downstreamEpicSVGNode.svgRectNode.$appendCSS("downstream-highlighed-epic");
        this.highlightedDownstreamEpicSVGNodes.push(downstreamEpicSVGNode);

        const downstreamEpics = dataStore.getDownstreamEpicsByID(downstreamEpicID);
        if (downstreamEpics !== undefined) {
            /** Highlight the indirect downstream dependencies */
            downstreamEpics.forEach((nextDownstreamEpicID) => {
                lib.Observable.notify(OSubjectHighlightDownstreamEpic, {
                    source: this,
                    value: { downstreamEpicID: nextDownstreamEpicID, activeEpicID: downstreamEpicID },
                });
            });
        }
    }

    private onDimUnhighlightedEpics() {
        this.teamEpics.Epics.forEach((epic) => {
            if (this.selectedEpicInfo !== undefined && this.selectedEpicInfo.epic == epic) {
                // Ignore the selected epic
                return;
            }

            const epicSVGNode = this.epicsViewSVGMap.get(epic.ID)!

            if (this.highlightedUpstreamEpicSVGNodes.indexOf(epicSVGNode) != -1) {
                // Ignore upstream epics
                return;
            }

            if (this.highlightedDownstreamEpicSVGNodes.indexOf(epicSVGNode) != -1) {
                // Ignore downstream epics
                return;
            }

            epicSVGNode.svgRectNode.$appendCSS("dimmed-epic");
            epicSVGNode.svgTextNode.$appendCSS("dimmed-epic");
            this.dimmedEpicSVGNodes.push(epicSVGNode);
        })
    }

    private getBoundsY(): number {
        return this.bounds.position.y;
    }

    private createNewEpicButtons() {
        const numButtons = 12 // One button for each week.

        for (let index = 0; index < numButtons; index++) {
            const btn = new NewEpicButton(this.grounSVGNode);
            const x = NewEpicButton.indexToXPosition(index)

            btn.positionButton(x, this.getBoundsY());
            btn.addHandler(() => { this.onCreateNewEpicCallback(this.teamEpics.Team.ID, index) });
            this.buttonsArray.push(btn);
        }
    }

    private createEpic(epic: Epic) {
        let epicsView = this.view as EpicsView
        const svgNodes = epicsView.addEpic(this.grounSVGNode, epic);

        this.epicsViewSVGMap.set(epic.ID, svgNodes);
        this.onEpicCreated?.(epic);
    }

    private layoutEpic(epic: Epic) {
        const svgEpicNode = this.epicsViewSVGMap.get(epic.ID);

        if (svgEpicNode === undefined) {
            return;
        }

        this.sizeSVGNodes(epic, svgEpicNode);
        this.positionSVGNodesByWeek(epic, svgEpicNode);
        this.updateBoundsWidth(svgEpicNode);
    }

    private layoutAllEpics() {
        this.xOffset = RowPadding;
        this.possibleEpicSlots = new Map<string, EpicID>();

        console.log(">>[layoutAllEpics]this.teamEpics", this.teamEpics)
        this.teamEpics.Epics?.forEach((e) => {
            this.layoutEpic(e);
        });

        this.updateBoundsHeight();
        this.onLayoutNeeded(this.bounds);
    }

    layoutAllEpicsWithBounds(previousControllerBounds: EpicControllerBounds | undefined) {
        let y = 0;

        if (previousControllerBounds !== undefined) {
            y =
                previousControllerBounds.position.y +
                previousControllerBounds.size.height;
        }

        this.bounds.position.y = y;
        this.epicsView.setEpicsContainerSVGNodeY(this.getBoundsY());
        this.layoutAllEpics();

        this.buttonsArray.forEach((btn, index) => {
            const x = NewEpicButton.indexToXPosition(index)

            btn.positionButton(x, this.getBoundsY());
        });
    }

    private sizeSVGNodes(epic: Epic, svgEpicNode: EpicViewSVGNode) {
        const width = epicSizeToWidth(epic.Size)!

        svgEpicNode.svgRectNode.$height(shapeHeight);
        svgEpicNode.svgRectNode.$rxy(shapeEornerRadius);

        placeTextWithEllipsis(svgEpicNode.svgTextNode, epic.Name, width);

        svgEpicNode.svgRectNode.$width(width);
    }

    private positionSVGNodesByWeek(epic: Epic, svgEpicNode: EpicViewSVGNode) {
        const positionInfo = calcSVGNodesXYForWeek(epic.ExpectedStartPeriod,
            this.xOffset,
            this.getBoundsY(),
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
                this.possibleEpicSlots.set(cellKey, epic.ID); /** Slot is now used */

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

    private updateBoundsWidth(svgNodes: EpicViewSVGNode) {
        const svgRectNode = svgNodes.svgRectNode;
        const xbounds = svgRectNode.$x() + svgRectNode.$width() + RowPadding;
        this.bounds.size.width = Math.max(xbounds, this.bounds.size.width);
    }

    private updateBoundsHeight() {
        const height = this.maxNumberOfRows * (interRowGap + shapeHeight) - interRowGap + 2 * ShapeYOffset;
        this.bounds.size.height = height;
        this.epicsView.setEpicsContainerHeight(height);

        lib.Observable.notify(OSubjectChangedTeamEpicHeightBounds, {
            source: this,
            value: {
                teamID: this.teamEpics.Team.ID,
                height: height,
            },
        });
    }

    private updateViewWidth(width: number) {
        this.epicsView.updateViewWidth(Math.max(SVGMaxContextWidth, width));
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

    setMaxRowWidth(maxRowWidth: number) {
        this.maxRowWidth = maxRowWidth;
    }

    addNewTeamEpic(epic: Epic) {
        this.createEpic(epic)
    }
}