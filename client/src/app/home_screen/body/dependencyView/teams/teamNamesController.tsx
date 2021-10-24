import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { GTapElement, OSubjectChangedTeamEpicHeightBounds, OSubjectWillUpdateTeamName, Team, TeamEpics } from "../../../_defs";

/** @jsx gtap.$jsx */

import "./teamNames.css"

class TeamsNamesView extends lib.BaseView {
    private content = <div className='team-names-container-wrapper' />;
    private teamsContainer = <div className="teams-nav-container">
        <button className="add-team-btn">Add Team</button>
    </div>;
    private teamNamesElms = <ul className="team-names-container" />;

    /** TeamID -> element */
    private teamNamesMap: Map<string, GTapElement> = new Map<string, GTapElement>();

    viewContent() {
        return this.content;
    }

    initView() {
        this.content.appendChild(this.teamsContainer);
        this.content.appendChild(this.teamNamesElms);
    }

    createTeamNameElement(team: Team): GTapElement {
        return <div className="team-name-wrapper">
            <div className="team-name">
                {team.Name}
            </div>
        </div>;
    }

    addTeamName(team: Team) {
        let teamNameElm = <li className="team-name-outer-wrapper">
            {this.createTeamNameElement(team)}
        </li>

        this.teamNamesElms.appendChild(teamNameElm);
        this.teamNamesMap.set(team.ID, teamNameElm)
    }

    onUpdateTeamName(team: Team) {
        const teamNameElm = this.teamNamesMap.get(team.ID);

        teamNameElm!.innerText = "";
        teamNameElm!.appendChild(this.createTeamNameElement(team));
    }

    updateTeamNameHeight(teamID: string, height: number) {
        const teamNameElm = this.teamNamesMap.get(teamID)!;

        teamNameElm.$style(`height: ${height - 1}px`); // Subtract 1 pixel to accomadate for the border
    }
}

export class TeamsNamesViewController extends lib.BaseViewController implements lib.IObserver {
    protected _view: lib.IView = new TeamsNamesView(this);
    private teamsNamesView = this.view as TeamsNamesView;

    private teams?: Team[];

    initData(teams?: Team[]) {
        this.teams = teams;

        this.teams?.forEach((t) => {
            this.teamsNamesView.addTeamName(t);
        });
    }

    initController() {
        lib.Observable.subscribe(OSubjectWillUpdateTeamName, this);
        lib.Observable.subscribe(OSubjectChangedTeamEpicHeightBounds, this);

        super.initController();
    }

    initView() {
        super.initView();
    }

    onUpdate(subject: string, state: lib.ObserverState): void {
        switch (subject) {
            case OSubjectWillUpdateTeamName: {
                const { team } = state.value;
                this.onUpdateTeamName(team);
                break;
            }

            case OSubjectChangedTeamEpicHeightBounds: {
                const { teamID, height } = state.value;
                this.updateTeamContainerHeight(teamID, height);
                break;
            }
        }
    }

    private updateTeamContainerHeight(teamID: any, height: any) {
        this.teamsNamesView.updateTeamNameHeight(teamID, height);
    }

    onUpdateTeamName(team: Team) {
        this.teamsNamesView.onUpdateTeamName(team);
    }
}
