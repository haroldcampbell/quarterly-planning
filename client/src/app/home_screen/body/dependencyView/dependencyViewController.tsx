import * as gtap from "../../../../../www/dist/js/gtap";
import * as lib from "../../../../core/lib";
import * as dataStore from "../../../data/dataStore";
import { OSubjectViewAddDependencyDialog } from "../../selectedEpicDetails/addDependencyDialogController";
import { Team, TeamEpics, Epic, OSubjectDataStoreReady, OSubjectCreateNewEpicRequest, TeamEpicDependency, EpicID } from "../../_defs";

/** @jsx gtap.$jsx */

import "./dependencyView.css"
import { EpicsViewController } from "./epics/epicsViewController";
import { OSubjectRedrawDependencyConnections, TeamEpicsViewController } from "./epics/teamEpicsViewController";
import { TeamsNamesViewController } from "./teams/teamNamesController";

class DependencyView extends lib.BaseView {
    private content = <div className='dependency-view-container' />;

    viewContent() {
        return this.content;
    }

    loadSubviews(viewContent: any) {
        //  TODO: Replace code below with this call -> lib.LoadSubviews(viewContent);
        this.views.forEach((v) => {
            const vContent = v.viewContent();

            v.loadSubviews(vContent);
            viewContent.appendChild(vContent);
        });
    }

    initView() {
        super.initView();
    }
}

export class DependencyViewController extends lib.BaseViewController implements lib.IObserver {
    protected _view: lib.IView = new DependencyView(this);

    private teamNamesController = new TeamsNamesViewController(this);
    private teamEpicsViewController = new TeamEpicsViewController(this);

    private teams?: Team[];
    private teamEpics: TeamEpics[] = [];

    initView() {
        this.teamNamesController.initController();
        this.teamEpicsViewController.initController();

        this.view.addView(this.teamNamesController.view);
        this.view.addView(this.teamEpicsViewController.view);

        lib.Observable.subscribe(OSubjectDataStoreReady, this);
        lib.Observable.subscribe(OSubjectCreateNewEpicRequest, this);
        lib.Observable.subscribe(OSubjectRedrawDependencyConnections, this);

        super.initView();
    }

    loadData() {
        this.teams = dataStore.getTeams();

        this.teams.forEach((t) => {
            let epics = dataStore.getEpicsByTeamID(t.ID);

            if (epics === undefined) {
                epics = dataStore.initEpicsByTeamID(t.ID);
            }

            const teamEpic = { Team: t, Epics: epics };
            this.teamEpics.push(teamEpic);
        })

        this.teamNamesController.initData(this.teams);
        this.teamEpicsViewController.initData(this.teamEpics);

        // TODO: DELETE ME. AID FOR DEVELOPING DIALOG
        // const lastEpic: Epic = dataStore.getEpicByID("6")!;
        // const upstreamTeamDetails = new Map<EpicID, TeamEpicDependency>();

        // lastEpic!.Upstreams?.forEach((epicID) => {
        //     const upstreamEpic = dataStore.getEpicByID(epicID)!;
        //     const upstreamTeam = dataStore.getTeamByID(upstreamEpic!.TeamID);

        //     upstreamTeamDetails.set(upstreamEpic.ID, {
        //         Team: upstreamTeam,
        //         Epic: upstreamEpic
        //     });
        // })
        // lib.Observable.notify(OSubjectViewAddDependencyDialog, {
        //     source: this,
        //     value: {
        //         selectedEpic: lastEpic!,
        //         upstreamEpics: upstreamTeamDetails,
        //         downstreamEpics: upstreamTeamDetails,
        //     }
        // });
    }

    onUpdate(subject: string, state: lib.ObserverState): void {
        switch (subject) {
            case OSubjectDataStoreReady: {
                this.loadData();
                break;
            }
            case OSubjectCreateNewEpicRequest: {
                const { epic, epicController } = state.value;
                this.onRequestCreateNewEpic(epic, epicController);
                break;
            }
            case OSubjectRedrawDependencyConnections: {
                this.teamEpicsViewController.redrawDependencyConnections();
                break;
            }
        }
    }

    onRequestCreateNewEpic(epic: Epic, epicController: EpicsViewController) {
        dataStore.addNewEpicAtIndex(epic);
        epicController.addNewTeamEpic(epic);
        this.teamEpicsViewController.bindEpicToController(epic, epicController);
        this.teamEpicsViewController.relayoutEpicControllers();
    }
}
