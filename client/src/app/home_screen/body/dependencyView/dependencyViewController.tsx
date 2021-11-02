import * as gtap from "../../../../../www/dist/js/gtap";
import * as lib from "../../../../core/lib";
import * as dataStore from "../../../data/dataStore";
import { OSubjectViewAddDependencyDialog } from "../../selectedEpicDetails/addDependencyDialogController";
import { OSubjectDidDeleteEpic } from "../../selectedEpicDetails/selectedEpicDetailsViewController";
import { Team, TeamEpics, Epic, OSubjectDataStoreReady, OSubjectCreateNewEpicRequest, TeamEpicDependency, EpicID, OSubjectChangedTeamEpicHeightBounds } from "../../_defs";
import { AllTeamsResponse, CreateTeamResponse, URLAllTeams, URLCreateEpic } from "../../_defsServerResponses";

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

        this.fetchData();

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
    }

    fetchData() {
        lib.apiRequest(
            URLAllTeams,
            (ajax, data: any) => {
                const result: AllTeamsResponse = data.jsonBody;

                dataStore.setTeams(result.Teams);
                dataStore.setEpics(result.Epics);
                dataStore.SetEpicConnections(result.EpicConnections);
                dataStore.createTeamEpics()
                dataStore.wireServerData();
            },
            () => { }
        );
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
        dataStore.RequestCreateTeamEpics(epic, (newEpic) => {
            this.onEpicCreated(newEpic, epicController);
        })
    }

    onEpicCreated(epic: Epic, epicController: EpicsViewController) {
        dataStore.addNewEpicAtIndex(epic);
        epicController.addNewTeamEpic(epic);
        this.teamEpicsViewController.bindEpicToController(epic, epicController);
        this.teamEpicsViewController.relayoutEpicControllers();
    }
}
