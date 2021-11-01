import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";

export class DeleteControlsView extends lib.BaseView {
    private deleteEpicElm = <button className="cell deleteButton">Delete Epic</button>
    private deleteTeamElm = <button className="cell deleteButton">Delete Team</button>
    private content = <div className="selected-epic-details-container__delete-controls rows">
        <div className="row-cell warning">
            <label className="warning" >Danger Zone - Changes here can't be undone</label>
            <div className="cell rows">
                <div className="row-cell button-container">{this.deleteEpicElm}</div>
                <div className="row-cell button-container">{this.deleteTeamElm}</div>
            </div>
        </div>
    </div>

    onDeleteEpicCallback!: () => void;
    onDeleteTeamCallback!: () => void;

    viewContent() {
        return this.content;
    }

    initView() {
        this.deleteEpicElm.onclick = () => { this.onDeleteEpicCallback() };
        this.deleteTeamElm.onclick = () => { this.onDeleteTeamCallback() };

        super.initView();
    }
}