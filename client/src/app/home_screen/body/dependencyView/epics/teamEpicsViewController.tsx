import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { Epic, Team, TeamEpics } from "../../../_defs";
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

export class TeamEpicsViewController extends lib.BaseViewController {
    protected _view: lib.IView = new TeamEpicsView(this);

    initData(teamEpics?: TeamEpics[]) {
        teamEpics?.forEach((epics) => {
            this.initTeamEpics(epics)
        })
    }

    initTeamEpics(epics: TeamEpics) {
        let epicController = new EpicsViewController(this, epics);

        epicController.onEpicCreated = (epic, epicNode) => { this.epicCreated(epic, epicNode); }
        epicController.onEpicsLoad = () => { this.addDependencyConnections() }
        epicController.initController();

        this.view.addView(epicController.view);
    }

    epicCreated(epic: Epic, epicNode: HTMLElement) {
        console.log("Created Epic node", epic, epicNode)
    }

    addDependencyConnections() {

    }
}
