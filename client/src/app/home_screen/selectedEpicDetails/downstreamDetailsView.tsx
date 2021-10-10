import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";
import * as dataStore from "../../data/dataStore";

import { Epic } from "../_defs";
import { DependencyTableView } from "./dependencyTableView";

/** @jsx gtap.$jsx */

export class DownstreamDetailsView extends lib.BaseView {
    private dependencyTableView = new DependencyTableView(this.parentController);

    private dependencyCountElm = <h3></h3>;
    private dependencyWrapper = <div className="dependency-wrapper-container"></div>;

    private content = <div className='selected-epic-details-container__downstream rows' >
        <div className="row-cell">
            <div className="cell">
                <div className="rows">
                    <div className="row-cell-2">
                        <div className="cell dependency-info">
                            {this.dependencyCountElm}
                            <label><span>DOWNSTREAM</span><br /><span>DEPENDENCIES</span></label>
                        </div>
                        <div className="cell-right">
                            <button className="flat-btn add-downstream-dep">+</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="row-cell">
            <div className="cell">
                {this.dependencyWrapper}
            </div>
        </div>
    </div>;

    loadSubviews(viewContent: any) {
        lib.LoadSubviews(this.views, viewContent);
    }

    viewContent() {
        return this.content;
    }

    initView() {
        this.dependencyTableView.initView();

        this.dependencyWrapper.appendChild(<div>
            {this.dependencyTableView.viewContent()}
        </div>)

        super.initView();
    }

    onEpicSelected(epic: Epic) {
        const downstreamEpicIDs = dataStore.getDownstreamEpicsByID(epic.ID);

        this.dependencyTableView.clearTableRows();

        if (downstreamEpicIDs === undefined) {
            this.dependencyCountElm.innerText = 0;
            return
        }

        this.dependencyCountElm.innerText = downstreamEpicIDs!.length;

        downstreamEpicIDs!.forEach((epicID) => {
            const downstreamEpic = dataStore.getEpicByID(epicID)!;
            const downstreamTeam = dataStore.getTeamByID(downstreamEpic!.TeamID);

            this.dependencyTableView.addTableRows(true, downstreamTeam.Name, downstreamEpic.Name)
        })

        this.dependencyWrapper.appendChild(<div>
            {this.dependencyTableView.viewContent()}
        </div>)
    }
}