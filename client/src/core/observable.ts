export type ObserverState = {
    source: any;
    value: any;
};

export interface IObserver {
    onUpdate(subject: string, state: ObserverState): void;
}

export class Observable {
    private static readonly singleton = new Observable();

    private readonly subjectSubscribers: { [name: string]: IObserver[] } = {};

    private constructor() {}

    subscribe(subject: string, observer: IObserver) {
        let observerList = this.subjectSubscribers[subject];

        if (observerList == undefined) {
            observerList = [];
            this.subjectSubscribers[subject] = observerList;
        }

        if (observerList.indexOf(observer) == -1) {
            observerList.push(observer);
        }
    }

    unsubscribe(subject: string, observer: IObserver) {
        let observerList = this.subjectSubscribers[subject];

        if (observerList == undefined) {
            return;
        }

        const index = observerList.indexOf(observer);
        if (index == -1) {
            return;
        }

        observerList.splice(index, 1);
    }

    notify(subject: string, state: ObserverState) {
        let observerList = this.subjectSubscribers[subject];

        if (observerList == undefined) {
            return;
        }

        observerList.forEach((o) => {
            o.onUpdate(subject, state);
        });
    }

    static subscribe(subject: string, observer: IObserver) {
        Observable.singleton.subscribe(subject, observer);
    }

    static unsubscribe(subject: string, observer: IObserver) {
        Observable.singleton.unsubscribe(subject, observer);
    }

    static notify(subject: string, state: ObserverState) {
        // console.log("[Observable-notify] subject:", subject, state);

        Observable.singleton.notify(subject, state);
    }
}
