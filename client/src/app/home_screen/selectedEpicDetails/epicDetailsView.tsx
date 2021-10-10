import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";
import { Epic, InputChangeCallback, SelectedEpicDetailsDataOptions } from "../_defs";

/** @jsx gtap.$jsx */

export class EpicDetailsView extends lib.BaseView {
    private epicNameElm = <input data-option={SelectedEpicDetailsDataOptions.EpicName} type='text' />;

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

    public onInputChanged?: InputChangeCallback;

    viewContent() {
        return this.content;
    }

    initView() {
        this.epicNameElm.onchange = (e: Event) => {
            this.onInputChanged?.(e, SelectedEpicDetailsDataOptions.EpicName);
        };

        super.initView();
    }

    onEpicSelected(epic: Epic) {
        (this.epicNameElm as HTMLInputElement).value = epic.Name;
    }
}
