import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import * as dataStore from "../../../../data/dataStore";

import { Epic, EpicID, PathInfo, SVGContainerID, TeamEpics, TeamID, XYOnly } from "../../../_defs";
import { EpicsViewController, ShapeYOffset } from "./epicsViewController";

/** @jsx gtap.$jsx */

import "./teamEpics.css"

export const OSubjectTeamEpicsScrollContainerResized = "team-epics-scroll-container-resized";
export const OSubjectRedrawDependencyConnections = "redraw-dependency-connections";
class TeamEpicsView extends lib.BaseView {
    private content = <div className='team-epics-container-wrapper' />;
    private scrollContainer = <div className="team-epics-scroll-container" />;

    viewContent() {
        return this.content;
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

    initTeamEpics(epics: TeamEpics) {
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
        this.dependencyConnections.forEach(pathInfo => {
            pathInfo.p.remove();
        })

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
