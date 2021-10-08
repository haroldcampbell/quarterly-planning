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
                { ID: 1, Name: "Epic IL1" },
                { ID: 2, Name: "Epic IL2", Upstreams: [1] },
                { ID: 3, Name: "Epic IL3" },
                { ID: 4, Name: "Epic IL4" },
            ],
            1: [
                { ID: 5, Name: "Epic P1" },
                { ID: 6, Name: "Epic P2" },
            ],
            2: [
                { ID: 7, Name: "Epic SME1" },
                { ID: 8, Name: "Epic SME2" },
                { ID: 9, Name: "Epic SME3", Upstreams: [2, 6, 18, 23] },
                { ID: 10, Name: "Epic SME4" },
            ],
            3: [
                { ID: 11, Name: "Epic M1" },
                { ID: 12, Name: "Epic M2" },
                { ID: 13, Name: "Epic M3" },
            ],
            4: [
                { ID: 14, Name: "Epic DW1" },
            ],
            5: [
                { ID: 15, Name: "Epic CRM1" },
                { ID: 16, Name: "Epic CRM2" },
                { ID: 17, Name: "Epic CRM3" },
                { ID: 18, Name: "Epic CMR4" },
                { ID: 19, Name: "Epic CRM5" },
                { ID: 20, Name: "Epic CRM6" },
                { ID: 21, Name: "Epic CRM7", Upstreams: [9] },
            ],
            6: [
                { ID: 22, Name: "Epic ACO1" },
                { ID: 23, Name: "Epic ACO2", Upstreams: [11, 15] },
                { ID: 24, Name: "Epic ACO3" },
                { ID: 25, Name: "Epic ACO4" },
            ],
            7: [
                { ID: 26, Name: "Epic CN1" },
                { ID: 27, Name: "Epic CN2" },
            ],
        };

        this.teams.forEach((t, index) => {
            let teamEpic = { Team: t, Epics: epics[index] };
            this.teamEpics.push(teamEpic);
        })

        this.teamNamesController.initData(this.teams);
        this.teamEpicsViewController.initData(this.teamEpics);
    }
}
