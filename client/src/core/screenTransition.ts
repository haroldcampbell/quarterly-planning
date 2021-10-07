import { IScreen, IScreenController } from "./_common";

export interface IScreenControllerType {
    new (root: any): IScreenController;
}

export interface TransitionState<T> {
    _stateName?: T;
    location?: string;
    locationPrefix?: string;
    screenController: IScreenControllerType;
}

export type LocationPath = { location: string };

export class ScreenTransitions<T> {
    private static readonly singleton = new ScreenTransitions();
    private static _currentScreen: IScreen;

    private _rootContainer: any;
    private instances: { [name: string]: any } = {};
    private transitions: { [name: string]: TransitionState<T> } = {};
    private transitionStates: TransitionState<T>[] = [];

    static get currentScreen(): IScreen {
        return ScreenTransitions._currentScreen;
    }

    static setRootContainer(rootContainer: any) {
        ScreenTransitions.singleton._rootContainer = rootContainer;
    }

    static rootContainer(): any {
        return ScreenTransitions.singleton._rootContainer;
    }

    static addTransition<T extends string>(name: T, state: TransitionState<T>) {
        state._stateName = name;
        ScreenTransitions.singleton.transitions[name] = state;
        ScreenTransitions.singleton.transitionStates.push(state);
    }

    static transitionTo<T extends string>(
        transitionName: T,
        container: any,
        contextData?: LocationPath | any
    ) {
        let instance = ScreenTransitions.singleton.instances[transitionName];

        if (instance === undefined) {
            const transition =
                ScreenTransitions.singleton.transitions[transitionName];

            if (transition === undefined) {
                alert("TODO: Add error or invalid transition name");
                return;
            }

            instance = new transition.screenController(container);
            ScreenTransitions.singleton.instances[transitionName] = instance;
        }

        container.innerHTML = "";
        instance.initController(contextData);

        ScreenTransitions._currentScreen = instance.screen;
    }

    private static transitionToState<T extends string>(
        state: TransitionState<T>,
        context: LocationPath
    ) {
        if (state._stateName) {
            ScreenTransitions.transitionTo(
                state._stateName,
                ScreenTransitions.rootContainer(),
                context
            );
        } else {
            console.trace(
                "[transitionToState] Unable to transition to state: ",
                state
            );
        }
    }

    static transitionToLocation<T extends string>() {
        const path = window.location.pathname;

        let targetStates = ScreenTransitions.singleton.transitionStates.filter(
            (state) => {
                if (state.location == path) {
                    return true;
                } else if (
                    state.locationPrefix &&
                    path.startsWith(state.locationPrefix)
                ) {
                    return true;
                }

                return false;
            }
        );

        if (targetStates.length > 0) {
            ScreenTransitions.transitionToState<T>(
                targetStates[0] as TransitionState<T>,
                {
                    location: path,
                }
            );
            return;
        }

        // console.log(
        //     "[transitionToLocation] Unable to transition to location: ",
        //     path
        // );
    }
}
