import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";

/** @jsx gtap.$jsx */

export class EpicDetailsView extends lib.BaseView {
    private content = <div className='selected-epic-details-container__epic rows' >
        <div className="row-cell">
            <div className="cell">
                <label>SELECTED EPIC</label>
                <h3>Epic SME3</h3>
            </div>
        </div>
        <div className="row-cell">
            <div className="cell">
                <label>ESTIMATED SIZE</label>
                <h3>Medium</h3>
            </div>
        </div>
        <div className="row-cell-2">
            <div className="cell">
                <label>EXPECTED STARTED</label>
                <h3>Oct W3</h3>
            </div>
            <div className="cell">
                <label>PROJECTED END</label>
                <h3>Nov W2</h3>
            </div>
        </div>
    </div>;

    viewContent() {
        return this.content;
    }
}
