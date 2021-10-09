import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";

import { DownstreamDetailsView } from "./downstreamDetailsView";
import { EpicDetailsView } from "./epicDetailsView";
import { TeamNameDetailsView } from "./teamNameDetailsView";
import { UpstreamDetailsView } from "./upstreamDetailsView";

import { Epic } from "../_defs";

/** @jsx gtap.$jsx */

import "./layoutGrid.css"
import "./selectedEpicDetailsView.css"

export const OSubjectEpicSelected = "view-measure-details";

class SelectedEpicDetailsView extends lib.BaseView {
    private content = <div className='selected-epic-details-view-container' ></div>;

    viewContent() {
        return this.content;
    }

    loadSubviews(viewContent: any) {
        lib.LoadSubviews(this.views, viewContent);
    }

    initView() {
        const teamView = new TeamNameDetailsView(this.parentController);
        const epicDetailsView = new EpicDetailsView(this.parentController);
        const upstreamView = new UpstreamDetailsView(this.parentController);
        const downstreamView = new DownstreamDetailsView(this.parentController);
        // downstreamView.initView();

        this.addView(teamView);
        this.addView(epicDetailsView);
        this.addView(upstreamView);
        this.addView(downstreamView);

        // this.content.appendChild(teamView.viewContent());
        // this.content.appendChild(epicDetailsView.viewContent());
        // this.content.appendChild(upstreamView.viewContent());
        // this.content.appendChild(downstreamView.viewContent());

        super.initView();
    }
}

export class SelectedEpicDetailsController extends lib.BaseViewController implements lib.IObserver {
    protected _view: lib.IView = new SelectedEpicDetailsView(this);

    initController() {
        lib.Observable.subscribe(OSubjectEpicSelected, this);

        super.initController();
    }

    onUpdate(subject: string, state: lib.ObserverState): void {
        switch (subject) {
            case OSubjectEpicSelected: {
                const { epic } = state.value;
                this.onEpicSelected(epic);
                break;
            }
        }
    }

    onEpicSelected(epic: Epic) {
        console.log("XX SelectedEpicDetailsController", epic)
    }
}

