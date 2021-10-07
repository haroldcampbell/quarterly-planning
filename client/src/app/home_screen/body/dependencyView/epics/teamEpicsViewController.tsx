import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { Team, TeamEpics } from "../../../_defs";
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

    // addTemEpics(node: HTMLElement) {
    // this.container.appendChild(node)
    // }
}


export class TeamEpicsViewController extends lib.BaseViewController {
    protected _view: lib.IView = new TeamEpicsView(this);

    initData(teams?: Team[], teamEpics?: TeamEpics[]) {
        teamEpics?.forEach((epics) => {
            this.initTeamEpics(epics)
        })
    }

    initTeamEpics(epics: TeamEpics) {
        let epicController = new EpicsViewController(this, epics);

        epicController.initController();

        // (this._view as TeamEpicsView).addTemEpics(epicController.view.viewContent());
        this.view.addView(epicController.view);
    }
}
