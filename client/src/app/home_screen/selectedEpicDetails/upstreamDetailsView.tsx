import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";
import * as dataStore from "../../data/dataStore";

import { Epic, TeamEpicDependency } from "../_defs";
import { DependencyTableView } from "./dependencyTableView";
import { OSubjectViewUpstreamDependencyDialog, UpstreamDependencyDialogController } from "./upstreamDependencyDialogController";

/** @jsx gtap.$jsx */

export class UpstreamDetailsView extends lib.BaseView {
    private dependencyTableView = new DependencyTableView(this.parentController);

    private dependencyCountElm = <h3></h3>;
    private dependencyWrapper = <div className="dependency-wrapper-container"></div>;
    private button = <button className="flat-btn add-upstream-dep">+</button>

    private content = <div className='selected-epic-details-container__upstream rows' >
        <div className="row-cell">
            <div className="cell">

                <div className="rows">
                    <div className="row-cell-2">
                        <div className="cell dependency-info">
                            {this.dependencyCountElm}
                            <label><span>UPSTERAM</span><br /><span>DEPENDENCIES</span></label>
                        </div>
                        <div className="cell-right">
                            {this.button}
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

    private selectedEpic!: Epic;
    private upstreamTeamDetails = new Map<string, TeamEpicDependency>();

    viewContent() {
        return this.content;
    }

    loadSubviews(viewContent: any) {
        lib.LoadSubviews(this.views, viewContent);
    }

    initView() {
        this.dependencyTableView.initView();

        this.dependencyWrapper.appendChild(<div>
            {this.dependencyTableView.viewContent()}
        </div>)

        this.button.onclick = () => { this.onShowDependencyDialog() };
        super.initView();
    }

    onShowDependencyDialog() {
        lib.Observable.notify(OSubjectViewUpstreamDependencyDialog, {
            source: this,
            value: {
                selectedEpic: this.selectedEpic,
                dependencies: this.upstreamTeamDetails,
            }
        });
    }

    onEpicSelected(epic: Epic) {
        this.dependencyTableView.clearTableRows();
        this.selectedEpic = epic;
        this.upstreamTeamDetails = new Map<string, TeamEpicDependency>();

        if (epic.Upstreams === undefined) {
            this.dependencyCountElm.innerText = 0;
            return;
        }

        this.dependencyCountElm.innerText = epic.Upstreams!.length;

        epic.Upstreams!.forEach((epicID) => {
            const upstreamEpic = dataStore.getEpicByID(epicID)!;
            const upstreamTeam = dataStore.getTeamByID(upstreamEpic!.TeamID);

            this.upstreamTeamDetails.set(upstreamEpic.ID, {
                Team: upstreamTeam,
                Epic: upstreamEpic
            });

            this.dependencyTableView.addTableRows(true, upstreamTeam.Name, upstreamEpic.Name)
        })

        this.dependencyWrapper.appendChild(<div>
            {this.dependencyTableView.viewContent()}
        </div>)

        // TODO: This doesn't include the indirect upstreams
        // create a function to walk the graph, marking visited nodes
        // as the graph is traversed
    }
}