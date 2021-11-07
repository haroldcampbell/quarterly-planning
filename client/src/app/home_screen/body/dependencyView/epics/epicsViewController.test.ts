

const sum = (a:number, b:number) => a + b;

test("foo", () => {
    expect(sum(1, 2)).toBe(3);
})