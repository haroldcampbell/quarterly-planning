import * as gtap from "../../../../../../www/dist/js/gtap";
import * as lib from "../../../../../core/lib";
import { IViewController, IScreenController } from "../../../../../core/lib";
import { Epic, TeamEpics } from "../../../_defs";

/** @jsx gtap.$jsx */

import "./epicsView.css"

class EpicsView extends lib.BaseView {
    private content = <div className='epics-container-wrapper' />;
    private epicNames = <ul className="epics-container"></ul>

    viewContent() {
        return this.content;
    }

    initView() {
        this.content.appendChild(this.epicNames);
        super.initView();
    }

    addEpic(epic: Epic): HTMLElement {
        let elm = <div>{epic.Name}</div>;
        this.epicNames.appendChild(<li className="epic-name">{elm}</li>);

        return elm;
    }
}

export class EpicsViewController extends lib.BaseViewController {
    protected _view: lib.IView = new EpicsView(this);

    private teamEpics: TeamEpics;

    constructor(parentController: IViewController | IScreenController, epics: TeamEpics) {
        super(parentController);

        this.teamEpics = epics;
    }

    initView() {
        let epicsView = this.view as EpicsView

        this.teamEpics.Epics.forEach((e) => {
            epicsView.addEpic(e);
        });

        super.initView();
    }
}
