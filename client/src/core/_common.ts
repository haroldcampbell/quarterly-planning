declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
}

// export interface IHTMLNode {
//     appendChild(node: any): void;
// }

export type EventCallback = (e?: any) => void;
export type ControllerDictionary<T> = { [name: string]: T };
export type ViewDictionary<T> = { [name: string]: T };

// -----------------------------------------------------------------------------

export interface IView {
    readonly views: IView[];
    readonly parentController: IViewController | IScreenController;

    initView(): void;
    viewContent(): HTMLElement | undefined;
    addView(subView: IView): void;
    loadSubviews(viewContent: any): void;
}

// -----------------------------------------------------------------------------

export interface IViewController {
    readonly view: IView;
    readonly parentController: IViewController | IScreenController;

    initController(): void;
    initView(): void;
}

// -----------------------------------------------------------------------------

export interface IScreen {
    readonly views: IView[];
    readonly parentController: IScreenController;

    initScreen(contextData?: any): void;
    screenContent(): any;
    addView(subView: IView): void;
    loadSubviews(viewContent: any): void;
}

// -----------------------------------------------------------------------------

export interface IScreenController {
    readonly screen: IScreen;
    readonly parentContainer: any;

    initController(contextData?: any): void;
    initScreen(contextData?: any): void;
    loadScreen(): void;
}
