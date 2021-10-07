import * as gtap from "../../../www/dist/js/gtap";
import * as lib from "../lib";
import { ScreenTransitions } from "../screenTransition";

/** @jsx gtap.$jsx */

class DialogView extends lib.BaseView {
    private content!: HTMLElement;

    title?: string;
    titleView?: HTMLElement;
    bodyView?: HTMLElement;

    /**
     * Callback for the Ok button.
     *
     * @example
     *      dialogController.dialogView.hasOkButton = true;
     *      dialogController.dialogView.onOkButtonCallback = () => {
     *           console.log("clicked ok");
     *           dialogController.dismissDialog();
     *      };
     */
    onOkButtonCallback?: lib.EventCallback;

    didClickOkButton?: lib.EventCallback;

    /** Default is provided by the controller */
    onDismissCallback?: lib.EventCallback;

    /** Set to true to enable the Ok button */
    hasOkButton: boolean = false;
    okButtonTitle?: string = "Ok";

    private _css?: string = "dialog-view";

    private readonly dismissButton = (
        <div className='btn'>
            <span>Dismiss</span>
        </div>
    );

    set css(newCss: string) {
        this._css = `dialog-view ${newCss}`;
    }

    initView() {
        this.dismissButton.onclick = (e: MouseEvent) => {
            gtap.$stopMouseDefaults(e);
            if (this.onDismissCallback) {
                this.onDismissCallback();
            }
        };

        this.content = (
            <div className='dialog-container'>
                <div className='dialog-view-container'>
                    <div className={this._css}>
                        {this.initDialogTitle()}
                        <div className='dialog-body'>{this.bodyView}</div>
                        <div className='dialog-buttons-container'>
                            {this.initButtonsView()}
                        </div>
                    </div>
                </div>
            </div>
        );

        super.initView();
    }

    initDialogTitle(): HTMLElement {
        if (this.titleView) {
            return (
                <div className='dialog-title-container'>{this.titleView}</div>
            );
        }

        return (
            <div className='dialog-title'>
                <h1>{this.title}</h1>
            </div>
        );
    }

    initButtonsView(): HTMLElement {
        if (this.hasOkButton) {
            const okButton = (
                <div className='btn'>
                    <span>{this.okButtonTitle}</span>
                </div>
            );

            okButton.onclick = (e: MouseEvent) => {
                gtap.$stopMouseDefaults(e);
                if (this.onOkButtonCallback) {
                    this.onOkButtonCallback();
                }
                if (this.didClickOkButton) {
                    this.didClickOkButton();
                }
            };

            return (
                <div className='dialog-buttons'>
                    {this.dismissButton}
                    {okButton}
                </div>
            );
        }

        return (
            <div className='dialog-buttons dialog-buttons-dismiss-only'>
                {this.dismissButton}
            </div>
        );
    }

    viewContent(): HTMLElement {
        return this.content;
    }
}

export class DialogController extends lib.BaseViewController {
    protected _view: lib.IView = new DialogView(this);

    onDialogPresented?: lib.EventCallback;
    didClickOkButton?: lib.EventCallback;

    /**
     * Controls if the dialog is dismissed when the content is clicked.
     */
    dismissOnContentClicked = true;

    get dialogView(): DialogView {
        return this._view as DialogView;
    }

    /** Used to initialize the dialogView.bodyView */
    protected initBodyView() { }

    /** Used to configure the dialog by sub-classes */
    protected initDialog() { }

    /**
     * Presents the dialog to the user.
     *
     * This method should only be called after the dialog has been configured.
     *
     * @example
     *      const dialogController = new DialogController(this.parentController);
     *
     *      dialogController.dialogView.css = "upload-csv-file-dialog";
     *      dialogController.dialogView.title = "Upload CSV File";
     *      dialogController.dialogView.bodyView = lib.uploadForm;
     *
     *      dialogController.presentDialog();
     */
    presentDialog() {
        this.initDialog();
        this.initBodyView();
        this.dialogView.initView();

        const dialogContent = this.dialogView.viewContent();
        const screenContent = ScreenTransitions.currentScreen.screenContent();

        dialogContent.onclick = (e: MouseEvent) => {
            if (!this.dismissOnContentClicked) {
                return
            }
            gtap.$stopMouseDefaults(e);
            this.dismissDialog();
        };

        this.dialogView.onDismissCallback = () => {
            screenContent.removeChild(dialogContent);
        };

        this.dialogView.didClickOkButton = this.didClickOkButton;

        screenContent.appendChild(dialogContent);

        if (this.onDialogPresented) {
            this.onDialogPresented();
        }
    }

    dismissDialog() {
        if (this.dialogView.onDismissCallback) {
            this.dialogView.onDismissCallback();
        }
    }
}
