import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";

/** @jsx gtap.$jsx */

export class TeamNameDetailsView extends lib.BaseView {
    private content = <div className='selected-epic-details-container__team-name rows' >
        <div className="row-cell-2">
            <div className="cell">
                <label>TEAM</label>
                <h3>SME Acc. Opening</h3>
            </div>
            <div className="cell-right">
                <button className="round-btn close-details-btn">X</button>
            </div>
        </div>
    </div>;

    viewContent() {
        return this.content;
    }
}