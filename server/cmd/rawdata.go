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
	},
	{
		ID:                  "9",
		TeamID:              "A3",
		Name:                "Epic SME3",
		ExpectedStartPeriod: 4,
		Size:                1,
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
	{
		ID:                  "10-2",
		TeamID:              "A3",
		Name:                "Epic SME6",
		ExpectedStartPeriod: 7,
		Size:                2,
	},
	{
		ID:                  "10-2",
		TeamID:              "A3",
		Name:                "Epic SME7",
		ExpectedStartPeriod: 10,
		Size:                1,
	},
}
