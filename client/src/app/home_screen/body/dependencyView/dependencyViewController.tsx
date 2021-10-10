import * as gtap from "../../../../../www/dist/js/gtap";
import * as lib from "../../../../core/lib";
import * as dataStore from "../../../data/dataStore";
import { Team, TeamEpics, Epic } from "../../_defs";

/** @jsx gtap.$jsx */

import "./dependencyView.css"
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

export class DependencyViewController extends lib.BaseViewController {
    protected _view: lib.IView = new DependencyView(this);

    private teamNamesController = new TeamsNamesViewController(this);
    private teamEpicsViewController = new TeamEpicsViewController(this);

    private teams?: Team[];
    private teamEpics: TeamEpics[] = [];

    initView() {
        this.teamNamesController.initController();
        this.teamEpicsViewController.initController();

        this.loadData();

        this.view.addView(this.teamNamesController.view);
        this.view.addView(this.teamEpicsViewController.view);

        super.initView();
    }

    loadData() {
        this.teams = dataStore.getTeams();
        let epics = dataStore.getEpicsByTeam();

        this.teams.forEach((t, index) => {
            const teamEpic = { Team: t, Epics: epics.get(index) };
            this.teamEpics.push(teamEpic);
        })

        this.teamNamesController.initData(this.teams);
        this.teamEpicsViewController.initData(this.teamEpics);
    }
}
