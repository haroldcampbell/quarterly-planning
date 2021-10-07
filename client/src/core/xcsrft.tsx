let _XCSRFToken: string = "";

export function getXCSRFToken(): string {
    return _XCSRFToken;
}
export function initXCSRFToken() {
    const formNode = document.getElementById("csrf-auth-form");
    const arr = formNode?.children as any;

    Array.from(arr).forEach((i: unknown) => {
        const node = i as { name: string; value: string };
        if (node.name.toLowerCase() === "groundtap_csrf_token") {
            _XCSRFToken = node.value;
            return;
        }
    });
}