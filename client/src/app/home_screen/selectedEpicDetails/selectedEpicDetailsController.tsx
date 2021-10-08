import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";

/** @jsx gtap.$jsx */


import "./selectedEpicDetailsView.css"

class SelectedEpicDetailsView extends lib.BaseView {
    private content = <div className='selected-epic-details-view-container' ></div>;

    viewContent() {
        return this.content;
    }
}

export class SelectedEpicDetailsController extends lib.BaseViewController {
    protected _view: lib.IView = new SelectedEpicDetailsView(this);
}

