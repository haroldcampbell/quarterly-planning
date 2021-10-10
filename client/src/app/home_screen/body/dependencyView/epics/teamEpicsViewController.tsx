import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { IView } from "../../../../../core/lib";
import * as dataStore from "../../../../data/dataStore";

import { Epic, OSubjectDataStoreReady, PathInfo, SVGContainerID, Team, TeamEpics, XYOnly } from "../../../_defs";
import { EpicsViewController } from "./epicsViewController";

/** @jsx gtap.$jsx */

import "./teamEpics.css"

export const OSubjectTeamEpicsScrollContainerResized = "team-epics-scroll-container-resized";

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

        epicController.onEpicCreated = (epic) => { this.epicCreated(epic, epicController); }
        epicController.onCompleted = (rowsCompleted, maxXBounds) => { this.onEpicRowAdded(rowsCompleted, maxXBounds); }
        epicController.onLayoutNeeded = (maxXBounds, didUpdateTeamId) => { this.onLayoutNeeded(maxXBounds, didUpdateTeamId); }
        epicController.initController();

        this.epicControllers.push(epicController);
        this.teamEpicsView.addEpicView(epicController.view.viewContent());
    }

    epicCreated(epic: Epic, epicController: EpicsViewController) {
        if (this.epicControllerDictionary.has(epic.ID)) {
            return
        }
        this.epicControllerDictionary.set(epic.ID, epicController);
    }

    onTeamEpicsAdded() {
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

    /** Updates the lastRowIndex with the number of rows added by the  epicController */
    onEpicRowAdded(rowsAdded: number, maxXBounds: number) {
        this.lastRowIndex += rowsAdded;
        this.onLayoutNeeded(maxXBounds);
    }

    onLayoutNeeded(maxXBounds: number, didUpdateTeamId?: string) {
        if (maxXBounds > this.maxRowWidth) {
            this.maxRowWidth = maxXBounds;
            this.ctx.domContainer.$style(`width:${this.maxRowWidth}px; height:100%;position:absolute;`);
        }

        if (didUpdateTeamId === undefined) {
            return;
        }

        const epics = dataStore.getEpicsByTeamID(didUpdateTeamId);

        epics.forEach((epic => {
            if (this.upstreamConnectionMap.has(epic.ID)) {
                const startPaths = this.upstreamConnectionMap.get(epic.ID);

                startPaths?.forEach((pInfo) => {
                    const controller = this.epicControllerDictionary.get(epic.ID)!;
                    const targetSVGNode = controller.getEpicSVGRectNode(epic.ID);

                    pInfo.start = this.calcUpstreamStart(targetSVGNode);
                    pInfo.p.$path(pInfo.start, pInfo.end, true);
                });
            }


            if (this.downstreamConnectionMap.has(epic.ID)) {
                const endPaths = this.downstreamConnectionMap.get(epic.ID);

                endPaths?.forEach((pInfo) => {
                    const controller = this.epicControllerDictionary.get(epic.ID)!;
                    const targetSVGNode = controller.getEpicSVGRectNode(epic.ID);

                    pInfo.end = this.calcDownstreamEnd(targetSVGNode);
                    pInfo.p.$path(pInfo.start, pInfo.end, true);
                });
            }
        }));

    }

    calcUpstreamStart(upstreamSVGNode: any): XYOnly {
        const startRect = upstreamSVGNode.getBBox();

        return {
            x: startRect?.x + startRect?.width,
            y: startRect?.y + 20
        };
    }

    calcDownstreamEnd(downstreamSVGNode: any): XYOnly {
        const endRect = downstreamSVGNode.getBBox();

        return {
            x: endRect?.x,
            y: endRect?.y + 20
        };
    }

    calcDependencyConnection(upstreamSVGNode: any, downstreamSVGNode: any): { start: XYOnly, end: XYOnly } {
        const start = this.calcUpstreamStart(upstreamSVGNode);
        const end = this.calcDownstreamEnd(downstreamSVGNode);

        return { start: start, end: end };
    }

    private upstreamConnectionMap = new Map<string, PathInfo[]>();
    private downstreamConnectionMap = new Map<string, PathInfo[]>();

    wireUpstreams(sourceID: string, targetUpstreams: any[], sourceSVGNode: any) {
        let counter: number = 0;

        targetUpstreams.forEach((upstreamEpicID) => {
            if (!this.epicControllerDictionary.has(upstreamEpicID)) {
                console.log(`wireUpstreams: unable to find wireUpstreams dependency id(${upstreamEpicID}) <- ${sourceID}`);
                return;
            }

            const controller = this.epicControllerDictionary.get(upstreamEpicID)!;
            const targetSVGNode = controller.getEpicSVGRectNode(upstreamEpicID);
            const { start, end } = this.calcDependencyConnection(targetSVGNode, sourceSVGNode);

            const p = gtap.path(SVGContainerID, `connection[${counter++}][${upstreamEpicID}-${sourceID}]`);
            p.$path(start, end, true);
            p.$appendCSS("connection");

            const pathInfo = { p, start, end };
            if (!this.upstreamConnectionMap.has(upstreamEpicID)) {
                this.upstreamConnectionMap.set(upstreamEpicID, []);
            }
            this.upstreamConnectionMap.get(upstreamEpicID)?.push(pathInfo);

            if (!this.downstreamConnectionMap.has(sourceID)) {
                this.downstreamConnectionMap.set(sourceID, []);
            }
            this.downstreamConnectionMap.get(sourceID)?.push(pathInfo);
        })
    }
}
