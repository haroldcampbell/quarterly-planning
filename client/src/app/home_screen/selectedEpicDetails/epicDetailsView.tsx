import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";
import { Epic } from "../_defs";

/** @jsx gtap.$jsx */

export class EpicDetailsView extends lib.BaseView {
    private epicNameElm = <h3></h3>;
    private content = <div className='selected-epic-details-container__epic rows' >
        <div className="row-cell">
            <div className="cell">
                <label>SELECTED EPIC</label>
                {this.epicNameElm}
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

    onEpicSelected(epic: Epic) {
        (this.epicNameElm as HTMLElement).innerText = epic.Name;
    }
}
