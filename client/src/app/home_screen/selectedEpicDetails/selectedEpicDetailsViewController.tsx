import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";
import * as dataStore from "../../data/dataStore";

import { DownstreamDetailsView } from "./downstreamDetailsView";
import { EpicDetailsView } from "./epicDetailsView";
import { TeamNameDetailsView } from "./teamNameDetailsView";
import { UpstreamDetailsView } from "./upstreamDetailsView";

import { DateMonthPeriod, Epic, EpicID, InputChangeCallback, OSubjectWillUpdateEpicName, OSubjectWillUpdateTeamName, SelectedEpicDetailsDataOptions, Team, TeamEpicDependency } from "../_defs";

/** @jsx gtap.$jsx */

import "./layoutGrid.css"
import "./selectedEpicDetailsView.css"
import { OSubjectRedrawDependencyConnections } from "../body/dependencyView/epics/teamEpicsViewController";
import { OSubjectViewAddDependencyDialog } from "./addDependencyDialogController";
import { DeleteControlsView } from "./deleteControlsView";

export const OSubjectEpicSelected = "epic-selected"; /** Fired when epic is selected */
export const OSubjectHideEpicDetails = "hide-epic-details";
export const OSubjectDidDeleteEpic = "deleted-selected-epic";
export const OSubjectDidDeleteTeam = "deleted-selected-team";
class SelectedEpicDetailsView extends lib.BaseView {
    private content = <div className='selected-epic-details-view-container hide-epic-details' ></div>;

    private teamView = new TeamNameDetailsView(this.parentController);
    private epicDetailsView = new EpicDetailsView(this.parentController);
    private upstreamView = new UpstreamDetailsView(this.parentController);
    private downstreamView = new DownstreamDetailsView(this.parentController);
    private deleteControlsView = new DeleteControlsView(this.parentController);

    private selectedEpic!: Epic;

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
        this.addView(this.deleteControlsView);

        super.initView();
    }

    showEpicDetails(epic: Epic, activePeriods: DateMonthPeriod[]) {
        this.selectedEpic = epic;
        this.teamView.onEpicSelected(epic);
        this.epicDetailsView.onEpicSelected(epic, activePeriods);
        const existingUpstreamEpics = this.upstreamView.onEpicSelected(epic);
        const existingDownstreamEpics = this.downstreamView.onEpicSelected(epic);

        this.upstreamView.onShowDependencyDialogCallback = () => {
            this.showDependencyDialog(existingUpstreamEpics, existingDownstreamEpics);
        }

        this.downstreamView.onShowDependencyDialogCallback = () => {
            this.showDependencyDialog(existingUpstreamEpics, existingDownstreamEpics);
        }


        this.content.classList.remove("hide-epic-details");
    }

    showDependencyDialog(existingUpstreamEpics: Map<EpicID, TeamEpicDependency>, existingDownstreamEpics: Map<EpicID, TeamEpicDependency>) {
        lib.Observable.notify(OSubjectViewAddDependencyDialog, {
            source: this,
            value: {
                selectedEpic: this.selectedEpic,
                upstreamEpics: existingUpstreamEpics,
                downstreamEpics: existingDownstreamEpics,
            }
        });
    }

    wireOnInputChanged(callback: InputChangeCallback) {
        this.teamView.onInputChanged = (e: Event, dataOptionKey: string) => { callback(e, dataOptionKey) }
        this.epicDetailsView.onInputChanged = (e: Event, dataOptionKey: string) => { callback(e, dataOptionKey) }
    }

    wireOnDeleteButtonsClicked(onDeleteSelectedEpic: () => void, onDeleteSelectedTeam: () => void) {
        this.deleteControlsView.onDeleteEpicCallback = () => {
            onDeleteSelectedEpic();
        }

        this.deleteControlsView.onDeleteTeamCallback = () => {
            onDeleteSelectedTeam();
        }
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
    private activePeriods?: DateMonthPeriod[];

    initController() {
        lib.Observable.subscribe(OSubjectEpicSelected, this);
        lib.Observable.subscribe(OSubjectHideEpicDetails, this);
        lib.Observable.subscribe(OSubjectRedrawDependencyConnections, this);

        this.detailsView.wireOnInputChanged((e: Event, dataOptionKey: string) => this.onInputChanged(e, dataOptionKey));
        this.detailsView.wireOnDeleteButtonsClicked(() => {
            this.onDeleteSelectedEpic();
        }, () => {
            this.onDeleteSelectedTeam()
        });
        this.inputChangeMap.set(SelectedEpicDetailsDataOptions.TeamName, (e: Event) => this.onInputChangedTeamName(e));
        this.inputChangeMap.set(SelectedEpicDetailsDataOptions.EpicName, (e: Event) => this.onInputChangedEpicName(e));

        super.initController();
    }

    onUpdate(subject: string, state: lib.ObserverState): void {
        switch (subject) {
            case OSubjectEpicSelected: {
                const { epic, activePeriods } = state.value;
                this.onEpicSelected(epic, activePeriods);
                break;
            }
            case OSubjectHideEpicDetails: {
                this.onHideEpicDetails();
                break;
            }
            case OSubjectRedrawDependencyConnections: {
                const { downstreamEpic } = state.value;
                this.onEpicSelected(downstreamEpic, this.activePeriods!);
                break;
            }
        }
    }

    // TODO: Have to redraw all the controllers to update the epics
    // TODO: START HERE

    onDeleteSelectedEpic() {
        const deletedEpic = this.selectedEpic;

        dataStore.RequestDeleteEpic(this.selectedEpic!.ID, () => {
            lib.Observable.notify(OSubjectDidDeleteEpic, {
                source: undefined,
                value: { epic: deletedEpic },
            });

            lib.Observable.notify(OSubjectHideEpicDetails, {
                source: this,
                value: {},
            });
        });
    }

    //Have to redraw re-init the dependency controller
    onDeleteSelectedTeam() {
        dataStore.RequestDeleteTeam(this.selectedEpic!.TeamID, (teams: Team[]) => {
            lib.Observable.notify(OSubjectDidDeleteTeam, {
                source: undefined,
                value: { teams: teams },
            });
        });
    }

    onEpicSelected(epic: Epic, activePeriods: DateMonthPeriod[]) {
        this.selectedEpic = epic;
        this.activePeriods = activePeriods;
        this.detailsView.showEpicDetails(epic, activePeriods);
    }

    onHideEpicDetails() {
        this.selectedEpic = undefined;
        this.activePeriods = undefined;
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

        dataStore.RequestUpdateTeam(this.selectedEpic.TeamID, node.value, (team: Team) => {
            lib.Observable.notify(OSubjectWillUpdateTeamName, {
                source: undefined,
                value: { team: team },
            });
        });
    }

    onInputChangedEpicName(e: Event) {
        if (this.selectedEpic === undefined) {
            return;
        }

        const node = e!.target as HTMLInputElement;
        node.blur();

        dataStore.RequestUpdateEpic(this.selectedEpic.ID, node.value, (epic: Epic) => {
            lib.Observable.notify(OSubjectWillUpdateEpicName, {
                source: undefined,
                value: { epic: epic },
            });
        })
    }
}

