import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { EpicControllerBounds, MilliSecondsInDay, ShapeYOffset, SVGMaxContextWidth, XYOnly } from "../../../../common/nodePositions";
import * as dataStore from "../../../../data/dataStore";
import { OSubjectDidDeleteEpic, OSubjectDidDeleteTeam } from "../../../selectedEpicDetails/selectedEpicDetailsViewController";

import { DateMonthPeriod, Epic, EpicID, GTapElement, OSubjectDidChangeEpic, OSubjectDidCreateNewTeam, OSubjectDimUnhighlightedEpics, OSubjectHighlightDownstreamEpic, OSubjectHighlightUpstreamEpic, OSubjectUnHighlightAllEpic, PathInfo, SVGContainerID, Team, TeamEpics, TeamID, WeekDetail } from "../../../_defs";
import { EpicsViewController } from "./epicsViewController";

/** @jsx gtap.$jsx */

import "./teamEpics.css"

export const OSubjectTeamEpicsScrollContainerResized = "team-epics-scroll-container-resized";
export const OSubjectRedrawDependencyConnections = "redraw-dependency-connections";

function createMonthDatePeriod(startDate: Date, dayOffset: number = 0): DateMonthPeriod {
    const month1 = new Date(startDate.getTime() + dayOffset * MilliSecondsInDay);
    const month2 = new Date(startDate.getTime());

    month2.setMonth(month1.getMonth() + 1);

    const monthPeriod = {
        startMonth: month1,
        endMonth: month2,
        weekDetails: calcWeekSpan(month2, month1),
    };

    monthPeriod.endMonth = monthPeriod.weekDetails[3].endDate; /** Update the endMonth to account for weekends, etc. */

    return monthPeriod;
}

function calcWeekSpan(endMonth: Date, startMonth: Date): WeekDetail[] {
    const numDays = (endMonth.getTime() - startMonth.getTime()) / MilliSecondsInDay;

    let weeks = [];
    let weekIndex = 0;
    const weekDetails: WeekDetail[] = [];

    for (let offset = 0; offset < numDays; offset++) {
        const day = new Date(startMonth.getTime() + offset * MilliSecondsInDay);

        if (day.getDay() == 0 || day.getDay() == 6) {
            continue;
        }

        weeks.push(day);

        if (weeks.length == 5) {
            weekDetails.push({
                weekIndex: weekIndex,
                startDate: weeks[0],
                endDate: weeks[4],
            });
            weeks = [];
            weekIndex++;
        }
    }

    return weekDetails;
}

class TeamEpicsView extends lib.BaseView {
    private content = <div className='team-epics-container-wrapper' />;
    private scrollContainer = <div className="team-epics-scroll-container" />;
    private datePeriodsContainerNode = <div className="date-periods-container"></div>
    private spillOverNode = <div className="spill-over-period"></div>;

    QuarterStartDate!: Date;
    private periodNodes: GTapElement[] = [];
    private activePeriods!: DateMonthPeriod[];

    viewContent() {
        return this.content;
    }

    initWeeklyViews() {
        this.activePeriods.forEach((period, index) => {
            const periodNode = <div className="period-container"></div>
            this.addPeriodView(periodNode, period, index);
            this.periodNodes.push(periodNode);
            this.datePeriodsContainerNode.appendChild(periodNode);
        });
        this.datePeriodsContainerNode.appendChild(this.spillOverNode);
        this.scrollContainer.appendChild(this.datePeriodsContainerNode);
    }

    setActivePeriods(periods: DateMonthPeriod[]) {
        this.activePeriods = periods;
    }

    setSpillOverWidth(width: number) {
        this.spillOverNode.style.width = `${width}px`;
    }

    getPeriodNodeLength(): number {
        let width = 0;

        this.periodNodes.forEach(node => {
            width += node.getBoundingClientRect().width;
        });

        return width;
    }

    addPeriodView(datePeriodsContainerNode: GTapElement, period: DateMonthPeriod, periodIndex: number) {
        const MonthName = period.weekDetails[1].startDate.toLocaleString('default', { month: 'short' }); // use the Month name from the second week
        const fromDate = period.startMonth.toLocaleString('default', { month: 'short', day: '2-digit' });
        const toDate = period.endMonth.toLocaleString('default', { month: 'short', day: '2-digit' });

        const monthNameNode = <div className="month-name-container"><span className="month-name">{MonthName}</span><span className="month-name-period">{`${fromDate} － ${toDate}`}</span></div>
        const weeksContainerNode = <div className="week-detail-container"></div>


        period.weekDetails.forEach((wd) => {
            const weekDetail = <div className="week">
                <div className="week-info"><span>W</span><span>{periodIndex * 4 + wd.weekIndex + 1}</span></div>
                {/* <div className="week-info"><span>W</span><span>{wd.weekIndex + 1}</span></div> */}
                <div className="milestones-container"></div>
            </div>

            weeksContainerNode.appendChild(weekDetail);
        });

        datePeriodsContainerNode.appendChild(monthNameNode)
        datePeriodsContainerNode.appendChild(weeksContainerNode)
    }

    loadSubviews(viewContent: any) { }

    initView() {
        this.content.appendChild(this.scrollContainer);

        this.initWeeklyViews();
        // Get the size of the scrollContainer.
        // I'm doing this cause I can't get the fucking clientWidth or
        // getBoundingClientRect to report the correct width.
        const resizeObserver = new ResizeObserver(entries => {
            lib.Observable.notify(OSubjectTeamEpicsScrollContainerResized, {
                source: this,
                value: { contentWidth: entries[0].contentRect },
            });
        });

        resizeObserver.observe(this.scrollContainer);

        super.initView();
    }

    addEpicView(viewNode: HTMLElement) {
        this.scrollContainer.appendChild(viewNode);
    }
}

export class TeamEpicsViewController extends lib.BaseViewController implements lib.IObserver {
    protected _view: lib.IView = new TeamEpicsView(this);

    private teamEpicsView = this._view as TeamEpicsView;
    private ctx!: any; /** SVG Node */
    private epicControllers: EpicsViewController[] = [];
    private epicControllerDictionary = new Map<string, EpicsViewController>();

    QuarterStartDate!: Date;

    private lastControllerBounds?: EpicControllerBounds;
    private maxRowWidth = 0; /** Used to adjust the svg element size */
    private periods: DateMonthPeriod[] = [];
    private dependencyConnections: PathInfo[] = [];

    initView() {
        this.QuarterStartDate = new Date("Oct 1 2021")

        this.teamEpicsView.QuarterStartDate = this.QuarterStartDate;
        this.teamEpicsView.setActivePeriods(this.periods);

        this.periods.push(createMonthDatePeriod(this.QuarterStartDate));
        this.periods.push(createMonthDatePeriod(this.periods[0].weekDetails[3].endDate, 1));
        this.periods.push(createMonthDatePeriod(this.periods[1].weekDetails[3].endDate, 1));

        lib.Observable.subscribe(OSubjectUnHighlightAllEpic, this);
        lib.Observable.subscribe(OSubjectHighlightUpstreamEpic, this);
        lib.Observable.subscribe(OSubjectHighlightDownstreamEpic, this);
        lib.Observable.subscribe(OSubjectDidDeleteEpic, this);
        lib.Observable.subscribe(OSubjectDidDeleteTeam, this);
        lib.Observable.subscribe(OSubjectDimUnhighlightedEpics, this);
        lib.Observable.subscribe(OSubjectDidChangeEpic, this);

        super.initView();
    }

    initData(teamEpics?: TeamEpics[]) {
        const svgHostElm = gtap.$class("team-epics-scroll-container")[0];

        this.ctx = gtap.container(SVGContainerID, svgHostElm, "width: 200%; height:100%; position:absolute");

        teamEpics?.forEach((teamEpic) => {
            this.initTeamEpics(teamEpic)
        })
        this.onTeamEpicsAdded();
    }

    onUpdate(subject: string, state: lib.ObserverState): void {
        switch (subject) {
            case OSubjectDimUnhighlightedEpics: {
                const { selectedEpic } = state.value;
                this.onDimAllConnections(selectedEpic)
                break;
            }
            case OSubjectUnHighlightAllEpic: {
                this.onUnHighlightAllConnections();
                break;
            }
            case OSubjectHighlightUpstreamEpic: {
                const { upstreamEpicID, activeEpicID } = state.value;
                this.onHighlightUpstreamConnections(upstreamEpicID, activeEpicID);
                break;
            }
            case OSubjectHighlightDownstreamEpic: {
                const { downstreamEpicID, activeEpicID } = state.value;
                this.onHighlightDownstreamConnections(downstreamEpicID, activeEpicID);
                break;
            }
            case OSubjectDidDeleteEpic: {
                const { epic } = state.value;
                this.unlinkDeletedEpicConnections(epic.ID)
                break;
            }
            case OSubjectDidDeleteTeam: {
                const { teamID, deletedEpicIDs } = state.value;
                this.onDeleteEpicController(teamID, deletedEpicIDs);
                break;
            }
            case OSubjectDidChangeEpic: {
                const { epic } = state.value;
                this.relayoutEpicControllers();

                break;
            }
        }
    }

    onDidCreateNewTeam(teamEpics: TeamEpics) {
        this.initTeamEpics(teamEpics)
        this.relayoutEpicControllers();
    }

    private onDimAllConnections(selectedEpic: Epic) {
        this.dependencyConnections.forEach(pathInfo => {
            if (pathInfo.upstreamEpicID != selectedEpic.ID || pathInfo.downstreamEpicID != selectedEpic.ID) {
                pathInfo.p.$appendCSS("dimmed-connection");
            }
        });
    }

    private onUnHighlightAllConnections() {
        this.dependencyConnections.forEach(pathInfo => {
            pathInfo.p.$removeCSS("highlighed-downstream-connection");
            pathInfo.p.$removeCSS("selected-connection");
            pathInfo.p.$removeCSS("dimmed-connection");
        });
    }

    private onHighlightDownstreamConnections(downstreamEpicID: EpicID, activeEpicID: EpicID) {
        this.dependencyConnections.forEach(pathInfo => {
            if (pathInfo.downstreamEpicID == downstreamEpicID && pathInfo.upstreamEpicID == activeEpicID) {
                pathInfo.p.$removeCSS("dimmed-connection");
                pathInfo.p.$appendCSS("highlighed-downstream-connection");
            }
        });
    }

    private onHighlightUpstreamConnections(upstreamEpicID: EpicID, activeEpicID: EpicID) {
        this.dependencyConnections.forEach(pathInfo => {
            if (pathInfo.upstreamEpicID == upstreamEpicID && pathInfo.downstreamEpicID == activeEpicID) {
                pathInfo.p.$removeCSS("dimmed-connection");
                pathInfo.p.$appendCSS("selected-connection");
            }
        });
    }

    private initTeamEpics(teamEpics: TeamEpics) {
        let epicController = new EpicsViewController(this, teamEpics, this.lastControllerBounds);

        epicController.setActivePeriods(this.periods);
        epicController.onEpicCreated = (epic) => { this.bindEpicToController(epic, epicController); }
        epicController.onBoundsChanged = (bounds: EpicControllerBounds) => { this.boundsDidChange(bounds); }
        epicController.onLayoutNeeded = (maxXBounds) => { this.onLayoutNeeded(maxXBounds); }
        epicController.initController();

        this.epicControllers.push(epicController);
    }

    bindEpicToController(epic: Epic, epicController: EpicsViewController) {
        if (this.epicControllerDictionary.has(epic.ID)) {
            return
        }
        this.epicControllerDictionary.set(epic.ID, epicController);
    }

    boundsDidChange(bounds: EpicControllerBounds) {
        this.lastControllerBounds = bounds;
        this.updateContextWidth(this.lastControllerBounds.size.width);
    }

    onLayoutNeeded(bounds: EpicControllerBounds) {
        this.boundsDidChange(bounds);
        this.layoutDependencyConnections();
    }

    private onTeamEpicsAdded() {
        const connections = dataStore.GetEpicConnections()
        connections.forEach(connection => {

            if (!this.epicControllerDictionary.has(connection.UpstreamEpicID)) {
                console.log(`wireUpstreams: unable to find wireUpstreams dependency id(${connection.UpstreamEpicID}) < - ${connection.DownstreamEpicID} `);
                return;
            }

            this.makeDependencyConnection(connection.UpstreamEpicID, connection.DownstreamEpicID);
        })

        this.syncSpillOverVisibility()

        this.epicControllers.forEach((controller) => {
            controller.setMaxRowWidth(this.maxRowWidth);
        })
    }

    /** Show the spill over when the epic extend beyond the quarter */
    private syncSpillOverVisibility() {
        const periodNodesWidth = this.teamEpicsView.getPeriodNodeLength();
        if (periodNodesWidth < this.maxRowWidth) {
            let diffWidth = this.maxRowWidth - periodNodesWidth;
            diffWidth = diffWidth < 100 ? 100 : diffWidth; // Enforce a min width
            this.teamEpicsView.setSpillOverWidth(diffWidth);
        } else {
            this.teamEpicsView.setSpillOverWidth(0);
        }
    }

    private onDeleteEpicController(teamID: TeamID, deletedEpicIDs: EpicID[]) {
        this.epicControllers = this.epicControllers.filter(epicController => epicController.teamEpics.Team.ID != teamID);

        deletedEpicIDs.forEach(epicID => {
            this.unlinkDeletedEpicConnections(epicID);
        })

        this.relayoutEpicControllers();
        this.onUnHighlightAllConnections();
    }

    redrawDependencyConnections() {
        this.dependencyConnections.forEach(pathInfo => {
            pathInfo.p.remove();
        });

        this.dependencyConnections = [];
        this.onTeamEpicsAdded();
    }

    updateContextWidth(maxXBounds: number) {
        if (maxXBounds > this.maxRowWidth) {
            this.maxRowWidth = maxXBounds;
            this.ctx.domContainer.$style(`width:${Math.max(SVGMaxContextWidth, this.maxRowWidth)}px; height: 100%; position: absolute; `);
        }
    }

    layoutDependencyConnections() {
        this.dependencyConnections.forEach(pathInfo => {
            const upstreamController = this.epicControllerDictionary.get(pathInfo.upstreamEpicID)!;
            const upstreamSVGNode = upstreamController.getEpicSVGRectNode(pathInfo.upstreamEpicID);

            const downstreamController = this.epicControllerDictionary.get(pathInfo.downstreamEpicID)!;
            const downstreamSVGNode = downstreamController.getEpicSVGRectNode(pathInfo.downstreamEpicID);

            pathInfo.start = this.calcUpstreamStart(upstreamSVGNode);
            pathInfo.end = this.calcDownstreamEnd(downstreamSVGNode);

            orienPath(pathInfo.p, pathInfo.start, pathInfo.end);
        });
    }

    relayoutEpicControllers() {
        this.maxRowWidth = 0;
        this.updateContextWidth(-1);

        this.lastControllerBounds = undefined;
        this.epicControllers.forEach((controller) => {
            controller.layoutAllEpicsWithBounds(this.lastControllerBounds);
        })

        this.syncSpillOverVisibility()
        this.layoutDependencyConnections();
    }

    calcUpstreamStart(upstreamSVGNode: any): XYOnly {
        const startRect = upstreamSVGNode.getBBox();

        return {
            x: startRect?.x + startRect?.width,
            y: startRect?.y + ShapeYOffset / 2.0
        };
    }

    calcDownstreamEnd(downstreamSVGNode: any): XYOnly {
        const endRect = downstreamSVGNode.getBBox();

        return {
            x: endRect?.x,
            y: endRect?.y + ShapeYOffset / 2.0
        };
    }

    calcDependencyConnection(upstreamSVGNode: any, downstreamSVGNode: any): { start: XYOnly, end: XYOnly } {
        const start = this.calcUpstreamStart(upstreamSVGNode);
        const end = this.calcDownstreamEnd(downstreamSVGNode);

        return { start: start, end: end };
    }

    private unlinkDeletedEpicConnections(epicID: string) {
        // TODO: The code blocks below are not the most optimal. They can be optimized
        this.dependencyConnections.forEach((pathInfo) => {
            if (pathInfo.upstreamEpicID == epicID || pathInfo.downstreamEpicID == epicID) {
                pathInfo.p.remove();
            }
        })
        this.dependencyConnections = this.dependencyConnections.filter(pathInfo => pathInfo.upstreamEpicID != epicID);
        this.dependencyConnections = this.dependencyConnections.filter(pathInfo => pathInfo.downstreamEpicID != epicID);
    }

    private makeDependencyConnection(upstreamEpicID: EpicID, downstreamEpicID: EpicID) {
        const upstreamController = this.epicControllerDictionary.get(upstreamEpicID)!;
        const upstreamSVGNode = upstreamController.getEpicSVGRectNode(upstreamEpicID);

        const downstreamController = this.epicControllerDictionary.get(downstreamEpicID)!;
        const downstreamSVGNode = downstreamController.getEpicSVGRectNode(downstreamEpicID);
        const { start, end } = this.calcDependencyConnection(upstreamSVGNode, downstreamSVGNode);

        const timestamp = Date.now();
        const p = gtap.path(SVGContainerID, `connection[${timestamp}][${upstreamEpicID} - ${downstreamEpicID}]`);
        orienPath(p, start, end);
        p.$appendCSS("connection");

        const pathInfo = { p, start, end, upstreamEpicID, downstreamEpicID };
        this.dependencyConnections.push(pathInfo);
    }
}

/**
 * HACK: This is to ensure that the dependency connetions always
 * flow horizonatally.
 *
 * I didn't want to have to modify groundtap's path function.
 */
function orienPath(p: any, start: XYOnly, end: XYOnly) {
    const w = end.x - start.x;
    const y = end.y - start.y;

    if (w > y) {
        p.$path(start, end, true);
    } else {
        p.$path(end, start, true);
    }
}
