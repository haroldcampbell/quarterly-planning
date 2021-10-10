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

export const OSubjectViewEpicDetails = "view-epic-details";
export const OSubjectHideEpicDetails = "hide-epic-details";

class SelectedEpicDetailsView extends lib.BaseView {
    private content = <div className='selected-epic-details-view-container hide-epic-details' ></div>;

    private teamView = new TeamNameDetailsView(this.parentController);
    private epicDetailsView = new EpicDetailsView(this.parentController);
    private upstreamView = new UpstreamDetailsView(this.parentController);
    private downstreamView = new DownstreamDetailsView(this.parentController);


    viewContent() {
        return this.content;
    }

    loadSubviews(viewContent: any) {
        lib.LoadSubviews(this.views, viewContent);
    }

    initView() {
        this.addView(this.teamView);
        this.addView(this.epicDetailsView);
        this.addView(this.upstreamView);
        this.addView(this.downstreamView);

        super.initView();
    }

    showEpicDetails(epic: Epic) {
        this.teamView.onEpicSelected(epic);
        this.epicDetailsView.onEpicSelected(epic);
        this.upstreamView.onEpicSelected(epic);
        this.downstreamView.onEpicSelected(epic);

        this.content.classList.remove("hide-epic-details");
    }

    hideEpicDetails() {
        this.content.classList.add("hide-epic-details");
    }
}

export class SelectedEpicDetailsController extends lib.BaseViewController implements lib.IObserver {
    protected _view: lib.IView = new SelectedEpicDetailsView(this);

    private detailsView = this._view as SelectedEpicDetailsView;

    initController() {
        lib.Observable.subscribe(OSubjectViewEpicDetails, this);
        lib.Observable.subscribe(OSubjectHideEpicDetails, this);

        super.initController();
    }

    onUpdate(subject: string, state: lib.ObserverState): void {
        switch (subject) {
            case OSubjectViewEpicDetails: {
                const { epic } = state.value;
                this.onEpicSelected(epic);
                break;
            }
            case OSubjectHideEpicDetails: {
                this.onHideEpicDetails();
            }
        }
    }

    onEpicSelected(epic: Epic) {
        this.detailsView.showEpicDetails(epic);
    }

    onHideEpicDetails() {
        this.detailsView.hideEpicDetails();
    }
}

