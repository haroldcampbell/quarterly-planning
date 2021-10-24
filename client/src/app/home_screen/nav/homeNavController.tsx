import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";

/** @jsx gtap.$jsx */

import "./homeNav.css"

export class HomeNavController extends lib.BaseViewController {
    protected _view: lib.IView = new HomeNavView(this);
}

class HomeNavView extends lib.BaseView {
    private content = <div className='home-nav-container' />;

    viewContent() {
        return this.content;
    }

    initView() {
        const epicsContainer = <div className="epics-container">
            <div>
                <h2>Epics: Q2 2021</h2>
            </div>
        </div>

        // this.content.appendChild(teamsContainer);
        this.content.appendChild(epicsContainer);

        super.initView();
    }
}
