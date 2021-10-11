import * as gtap from "../../../../../www/dist/js/gtap";
import * as lib from "../../../../core/lib";
import * as dataStore from "../../../data/dataStore";
import { Team, TeamEpics, Epic, OSubjectDataStoreReady, OSubjectCreateNewEpic } from "../../_defs";

/** @jsx gtap.$jsx */

import "./dependencyView.css"
import { EpicsViewController } from "./epics/epicsViewController";
import { TeamEpicsViewController } from "./epics/teamEpicsViewController";
import { TeamsNamesViewController } from "./teams/teamNamesController";

class DependencyView extends lib.BaseView {
    private content = <div className='dependency-view-container' />;

    viewContent() {
        return this.content;
    }

    loadSubviews(viewContent: any) {
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
        lib.Observable.subscribe(OSubjectCreateNewEpic, this);

        super.initView();
    }

    loadData() {
        this.teams = dataStore.getTeams();

        this.teams.forEach((t) => {
            let epics = dataStore.getEpicsByTeamID(t.ID);
            const teamEpic = { Team: t, Epics: epics };
            this.teamEpics.push(teamEpic);
        })

        this.teamNamesController.initData(this.teams);
        this.teamEpicsViewController.initData(this.teamEpics);
    }

    onUpdate(subject: string, state: lib.ObserverState): void {
        switch (subject) {
            case OSubjectDataStoreReady: {
                this.loadData();
                break;
            }
            case OSubjectCreateNewEpic: {
                const { epic, epicController, insertionIndex } = state.value;
                this.onCreateNewEpic(epic, epicController, insertionIndex);
                break;
            }
        }
    }

    onCreateNewEpic(epic: Epic, epicController: EpicsViewController, insertionIndex: number) {
        dataStore.addNewEpicAtIndex(epic, insertionIndex + 1);
        epicController.createEpicAtIndex(epic);
        this.teamEpicsViewController.bindEpicToController(epic, epicController);
    }
}
