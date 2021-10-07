import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { Team, TeamEpics } from "../../../_defs";

/** @jsx gtap.$jsx */

import "./teamNames.css"


class TeamsNamesView extends lib.BaseView {
    private content = <div className='team-names-container-wrapper' />;
    private teamNamesElms = <ul className="team-names-container" />;

    viewContent() {
        return this.content;
    }

    initView() {
        this.content.appendChild(this.teamNamesElms);
    }

    addTeamName(team: Team): HTMLElement {
        let elm = <div>{team.Name}</div>;
        this.teamNamesElms.appendChild(<li className="team-name">{elm}</li>);

        return elm;
    }
}

export class TeamsNamesViewController extends lib.BaseViewController {
    protected _view: lib.IView = new TeamsNamesView(this);

    private teams?: Team[];

    initData(teams?: Team[], teamEpics?: TeamEpics[]) {
        this.teams = teams;

        let teamsNamesView = this.view as TeamsNamesView
        this.teams?.forEach((t) => {
            teamsNamesView.addTeamName(t);
        });
    }

    initView() {
        super.initView();
    }
}
