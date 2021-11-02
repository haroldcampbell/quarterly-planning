import * as gtap from "../../../../www/dist/js/gtap";
import { DialogController } from "../../../core/components/dialogController";
import * as lib from "../../../core/lib";
import * as dataStore from "../../data/dataStore";
import { OSubjectRedrawDependencyConnections } from "../body/dependencyView/epics/teamEpicsViewController";
import { Epic, EpicID, GTapElement, TeamEpicDependency } from "../_defs";

import "./addDependencyDialog.css"

export const OSubjectViewAddDependencyDialog = "view-add-dependency-dialog";

enum DepdendecyType {
    Upstream = 1,
    Downstream
}

const SelectedDataItemCSS = "selected-data-item";

class DependencyTabView extends lib.BaseView {
    private content = <div className="dependency-epics-container" />;
    private epicsSelected = <div className="dependency-epics-counter"></div>;

    ExistingDependencyDetails!: Map<EpicID, TeamEpicDependency>;

    onEpicClickedCallback!: (e: Epic, rowNode: GTapElement) => void;

    viewContent() {
        return this.content;
    }

    initView() {
        super.initView();
    }

    private initBodyView(epics: Epic[], existingDependencies: Map<string, TeamEpicDependency>) {
        this.content.appendChild(<div className="row-container header">
            <div className="dependency-epic-period col-cell-no-wrap"><div className='tiny-dialog-field-caption'>PERIOD</div></div>
            <div className="dependency-team-name"><div className='tiny-dialog-field-caption'>TEAM</div></div>
            <div className="dependency-epic-name"><div className='tiny-dialog-field-caption'>EPICS</div></div>
        </div>);

        epics.forEach((epic) => {
            const rowNode = this.addRow(epic, existingDependencies);
            this.content.appendChild(rowNode);
        });

        this.content.appendChild(this.epicsSelected);
    }

    private addRow(dependentEpic: Epic, existingDependencies: Map<EpicID, TeamEpicDependency>): HTMLElement {
        const selectedIndicatorCSS = existingDependencies.has(dependentEpic.ID) ? SelectedDataItemCSS : "";
        const rowNode = <div className={`row-container data-items ${selectedIndicatorCSS}`}>
            <div className="dependency-epic-period col-cell-no-wrap">W1 Oct - W2 Nov</div>
            <div className="dependency-team-name">Team Name</div>
            <div className="dependency-epic-name">{dependentEpic.Name}</div>
        </div>

        rowNode.onclick = () => { this.onEpicClickedCallback(dependentEpic, rowNode); }
        return rowNode;
    }

    onDataReady(epics: Epic[], existingDependencies: Map<EpicID, TeamEpicDependency>) {
        this.initBodyView(epics, existingDependencies);
        this.updateCounterNode(existingDependencies.size);
    }

    deselectedRowNode(rowNode: GTapElement, itemsSelected: number) {
        rowNode.$removeCSS(SelectedDataItemCSS)
        this.updateCounterNode(itemsSelected);
    }

    selectRowNode(rowNode: GTapElement, itemsSelected: number) {
        rowNode.$appendCSS(SelectedDataItemCSS);
        this.updateCounterNode(itemsSelected);
    }

    updateCounterNode(itemsSelected: number) {
        // this.epicsSelected.innerText = itemsSelected == 1 ? `${itemsSelected} item selected.` : `${itemsSelected} items selected.`
    }
}

class AddDependencyDialogView extends lib.BaseView {
    private tabViewContainerNode = <div className="upstream-downstreams-wrapper-view"></div>
    private dependencyDetailsNode = <div className="dependencies-details-container"></div>
    private content = <div className='add-dependency-dialog-view-container' >
        {this.dependencyDetailsNode}
        {this.tabViewContainerNode}
    </div>;

    DownstreamEpic!: Epic;

    viewContent() {
        return this.content;
    }

    initView() {
        // const epicsNode = <div className="dependency-epics-container" />
        this.dependencyDetailsNode.appendChild(<div className='epic-name-container'>
            <div className='epic-name'>{this.DownstreamEpic.Name}</div>
            <div className='tiny-dialog-field-caption'>SELECTED EPIC</div>
        </div>

        );
        super.initView();
    }

    getTabViewContainer(): GTapElement {
        return this.tabViewContainerNode;
    }

    getTitleViewNode(): HTMLElement {
        return (
            <div className='title-view-container'>
                <h2>Add Dependencies</h2>
            </div>
        );
    }
}

export class AddDependencyDialogController extends lib.BaseViewController {
    protected _view: lib.IView = new AddDependencyDialogView(this);

    private tabViewController = new lib.TabViewController(this);

    DownstreamEpic!: Epic;

    ExistingUpstreamDetails!: Map<EpicID, TeamEpicDependency>;
    ExistingDownstreamDetails!: Map<EpicID, TeamEpicDependency>;

    private selectedUpstreamEpics = new Map<EpicID, Epic>();
    private selectedDownstreamEpics = new Map<EpicID, Epic>();
    private upstreamDependencyTabView = new DependencyTabView(this.parentController);
    private downstreamDependencyTabView = new DependencyTabView(this.parentController);

    private selectedDependencyEpicByType = new Map<DepdendecyType, Map<EpicID, Epic>>();
    private dependencyTeamEpicsByType = new Map<DepdendecyType, Map<EpicID, TeamEpicDependency>>();
    private dependencyViewByType = new Map<DepdendecyType, DependencyTabView>();

    get view(): AddDependencyDialogView {
        return this._view as AddDependencyDialogView;
    }

    initView() {
        this.selectedDependencyEpicByType.set(DepdendecyType.Upstream, this.selectedUpstreamEpics);
        this.selectedDependencyEpicByType.set(DepdendecyType.Downstream, this.selectedDownstreamEpics);

        this.dependencyTeamEpicsByType.set(DepdendecyType.Upstream, this.ExistingUpstreamDetails);
        this.dependencyTeamEpicsByType.set(DepdendecyType.Downstream, this.ExistingDownstreamDetails);

        this.dependencyViewByType.set(DepdendecyType.Upstream, this.upstreamDependencyTabView);
        this.dependencyViewByType.set(DepdendecyType.Downstream, this.downstreamDependencyTabView);

        this.initTabs();
        this.view.DownstreamEpic = this.DownstreamEpic;
        this.view.initView();

        this.populateExistingDependencyDetails(DepdendecyType.Upstream);
        this.populateExistingDependencyDetails(DepdendecyType.Downstream);
        this.fetchEpics();

        super.initView();
    }

    initTabs() {
        this.upstreamDependencyTabView.onEpicClickedCallback = (e: Epic, rowNode: GTapElement) => { this.onEpicClicked(e, rowNode, DepdendecyType.Upstream); }
        this.upstreamDependencyTabView.ExistingDependencyDetails = this.ExistingUpstreamDetails;
        this.upstreamDependencyTabView.initView();

        this.downstreamDependencyTabView.onEpicClickedCallback = (e: Epic, rowNode: GTapElement) => { this.onEpicClicked(e, rowNode, DepdendecyType.Downstream); }
        this.downstreamDependencyTabView.ExistingDependencyDetails = this.ExistingDownstreamDetails;
        this.downstreamDependencyTabView.initView();

        this.tabViewController.addNewTab({
            name: "Upstream (Required)",
            isActive: true,
            tabBodyView: this.upstreamDependencyTabView.viewContent(),
            tabBodyCSS: "upstream-tab-item-body",
        });
        this.tabViewController.addNewTab({
            name: "Downstream (Children)",
            tabBodyView: this.downstreamDependencyTabView.viewContent(),
            tabBodyCSS: "downstream-tab-item-body",
        });
        this.tabViewController.tabView.css = "upstream-downstreams-container-view";
        this.tabViewController.initController();
        this.tabViewController.view.initView();

        this.tabViewController.view.loadSubviews(this.view.getTabViewContainer())
    }

    showDialog() {
        const dialogController = new DialogController(this.parentController);
        dialogController.dialogView.css = "add-dependency-dialog";
        dialogController.dialogView.titleView = this.view.getTitleViewNode();
        dialogController.dialogView.bodyView = this.view.viewContent();
        dialogController.dialogView.hasOkButton = true;
        dialogController.dialogView.okButtonTitle = "Save";
        dialogController.dismissOnContentClicked = false;
        dialogController.dialogView.onOkButtonCallback = () => {
            this.onCreateEpicDependencies();
            dialogController.dismissDialog();
        };
        dialogController.presentDialog();
    }

    async fetchEpics() {
        let epics = await dataStore.getEpics();

        /** Remove downstream epic from the list */
        epics = Array.from(epics);
        const index = epics.indexOf(this.DownstreamEpic);
        epics.splice(index, 1);

        /** Add the rest of the epics */
        this.upstreamDependencyTabView.onDataReady(epics, this.ExistingUpstreamDetails);
        this.downstreamDependencyTabView.onDataReady(epics, this.ExistingDownstreamDetails);
    }

    populateExistingDependencyDetails(dependencyType: DepdendecyType) {
        const selectedEpics = this.selectedDependencyEpicByType.get(dependencyType)!;
        const dependencyTeamEpics = this.dependencyTeamEpicsByType.get(dependencyType)!;

        for (let teamEpic of dependencyTeamEpics.values()) {
            selectedEpics.set(teamEpic.Epic.ID, teamEpic.Epic);
        };
    }

    onEpicClicked(epic: Epic, rowNode: GTapElement, dependencyType: DepdendecyType) {
        const selectedEpics = this.selectedDependencyEpicByType.get(dependencyType)!;
        const depedencyView = this.dependencyViewByType.get(dependencyType)!;

        if (selectedEpics.has(epic.ID)) {
            selectedEpics.delete(epic.ID);
            depedencyView.deselectedRowNode(rowNode, selectedEpics.size);
            return;
        }

        selectedEpics.set(epic.ID, epic);
        depedencyView.selectRowNode(rowNode, selectedEpics.size);
    }

    onCreateEpicDependencies() {
        const upstreamEpicIDs = Array.from(this.selectedUpstreamEpics.values()).map(epic => epic.ID);
        const downstreamEpicIDs = Array.from(this.selectedDownstreamEpics.values()).map(epic => epic.ID);

        dataStore.RequestCreateDependencyConnections(
            this.DownstreamEpic.ID,
            upstreamEpicIDs,
            downstreamEpicIDs,
            () => {
                this.onEpicDependenciesCreated(upstreamEpicIDs, downstreamEpicIDs);
            }
        );
    }

    onEpicDependenciesCreated(upstreamEpicIDs: EpicID[], downstreamEpicIDs: EpicID[]) {
        dataStore.UpdateUpstreamConnections(upstreamEpicIDs, this.DownstreamEpic.ID);
        dataStore.UpdateDownstreamConnections(this.DownstreamEpic.ID, downstreamEpicIDs);

        lib.Observable.notify(OSubjectRedrawDependencyConnections, {
            source: this,
            value: { downstreamEpic: this.DownstreamEpic }
        });
    }
}