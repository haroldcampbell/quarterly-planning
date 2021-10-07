import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";

/** @jsx gtap.$jsx */

import "./screenNav.css"

export class ScreenNavController extends lib.BaseViewController {
    protected _view: lib.IView = new ScreenNavView(this);
}

class ScreenNavView extends lib.BaseView {
    private content = <div className='screen-nav-container' />;

    viewContent() {
        return this.content;
    }

    initView() {
        const teamsContainer = <div className="teams-container">
            <h1>Teams</h1>
            <button>Add Team</button>
        </div>;

        const epicsContainer = <div className="epics-container">
            <div>
                <h1>Epics: Q2 2021</h1>
            </div>
        </div>

        this.content.appendChild(teamsContainer);
        this.content.appendChild(epicsContainer);

        super.initView();
    }
}
