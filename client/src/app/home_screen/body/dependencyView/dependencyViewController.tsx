import * as gtap from "../../../../../www/dist/js/gtap";
import * as lib from "../../../../core/lib";
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
        this.teams = [
            { Name: "Team 1" },
            { Name: "Team 2" },
            { Name: "Team 3" },
            { Name: "Team 4" },
            { Name: "Team 5" },
            { Name: "Team 6" },
            { Name: "Team 7" },
            { Name: "Team 8" },
        ];

        let epics: { [key: number]: Epic[] } = {
            0: [
                { Name: "Epic IL1" },
                { Name: "Epic IL2" },
                { Name: "Epic IL3" },
                { Name: "Epic IL4" },
            ],
            1: [
                { Name: "Epic P1" },
                { Name: "Epic P2" },
            ],
            2: [
                { Name: "Epic SME1" },
                { Name: "Epic SME2" },
                { Name: "Epic SME3" },
                { Name: "Epic SME4" },
            ],
            3: [
                { Name: "Epic M1" },
                { Name: "Epic M2" },
                { Name: "Epic M3" },
            ],
            4: [
                { Name: "Epic DW1" },
            ],
            5: [
                { Name: "Epic CRM1" },
                { Name: "Epic CRM2" },
                { Name: "Epic CRM3" },
                { Name: "Epic CMR4" },
                { Name: "Epic CRM5" },
                { Name: "Epic CRM6" },
                { Name: "Epic CRM7" },
            ],
            6: [
                { Name: "Epic ACO1" },
                { Name: "Epic ACO2" },
                { Name: "Epic ACO3" },
                { Name: "Epic ACO4" },
            ],
            7: [
                { Name: "Epic CN1" },
                { Name: "Epic CN2" },
            ],
        };

        this.teams.forEach((t, index) => {
            let teamEpic = { Team: t, Epics: epics[index] };
            this.teamEpics.push(teamEpic);
        })

        this.teamNamesController.initData(this.teams, this.teamEpics);
        this.teamEpicsViewController.initData(this.teams, this.teamEpics);
    }
}
