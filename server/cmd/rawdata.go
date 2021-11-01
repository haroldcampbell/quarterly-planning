package cmd

import "dependency/server/pkg/data"

var teams = []*data.Team{
	{
		ID:   "A1",
		Name: "Team 1",
	},
	{
		ID:   "A2",
		Name: "Team 2",
	},
	{
		ID:   "A3",
		Name: "Team 3",
	},
}

var epics = []*data.Epic{
	{
		ID:                  "1-3",
		TeamID:              "A1",
		Name:                "E1",
		ExpectedStartPeriod: 2,
		Size:                0.5,
	},
	{
		ID:                  "1-4",
		TeamID:              "A1",
		Name:                "E2",
		ExpectedStartPeriod: 3.5,
		Size:                0.5,
		Upstreams: []string{
			"1-3",
		},
	},
	{
		ID:                  "2",
		TeamID:              "A2",
		Name:                "Epic P1",
		ExpectedStartPeriod: 1,
		Size:                1,
	},
	{
		ID:                  "6",
		TeamID:              "A2",
		Name:                "Epic P6",
		ExpectedStartPeriod: 1,
		Size:                1,
	},
	{
		ID:                  "8",
		TeamID:              "A3",
		Name:                "Epic SME2",
		ExpectedStartPeriod: 7,
		Size:                1,
		Upstreams: []string{
			"1-3",
		},
	},
	{
		ID:                  "9",
		TeamID:              "A3",
		Name:                "Epic SME3",
		ExpectedStartPeriod: 4,
		Size:                1,
		Upstreams: []string{
			"1-3",
			"1-4",
			"2",
			"6",
		},
	},
	{
		ID:                  "10-1",
		TeamID:              "A3",
		Name:                "Epic SME4",
		ExpectedStartPeriod: 4,
		Size:                1,
	},
	{
		ID:                  "10-2",
		TeamID:              "A3",
		Name:                "Epic SME5",
		ExpectedStartPeriod: 4,
		Size:                2,
	},
}

// var _downStreamsByEpicID = make(map[string][]string)

// func initDownstreamEpics() {
// 	for _, downstreamEpic := range epics {
// 		if downstreamEpic.Upstreams == nil {
// 			continue
// 		}

// 		for _, upstreamEpicID := range downstreamEpic.Upstreams {
// 			addDownstreamEpic(upstreamEpicID, downstreamEpic.ID)
// 		}
// 	}
// }

// var _ = func() int {
// 	initDownstreamEpics()
// 	return 0
// }()
