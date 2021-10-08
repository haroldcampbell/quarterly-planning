import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { Epic, SVGContainerID, Team, TeamEpics } from "../../../_defs";
import { EpicsViewController } from "./epicsViewController";

/** @jsx gtap.$jsx */

import "./teamEpics.css"

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

        super.initView();
    }
}

type epicNode = {
    epic: Epic;
    epicSvgNode: any;
}

export class TeamEpicsViewController extends lib.BaseViewController {
    protected _view: lib.IView = new TeamEpicsView(this);

    private ctx!: any; /** SVG Node */
    private epicDictionary = new Map<string, epicNode>();
    private epics: Epic[] = [];
    private epicControllers: EpicsViewController[] = [];

    private lastRowIndex = 0;
    private maxRowWidth = 0; /** Used to adjust the svg element size */

    initData(teamEpics?: TeamEpics[]) {
        const svgHostElm = gtap.$class("team-epics-scroll-container")[0];
        this.ctx = gtap.container(SVGContainerID, svgHostElm, "width: 200%; height:100%; position:absolute");

        teamEpics?.forEach((epics) => {
            this.initTeamEpics(epics)
        })
        this.onTeamEpicsAdded();
    }

    initTeamEpics(epics: TeamEpics) {
        let epicController = new EpicsViewController(this, this.ctx, this.lastRowIndex, epics);

        epicController.onEpicCreated = (epic, epicSvgNode) => { this.epicCreated(epic, epicSvgNode); }
        epicController.onCompleted = (rowsCompleted, maxXBounds) => { this.onEpicRowAdded(rowsCompleted, maxXBounds); }
        epicController.initController();

        this.epicControllers.push(epicController);

        this.view.addView(epicController.view);
    }

    epicCreated(epic: Epic, epicSvgNode: any) {
        if (this.epicDictionary.has(epic.ID)) {
            return
        }
        this.epicDictionary.set(epic.ID, {
            epic: epic,
            epicSvgNode: epicSvgNode
        });
        this.epics.push(epic);
    }

    onTeamEpicsAdded() {
        this.epicDictionary.forEach((obj, key) => {
            if (obj.epic.Upstreams) {
                this.wireUpstreams(key, obj.epic.Upstreams, obj.epicSvgNode);
            }
        })

        this.epicControllers.forEach((controller) => {
            controller.updateViewWidth(this.maxRowWidth);
        })
    }

    /** Updates the lastRowIndex with the number of rows added by the  epicController */
    onEpicRowAdded(rowsAdded: number, maxXBounds: number) {
        this.lastRowIndex += rowsAdded;
        if (maxXBounds > this.maxRowWidth) {
            this.maxRowWidth = maxXBounds;
            this.ctx.domContainer.$style(`width:${this.maxRowWidth}px; height:100%;position:absolute;`);
        }
    }

    wireUpstreams(sourceID: string, targetUpstreams: any[], sourceSVGNode: any) {
        let counter: number = 0;
        targetUpstreams.forEach((id) => {
            if (!this.epicDictionary.has(id)) {
                console.log(`wireUpstreams: unable to find wireUpstreams dependency id(${id}) <- ${sourceID}`);
                return;
            }

            const target = this.epicDictionary.get(id);
            const startRect = target?.epicSvgNode.getBBox();
            const endRect = sourceSVGNode.getBBox();

            const start = {
                x: startRect?.x + startRect?.width,
                y: startRect?.y + 20
            }

            const end = {
                x: endRect?.x,
                y: endRect?.y + 20
            }

            const p = gtap.path(SVGContainerID, `connection[${counter++}][${id}-${sourceID}]`);
            p.$path(start, end, true);
            p.$appendCSS("connection");

            // const lID = `lconnection[${counter++}][${id}-${sourceID}]`;
            // const l = gtap.line(SVGContainerID, lID, start, end);
            // l.$appendCSS("connection");
        })
    }
}

