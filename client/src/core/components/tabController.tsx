import * as gtap from "../../../www/dist/js/gtap";
import * as lib from "../lib";

/** @jsx gtap.$jsx */

export interface TabItem {
    name?: string;
    isActive?: boolean;
    tabBodyView?: lib.BaseView | HTMLElement;
    tabBodyCSS?: string;
}

export class TabItemView extends lib.BaseView {
    readonly tabItem: TabItem;

    tabButtonView: any;
    tabBodyView: any;

    constructor(
        parent: lib.IViewController | lib.IScreenController,
        tabItem: TabItem
    ) {
        super(parent);
        this.tabItem = tabItem;

        this.tabButtonView = gtap.$id(
            <div>
                <div className='tab-item-button-text-container'>
                    <span className='tab-button-text'>{this.tabItem.name}</span>
                </div>
            </div>
        );

        this.tabBodyView = gtap.$id(<div>{this.tabItem.tabBodyView}</div>);
        this.isActive = this.tabItem.isActive as boolean;
    }

    tabButtonContent() {
        return this.tabButtonView;
    }

    tabBodyContent() {
        return this.tabBodyView;
    }

    set isActive(active: boolean) {
        this.tabItem.isActive = active;

        const defaultBodyCSS = `tab-item-body ${
            this.tabItem.tabBodyCSS! || ""
        }`.trim();
        this.tabBodyView.$class(
            this.tabItem.isActive
                ? `${defaultBodyCSS} active-tab-item-body`
                : defaultBodyCSS
        );

        this.tabButtonView.$class(
            this.tabItem.isActive
                ? "tab-item-button active-tab-item-button"
                : "tab-item-button"
        );
    }
}

export class TabView extends lib.BaseView {
    tabButtonsContainer = (
        <div className='tab-view-tab-buttons-container'></div>
    );

    tabBodyContainer = (<div className='tab-view-body-container'></div>);
    tabs: TabItemView[] = [];

    private _css: string = "";

    set css(newCss: string) {
        this._css = newCss;
    }

    viewContent() {
        return <div className={"tab-view-container " + this._css}></div>;
    }

    activateTab(tabItemView: TabItemView) {
        this.tabs.forEach((tab) => {
            tab.isActive = false;
        });

        tabItemView.isActive = true;
    }

    loadSubviews(viewContent: any) {
        this.tabs.forEach((tab) => {
            const buttonContent = tab.tabButtonContent();

            buttonContent.onclick = () => {
                this.activateTab(tab);
            };
            this.tabButtonsContainer.appendChild(buttonContent);

            const bodyContent = tab.tabBodyContent();
            this.tabBodyContainer.appendChild(bodyContent);
        });

        viewContent.appendChild(this.tabButtonsContainer);
        viewContent.appendChild(this.tabBodyContainer);
    }
}

export class TabViewController extends lib.BaseViewController {
    protected _view: lib.IView = new TabView(this);

    get tabView(): TabView {
        return this._view as TabView;
    }

    initView() {}

    addNewTab(tabItem: TabItem) {
        const tabItemView = new TabItemView(this.parentController, tabItem);

        this.tabView.tabs.push(tabItemView);
    }
}
