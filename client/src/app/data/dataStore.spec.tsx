/**
 * @jest-environment jsdom
 */

import { initWeekSlots } from "./dataStore";

it("test", () => {
    expect(1).toEqual(1);
});


describe("Init Week Slots", () => {
    const weekSlots = initWeekSlots();

    test("number of slots", () => {
        expect(weekSlots.length).toEqual(1);
    });

});

