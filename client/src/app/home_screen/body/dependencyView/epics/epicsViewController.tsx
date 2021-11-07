import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import * as dataStore from "../../../../data/dataStore";

import { IViewController, IScreenController } from "../../../../../core/lib";
import { EpicControllerBounds, EpicSizes, RowPadding, SVGMaxContextWidth } from "../../../../common/nodePositions";
import { DateMonthPeriod, Epic, EpicID, EpicViewSVGNode, OSubjectChangedTeamEpicHeightBounds, OSubjectCreateNewEpicRequest, OSubjectDimUnhighlightedEpics, OSubjectHighlightDownstreamEpic, OSubjectHighlightUpstreamEpic, OSubjectUnHighlightAllEpic, OSubjectWillUpdateEpicName, SVGContainerID, TeamEpics, TeamID } from "../../../_defs";

import { OSubjectDidDeleteEpic, OSubjectDidDeleteTeam, OSubjectEpicSelected } from "../../../selectedEpicDetails/selectedEpicDetailsViewController";
import { OSubjectRedrawDependencyConnections, OSubjectTeamEpicsScrollContainerResized } from "./teamEpicsViewController";

/** @jsx gtap.$jsx */

import "./epicsView.css"
import { NewEpicButton } from "./newEpicButton";
import { EpicSlots } from "../../../../common/epicSlots";


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

        const epicViewSVGNode = new EpicViewSVGNode(this.epicsContainerSVGNode, r, t);

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

    teamEpics: TeamEpics;
    private bounds!: EpicControllerBounds;
    private maxRowWidth = 0;/** The max row with across all of the epic view controllers */

    public onEpicCreated?: (epic: Epic) => void;
    public onBoundsChanged!: (bounds: EpicControllerBounds) => void;
    public onLayoutNeeded!: (bounds: EpicControllerBounds) => void;

    private epicsViewSVGMap = new Map<EpicID, EpicViewSVGNode>();
    private xOffset!: number;

    private groupContainerSVGNode: any;

    /** Array of the createNewEpic buttons */
    private buttonsArray: any[] = [];

    private selectedEpicInfo?: { epic: Epic, selectedEpicViewSVGNode: EpicViewSVGNode };
    private highlightedUpstreamEpicSVGNodes: EpicViewSVGNode[] = [];
    private highlightedDownstreamEpicSVGNodes: EpicViewSVGNode[] = [];
    private dimmedEpicSVGNodes: EpicViewSVGNode[] = [];
    private epicSlots = new EpicSlots();

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
        this.groupContainerSVGNode = gtap.group(SVGContainerID);
        this.groupContainerSVGNode.$class("epics-container-group")
        this.epicsView.collectChildren(this.groupContainerSVGNode);

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
        lib.Observable.subscribe(OSubjectDidDeleteEpic, this);
        lib.Observable.subscribe(OSubjectRedrawDependencyConnections, this);
        lib.Observable.subscribe(OSubjectDidDeleteTeam, this);

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
            case OSubjectDidDeleteEpic: {
                const { epic } = state.value;
                this.removeDeletedEpic(epic);
                break;
            }
            case OSubjectRedrawDependencyConnections: {
                const { downstreamEpic } = state.value;

                if (!this.epicsViewSVGMap.has(downstreamEpic.ID)) {
                    return;
                }

                const selectedEpicViewSVGNode = this.epicsViewSVGMap.get(downstreamEpic.ID)!;
                this.onEpicSelected(downstreamEpic, selectedEpicViewSVGNode);
                break;
            }
            case OSubjectDidDeleteTeam: {
                const { teamID } = state.value;
                this.onDeleteController(teamID);

                break;
            }
        }
    }

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

    private removeDeletedEpic(deletedEpic: Epic) {
        if (!this.epicsViewSVGMap.has(deletedEpic.ID)) {
            return;
        }

        lib.Observable.notify(OSubjectUnHighlightAllEpic, {
            source: this,
            value: { epic: deletedEpic },
        });

        const epicViewSVGNode = this.epicsViewSVGMap.get(deletedEpic.ID)!;

        epicViewSVGNode.svgTextNode.remove();
        epicViewSVGNode.svgRectNode.remove();
    }

    private onDeleteController(teamID: TeamID) {
        if (this.teamEpics.Team.ID == teamID) {
            this.groupContainerSVGNode.remove();
            return;
        }

        this.onUnhighlighAllEpics();
    }

    private highlightSelectedEpic(selectedEpicViewSVGNode: EpicViewSVGNode) {
        selectedEpicViewSVGNode.parentNode.$appendCSS("selected-epic-container");
        selectedEpicViewSVGNode.svgRectNode.$appendCSS("selected-epic");
        selectedEpicViewSVGNode.svgTextNode.$appendCSS("selected-epic");
    }

    private notifyUpstreamEpicsForHighlight(epic: Epic, selectedEpicViewSVGNode: EpicViewSVGNode) {
        dataStore.GetUpstreamConnections(epic.ID).forEach((connection) => {
            lib.Observable.notify(OSubjectHighlightUpstreamEpic, {
                source: this,
                value: { upstreamEpicID: connection.UpstreamEpicID, activeEpicID: epic.ID },
            });
        })
    }

    private notifyDownstreamEpicsForHighlight(epic: Epic) {
        dataStore.GetDownstreamConnections(epic.ID).forEach((connection) => {
            lib.Observable.notify(OSubjectHighlightDownstreamEpic, {
                source: this,
                value: { downstreamEpicID: connection.DownstreamEpicID, activeEpicID: epic.ID },
            });
        })
    }

    private notifyDimHighlightedEpics() {
        lib.Observable.notify(OSubjectDimUnhighlightedEpics, {
            source: this,
            value: { selectedEpic: this.selectedEpicInfo!.epic },
        });
    }

    private onHighlightUpstreamEpic(upstreamEpicID: EpicID, selectedEpicViewSVGNode: EpicViewSVGNode) {
        if (!this.epicsViewSVGMap.has(upstreamEpicID)) {
            return;
        }

        const upstreamEpicSVGNode = this.epicsViewSVGMap.get(upstreamEpicID)!
        upstreamEpicSVGNode.svgRectNode.$appendCSS("upstream-highlighed-epic");
        this.highlightedUpstreamEpicSVGNodes.push(upstreamEpicSVGNode);

        dataStore.GetUpstreamConnections(upstreamEpicID).forEach((connection) => {
            lib.Observable.notify(OSubjectHighlightUpstreamEpic, {
                source: this,
                value: { upstreamEpicID: connection.UpstreamEpicID, activeEpicID: upstreamEpicID },
            });
        })
    }

    private onHighlightDownstreamEpic(downstreamEpicID: EpicID) {
        if (!this.epicsViewSVGMap.has(downstreamEpicID)) {
            return;
        }
        const downstreamEpicSVGNode = this.epicsViewSVGMap.get(downstreamEpicID)!
        downstreamEpicSVGNode.svgRectNode.$appendCSS("downstream-highlighed-epic");
        this.highlightedDownstreamEpicSVGNodes.push(downstreamEpicSVGNode);

        dataStore.GetDownstreamConnections(downstreamEpicID).forEach((connection) => {
            lib.Observable.notify(OSubjectHighlightDownstreamEpic, {
                source: this,
                value: { downstreamEpicID: connection.DownstreamEpicID, activeEpicID: downstreamEpicID },
            });
        })
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

    private onTeamEpicsScrollContainerResized(contentWidth: DOMRectReadOnly) {
        if (contentWidth.width > this.maxRowWidth) {
            this.updateViewWidth(contentWidth.width);
        } else {
            this.updateViewWidth(this.maxRowWidth);
        }
    }

    private onEpicNameUpdated(epic: Epic) {
        if (this.teamEpics.Team.ID != epic.TeamID) {
            return;
        }

        let svgNodes = this.epicsViewSVGMap.get(epic.ID);

        svgNodes?.svgTextNode.$text(epic.Name);

        this.layoutAllEpics();
    }

    private getBoundsY(): number {
        return this.bounds.position.y;
    }

    private createNewEpicButtons() {
        const numButtons = 12 // One button for each week.

        for (let index = 0; index < numButtons; index++) {
            const btn = new NewEpicButton(this.groupContainerSVGNode);
            const x = NewEpicButton.indexToXPosition(index)

            btn.positionButton(x, this.getBoundsY());
            btn.addHandler(() => { this.onCreateNewEpicCallback(this.teamEpics.Team.ID, index) });
            this.buttonsArray.push(btn);
        }
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

    private createEpic(epic: Epic) {
        let epicsView = this.view as EpicsView
        const svgNodes = epicsView.addEpic(this.groupContainerSVGNode, epic);

        this.epicsViewSVGMap.set(epic.ID, svgNodes);
        this.onEpicCreated?.(epic);
    }

    private layoutEpic(epic: Epic) {
        const svgEpicNode = this.epicsViewSVGMap.get(epic.ID);

        if (svgEpicNode === undefined) {
            return;
        }

        svgEpicNode.sizeSVGNodes(epic);
        const nodePos = this.epicSlots.positionSVGNodesByWeek(epic, svgEpicNode, this.getBoundsY());
        svgEpicNode.updateNodePos(nodePos);
        this.updateBoundsWidth(svgEpicNode);
    }

    private layoutAllEpics() {
        this.xOffset = RowPadding;
        this.epicSlots.resetSlots();

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
        this.bounds.size.width = 0;

        this.epicsView.setEpicsContainerSVGNodeY(this.getBoundsY());
        this.layoutAllEpics();

        this.buttonsArray.forEach((btn, index) => {
            const x = NewEpicButton.indexToXPosition(index)

            btn.positionButton(x, this.getBoundsY());
        });
    }

    private updateBoundsWidth(svgNodes: EpicViewSVGNode) {
        const svgRectNode = svgNodes.svgRectNode;
        const xbounds = svgRectNode.$x() + svgRectNode.$width() + RowPadding;
        this.bounds.size.width = Math.max(xbounds, this.bounds.size.width);
    }

    private updateBoundsHeight() {
        const height = this.epicSlots.calcRowHeight();
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