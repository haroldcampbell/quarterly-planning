import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";
import * as dataStore from "../../data/dataStore";

import { DownstreamDetailsView } from "./downstreamDetailsView";
import { EpicDetailsView } from "./epicDetailsView";
import { TeamNameDetailsView } from "./teamNameDetailsView";
import { UpstreamDetailsView } from "./upstreamDetailsView";

import { Epic, InputChangeCallback, SelectedEpicDetailsDataOptions } from "../_defs";

/** @jsx gtap.$jsx */

import "./layoutGrid.css"
import "./selectedEpicDetailsView.css"
import { OSubjectRedrawDependencyConnections } from "../body/dependencyView/epics/teamEpicsViewController";

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

    wireOnInputChanged(callback: InputChangeCallback) {
        this.teamView.onInputChanged = (e: Event, dataOptionKey: string) => { callback(e, dataOptionKey) }
        this.epicDetailsView.onInputChanged = (e: Event, dataOptionKey: string) => { callback(e, dataOptionKey) }
    }

    hideEpicDetails() {
        this.content.classList.add("hide-epic-details");
    }
}

type InputHandler = (e: Event) => void;

export class SelectedEpicDetailsController extends lib.BaseViewController implements lib.IObserver {
    protected _view: lib.IView = new SelectedEpicDetailsView(this);

    private selectedEpic?: Epic;

    private detailsView = this._view as SelectedEpicDetailsView;
    private inputChangeMap = new Map<string, InputHandler>();

    initController() {
        lib.Observable.subscribe(OSubjectViewEpicDetails, this);
        lib.Observable.subscribe(OSubjectHideEpicDetails, this);
        lib.Observable.subscribe(OSubjectRedrawDependencyConnections, this);

        this.detailsView.wireOnInputChanged((e: Event, dataOptionKey: string) => this.onInputChanged(e, dataOptionKey));

        this.inputChangeMap.set(SelectedEpicDetailsDataOptions.TeamName, (e: Event) => this.onInputChangedTeamName(e));
        this.inputChangeMap.set(SelectedEpicDetailsDataOptions.EpicName, (e: Event) => this.onInputChangedEpicName(e));

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
                break;
            }
            case OSubjectRedrawDependencyConnections: {
                const { downstreamEpic } = state.value;
                this.onEpicSelected(downstreamEpic);
                break;
            }
        }
    }

    onEpicSelected(epic: Epic) {
        this.selectedEpic = epic;
        this.detailsView.showEpicDetails(epic);
    }

    onHideEpicDetails() {
        this.selectedEpic = undefined;
        this.detailsView.hideEpicDetails();
    }

    onInputChanged(e: Event, dataOptionKey: string) {
        e.preventDefault();
        e.stopPropagation();

        const handler = this.inputChangeMap.get(dataOptionKey)
        handler?.(e)
    }

    onInputChangedTeamName(e: Event) {
        if (this.selectedEpic === undefined) {
            return;
        }

        const node = e!.target as HTMLInputElement;
        node.blur();

        dataStore.UpdateTeamName(this.selectedEpic.TeamID, node.value);
    }

    onInputChangedEpicName(e: Event) {
        if (this.selectedEpic === undefined) {
            return;
        }

        const node = e!.target as HTMLInputElement;
        node.blur();

        dataStore.UpdateEpicName(this.selectedEpic.ID, node.value);
    }
}

