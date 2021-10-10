import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";
import * as dataStore from "../../data/dataStore";

import { Epic } from "../_defs";
import { OSubjectHideEpicDetails } from "./selectedEpicDetailsViewController";

/** @jsx gtap.$jsx */

export class TeamNameDetailsView extends lib.BaseView {
    private closeButton = <button className="round-btn close-details-btn">X</button>;
    private teamNameElm = <h3></h3>;

    private content = <div className='selected-epic-details-container__team-name rows' >
        <div className="row-cell-2">
            <div className="cell">
                <label>TEAM</label>
                {this.teamNameElm}
            </div>
            <div className="cell-right">
                {this.closeButton}
            </div>
        </div>
    </div>;

    viewContent() {
        return this.content;
    }

    initView() {
        this.closeButton.onclick = () => {
            lib.Observable.notify(OSubjectHideEpicDetails, {
                source: this,
                value: {},
            });
        }
        super.initView()
    }

    onEpicSelected(epic: Epic) {
        const team = dataStore.getTeamByID(epic.TeamID);
        (this.teamNameElm as HTMLElement).innerText = team.Name;
    }
}