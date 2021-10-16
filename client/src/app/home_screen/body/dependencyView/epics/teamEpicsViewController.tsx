import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import * as dataStore from "../../../../data/dataStore";

import { Epic, EpicID, GTapElement, PathInfo, SVGContainerID, TeamEpics, TeamID, XYOnly } from "../../../_defs";
import { EpicsViewController, ShapeYOffset } from "./epicsViewController";

/** @jsx gtap.$jsx */

import "./teamEpics.css"

export const OSubjectTeamEpicsScrollContainerResized = "team-epics-scroll-container-resized";
export const OSubjectRedrawDependencyConnections = "redraw-dependency-connections";

type WeekDetail = {
    weekIndex: number;
    startDate: Date;
    endDate: Date;
}

type DateMonthPeriod = {
    startMonth: Date;
    endMonth: Date;
    weekDetails: WeekDetail[];
}

const milliSecondsInDay = 86400000; //24 * 60 * 60 * 1000

function createMonthDatePeriod(startDate: Date, dayOffset: number = 0): DateMonthPeriod {
    const month1 = new Date(startDate.getTime() + dayOffset * milliSecondsInDay);
    const month2 = new Date(startDate.getTime());

    // month1.setMonth(startDate.getMonth() + offset);
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
    const numDays = (endMonth.getTime() - startMonth.getTime()) / milliSecondsInDay;

    let weeks = [];
    let weekIndex = 0;
    const weekDetails: WeekDetail[] = [];

    for (let offset = 0; offset < numDays; offset++) {
        const day = new Date(startMonth.getTime() + offset * milliSecondsInDay);

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

    QuarterStartDate!: Date;
    private periods: DateMonthPeriod[] = [];

    viewContent() {
        return this.content;
    }

    initWeeklyViews() {
        this.periods.push(createMonthDatePeriod(this.QuarterStartDate));
        this.periods.push(createMonthDatePeriod(this.periods[0].weekDetails[3].endDate, 1));
        this.periods.push(createMonthDatePeriod(this.periods[1].weekDetails[3].endDate, 1));

        this.periods.forEach((period) => {
            const periodNode = <div className="period-container"></div>
            this.addPeriodView(periodNode, period);
            this.datePeriodsContainerNode.appendChild(periodNode);
        });

        this.scrollContainer.appendChild(this.datePeriodsContainerNode);
    }

    addPeriodView(datePeriodsContainerNode: GTapElement, period: DateMonthPeriod) {
        const monthNameNode = <div className="month-name-container"><span>{period.startMonth.toLocaleString('default', { month: 'short' })}</span></div>
        const weeksContainerNode = <div className="week-detail-container"></div>
        // const milestoneContainerNode =

        // <span>
        //     {`  ${wd.startDate.toLocaleDateString()}-${wd.endDate.toLocaleDateString()}`}
        // </span>
        period.weekDetails.forEach((wd) => {
            const weekDetail = <div className="week">
                <div className="week-info"><span>W</span><span>{wd.weekIndex + 1}</span></div>
                <div className="milestones-container"></div>
            </div>

            weeksContainerNode.appendChild(weekDetail);
        });

        datePeriodsContainerNode.appendChild(monthNameNode)
        datePeriodsContainerNode.appendChild(weeksContainerNode)
    }

    loadSubviews(viewContent: any) {
        this.views.forEach((v) => {
            const vContent = v.viewContent();

            v.loadSubviews(vContent);
            this.scrollContainer.appendChild(vContent);
        });
        viewContent.appendChild(this.scrollContainer);
    }

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

export class TeamEpicsViewController extends lib.BaseViewController {
    protected _view: lib.IView = new TeamEpicsView(this);

    private teamEpicsView = this._view as TeamEpicsView;
    private ctx!: any; /** SVG Node */
    private epicControllers: EpicsViewController[] = [];
    private epicControllerDictionary = new Map<string, EpicsViewController>();

    private lastRowIndex = 0;
    private maxRowWidth = 0; /** Used to adjust the svg element size */

    initView() {
        this.teamEpicsView.QuarterStartDate = new Date("Oct 27 2021");
        super.initView();
    }

    initData(teamEpics?: TeamEpics[]) {
        const svgHostElm = gtap.$class("team-epics-scroll-container")[0];
        this.ctx = gtap.container(SVGContainerID, svgHostElm, "width: 200%; height:100%; position:absolute");

        teamEpics?.forEach((epics) => {
            this.initTeamEpics(epics)
        })
        this.onTeamEpicsAdded();
    }

    private initTeamEpics(epics: TeamEpics) {
        let epicController = new EpicsViewController(this, this.lastRowIndex, epics);

        epicController.onEpicCreated = (epic) => { this.bindEpicToController(epic, epicController); }
        epicController.onCompleted = (rowsCompleted, maxXBounds) => { this.onEpicRowAdded(rowsCompleted, maxXBounds); }
        epicController.onLayoutNeeded = (maxXBounds, didUpdateTeamId) => { this.onLayoutNeeded(maxXBounds, didUpdateTeamId); }
        epicController.initController();

        this.epicControllers.push(epicController);
        this.teamEpicsView.addEpicView(epicController.view.viewContent());
    }

    bindEpicToController(epic: Epic, epicController: EpicsViewController) {
        if (this.epicControllerDictionary.has(epic.ID)) {
            return
        }
        this.epicControllerDictionary.set(epic.ID, epicController);
    }

    private onTeamEpicsAdded() {
        this.epicControllerDictionary.forEach((controller, epicID) => {
            const epic = dataStore.getEpicByID(epicID);

            if (epic?.Upstreams) {
                const epicSvgNode = controller.getEpicSVGRectNode(epicID);
                this.wireUpstreams(epicID, epic.Upstreams, epicSvgNode);
            }
        })

        this.epicControllers.forEach((controller) => {
            controller.setMaxRowWidth(this.maxRowWidth);
        })
    }

    redrawDependencyConnections() {
        console.log(">>this.dependencyConnections:", this.dependencyConnections);
        this.dependencyConnections.forEach(pathInfo => {
            pathInfo.p.remove();
        });
        this.dependencyConnections = [];

        this.onTeamEpicsAdded();
    }

    /** Updates the lastRowIndex with the number of rows added by the  epicController */
    onEpicRowAdded(rowsAdded: number, maxXBounds: number) {
        this.lastRowIndex += rowsAdded;
        this.onLayoutNeeded(maxXBounds);
    }

    onLayoutNeeded(maxXBounds: number, didUpdateTeamId?: TeamID) {
        if (maxXBounds > this.maxRowWidth) {
            this.maxRowWidth = maxXBounds;
            this.ctx.domContainer.$style(`width:${this.maxRowWidth}px; height:100%;position:absolute;`);
        }

        if (didUpdateTeamId === undefined) {
            return;
        }

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

    calcUpstreamStart(upstreamSVGNode: any): XYOnly {
        const startRect = upstreamSVGNode.getBBox();

        return {
            x: startRect?.x + startRect?.width,
            y: startRect?.y + ShapeYOffset
        };
    }

    calcDownstreamEnd(downstreamSVGNode: any): XYOnly {
        const endRect = downstreamSVGNode.getBBox();

        return {
            x: endRect?.x,
            y: endRect?.y + ShapeYOffset
        };
    }

    calcDependencyConnection(upstreamSVGNode: any, downstreamSVGNode: any): { start: XYOnly, end: XYOnly } {
        const start = this.calcUpstreamStart(upstreamSVGNode);
        const end = this.calcDownstreamEnd(downstreamSVGNode);

        return { start: start, end: end };
    }

    private dependencyConnections: PathInfo[] = [];

    wireUpstreams(sourceID: EpicID, targetUpstreams: any[], sourceSVGNode: any) {
        targetUpstreams.forEach((upstreamEpicID) => {
            if (!this.epicControllerDictionary.has(upstreamEpicID)) {
                console.log(`wireUpstreams: unable to find wireUpstreams dependency id(${upstreamEpicID}) <- ${sourceID}`);
                return;
            }

            this.makeDependencyConnection(sourceSVGNode, upstreamEpicID, sourceID);
        })
    }

    makeDependencyConnection(sourceSVGNode: any, upstreamEpicID: EpicID, downstreamEpicID: EpicID) {
        const controller = this.epicControllerDictionary.get(upstreamEpicID)!;
        const targetSVGNode = controller.getEpicSVGRectNode(upstreamEpicID);
        const { start, end } = this.calcDependencyConnection(targetSVGNode, sourceSVGNode);

        const timestamp = Date.now();
        const p = gtap.path(SVGContainerID, `connection[${timestamp}][${upstreamEpicID}-${downstreamEpicID}]`);
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
