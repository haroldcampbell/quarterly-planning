import * as gtap from "../../../www/dist/js/gtap";
import * as lib from "../lib";

/** @jsx gtap.$jsx */

/**
 * Tracks the active context menu that is on screen.
 */
let activeContextMenu: ContextMenu | undefined = undefined;

export class ContextMenu extends lib.BaseView {
    private content = (<div className='context-menu-container' />);

    public context?: any;
    private closeButton = (<button className='cm-close-button'>X</button>);
    private titleNode = (<div className='cm-header-title'>Title</div>);

    private headerNode = (
        <div className='cm-header-container'>
            {this.titleNode}
            <div className='cm-closer-container'>{this.closeButton}</div>
        </div>
    );

    private bodyNode = (<div className='cm-body-outer-container'></div>);
    private _containerNode = (<div className='cm-body-container'></div>);

    onDismissCallback?: lib.EventCallback;

    viewContent(): HTMLElement {
        throw new Error("Don't call this method directly to add the contextmenu. Use applyContextMenu instead.");
    }

    set className(css: string) {
        this.content.$appendCSS(css);
    }

    get containerNode(): HTMLElement {
        return this._containerNode;
    }

    initView() {
        super.initView();

        this.content.appendChild(this.headerNode);
        this.content.appendChild(this.bodyNode);
        this.bodyNode.appendChild(this._containerNode);
        this.constrainAppDelegateMouseEvent();

        this.closeButton.onclick = () => {
            this.dismiss();
        };
    }

    /**
     * Prevent triggering the appDelegateMouse event if the mouse clicked
     * happened inside of the context menu.
     */
    private constrainAppDelegateMouseEvent() {
        this.content.onclick = (e: MouseEvent) => {
            gtap.$stopMouseDefaults(e);
        }
    }

    setTitle(title: string) {
        this.titleNode.innerHTML = title;
    }

    addBodyContentNode(node: HTMLElement) {
        this.bodyNode.innerHTML = "";
        this.bodyNode.appendChild(node);
    }

    dismiss() {
        this.content.remove();
        activeContextMenu = undefined;

        if (this.onDismissCallback) {
            this.onDismissCallback();
        }
    }

    applyContextMenu(e: MouseEvent, parent: HTMLElement) {
        // Ensure that the appDelegate doesn't hide this context menu
        gtap.$stopMouseDefaults(e);

        // Dismisses any existing context menus
        // I only want one context menu up at a time
        dismissActiveContextMenu();

        parent.appendChild(this.content);
        activeContextMenu = this; // Make this the active context menu
    }
}

/**
 * Dismisses the active context menu
 */
function dismissActiveContextMenu() {
    if (activeContextMenu != undefined) {
        activeContextMenu.dismiss()
    }
}

/**
 * Dismiss the active context menu if the mouse is clicked outside of an
 * active context menu.
 */
export function contextMenuAppDelegateMouseHandler() {
    dismissActiveContextMenu();
}

/**
 * Dismiss the active context menu if the escape key is pressed.
 * @param e: KeyboardEvent
 */
export function contextMenuAppDelegateKeyboardHandler(e: KeyboardEvent) {
    if (e.key == "Escape") {
        dismissActiveContextMenu()
    }
}

