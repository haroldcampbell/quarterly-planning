// import * as gtap from "../../../../www/dist/js/gtap";
// import { DialogController } from "../../../core/components/dialogController";
// import * as lib from "../../../core/lib";
// import * as dataStore from "../../data/dataStore";
// import { OSubjectRedrawDependencyConnections } from "../body/dependencyView/epics/teamEpicsViewController";
// import { Epic, GTapElement, TeamEpicDependency } from "../_defs";

// import "./upstreamDependencyDialog.css"
// export const OSubjectViewUpstreamDependencyDialog = "view-upstream-dependency-dialog";

// class UpstreamDependencyDialogView extends lib.BaseView {
//     private content = <div className='upstream-dependency-dialog-view-container' />;
//     private epicsSelected = <div className="dependency-epics-counter"></div>;

//     DownstreamEpic!: Epic;
//     Dependencies!: Map<string, TeamEpicDependency>;

//     onEpicClickedCallback!: (e: Epic, rowNode: GTapElement) => void;

//     viewContent() {
//         return this.content;
//     }

//     initView() {
//         super.initView();
//     }

//     getTitleViewNode(): HTMLElement {
//         return (
//             <div className='title-view-container'>
//                 <h2>Add Upstream Dependencies</h2>
//                 <img src="/assets/images/dialog-upstream-indication.svg" alt="" />
//             </div>
//         );
//     }

//     initBodyView(epics: Epic[], existingDependencies: Map<string, TeamEpicDependency>) {
//         const epicsNode = <div className="dependency-epics-container" />
//         const bodyNode = <div className="depdencies-body-container">
//             <div className='epic-name-container'>
//                 <div className='tiny-dialog-field-caption'>SELECTED EPIC (CHILD)</div>
//                 <div className='epic-name'>{this.DownstreamEpic.Name}</div>
//             </div>
//             {epicsNode}
//             {this.epicsSelected}
//         </div>

//         epicsNode.appendChild(<div className="row-container header">
//             <div className="dependency-epic-period col-cell-no-wrap"><div className='tiny-dialog-field-caption'>PERIOD</div></div>
//             <div className="dependency-team-name"><div className='tiny-dialog-field-caption'>TEAM</div></div>
//             <div className="dependency-epic-name"><div className='tiny-dialog-field-caption'>EPICS (REQUIRED)</div></div>
//         </div>);

//         epics.forEach((epic) => {
//             const rowNode = this.addRow(epic, existingDependencies);
//             epicsNode.appendChild(rowNode);
//         });

//         this.content.appendChild(bodyNode);
//     }

//     addRow(dependentEpic: Epic, existingDependencies: Map<string, TeamEpicDependency>): HTMLElement {
//         const selectedIndicatorCSS = existingDependencies.has(dependentEpic.ID) ? "selected" : "";
//         const rowNode = <div className={`row-container data-items ${selectedIndicatorCSS}`}>
//             <div className="dependency-epic-period col-cell-no-wrap">W1 Oct - W2 Nov</div>
//             <div className="dependency-team-name">Team Name</div>
//             <div className="dependency-epic-name">{dependentEpic.Name}</div>
//         </div>

//         rowNode.onclick = () => { this.onEpicClickedCallback(dependentEpic, rowNode); }
//         return rowNode;
//     }

//     onDataReady(epics: Epic[], existingDependencies: Map<string, TeamEpicDependency>) {
//         this.initBodyView(epics, existingDependencies);
//         this.updateCounterNode(existingDependencies.size);
//     }

//     deselectedRowNode(rowNode: GTapElement, itemsSelected: number) {
//         rowNode.$removeCSS("selected")
//         this.updateCounterNode(itemsSelected);
//     }

//     selectRowNode(rowNode: GTapElement, itemsSelected: number) {
//         rowNode.$appendCSS("selected");
//         this.updateCounterNode(itemsSelected);
//     }

//     updateCounterNode(itemsSelected: number) {
//         this.epicsSelected.innerText = itemsSelected == 1 ? `${itemsSelected} item selected.` : `${itemsSelected} items selected.`
//     }
// }

// export class UpstreamDependencyDialogController extends lib.BaseViewController {
//     protected _view: lib.IView = new UpstreamDependencyDialogView(this);

//     DownstreamEpic!: Epic;
//     Dependencies!: Map<string, TeamEpicDependency>;

//     private selectedEpics = new Map<string, Epic>();

//     get view(): UpstreamDependencyDialogView {
//         return this._view as UpstreamDependencyDialogView;
//     }

//     initView() {
//         this.view.DownstreamEpic = this.DownstreamEpic;
//         this.view.Dependencies = this.Dependencies;
//         this.view.onEpicClickedCallback = (e: Epic, rowNode: GTapElement) => { this.onEpicClicked(e, rowNode); }
//         this.view.initView();

//         this.fetchEpics();

//         super.initView();
//     }

//     showDialog() {
//         const dialogController = new DialogController(this.parentController);
//         dialogController.dialogView.css = "upstream-dependency-dialog";
//         dialogController.dialogView.titleView = this.view.getTitleViewNode();
//         dialogController.dialogView.bodyView = this.view.viewContent();
//         dialogController.dialogView.hasOkButton = true;
//         dialogController.dialogView.okButtonTitle = "Save";
//         dialogController.dismissOnContentClicked = false;
//         dialogController.dialogView.onOkButtonCallback = () => {
//             this.onCreateEpicDependencies();
//             dialogController.dismissDialog();
//         };
//         dialogController.presentDialog();
//     }

//     async fetchEpics() {
//         let epics = await dataStore.getEpics();

//         for (let teamEpic of this.Dependencies.values()) {
//             this.selectedEpics.set(teamEpic.Epic.ID, teamEpic.Epic);
//         };

//         /** Remove downstream epic from the list */
//         epics = Array.from(epics);
//         const index = epics.indexOf(this.DownstreamEpic);
//         epics.splice(index, 1);

//         /** Add the rest of the epics */
//         this.view.onDataReady(epics, this.Dependencies);
//     }

//     onEpicClicked(epic: Epic, rowNode: GTapElement) {
//         if (this.selectedEpics.has(epic.ID)) {
//             this.selectedEpics.delete(epic.ID);
//             this.view.deselectedRowNode(rowNode, this.selectedEpics.size);
//             return;
//         }

//         this.selectedEpics.set(epic.ID, epic);
//         this.view.selectRowNode(rowNode, this.selectedEpics.size);
//     }

//     onCreateEpicDependencies() {
//         dataStore.updateUpstreamEpics(this.DownstreamEpic, Array.from(this.selectedEpics.values()));
//         lib.Observable.notify(OSubjectRedrawDependencyConnections, {
//             source: this,
//             value: { downstreamEpic: this.DownstreamEpic }
//         });
//     }
// }