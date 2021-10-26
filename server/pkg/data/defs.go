package data

type Team struct {
	ID   string
	Name string
}

type Epic struct {
	ID                  string
	TeamID              string
	Name                string
	ExpectedStartPeriod float32
	Size                float32
	Upstreams           []string /* List of Epic IDs*/
}

type TeamEpics struct {
	TeamID string
	Epics  []Epic /* The Epics for the specified team*/
}

func GetTeams() []Team {
	teams := []Team{
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

	return teams
}

func GetEpics() []Epic {
	epics := []Epic{
		{
			ID:                  "1-3",
			TeamID:              "A1",
			Name:                "Epic IL1",
			ExpectedStartPeriod: 2,
			Size:                0.5,
		},
		{
			ID:                  "1-4",
			TeamID:              "A1",
			Name:                "Epic IL1",
			ExpectedStartPeriod: 2.5,
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
			Name:                "Epic SME4",
			ExpectedStartPeriod: 4,
			Size:                2,
		},
	}

	return epics
}

// func GetTeamEpics() map[string]*TeamEpics {
// 	epics := GetEpics()

// 	teamEpics := make(map[string]*TeamEpics)
// 	for _, epic := range epics {
// 		if teamEpics[epic.TeamID] == nil {
// 			teamEpic := TeamEpics{
// 				TeamID: epic.TeamID,
// 				Epics:  []Epic{},
// 			}

// 			teamEpics[epic.TeamID] = &teamEpic
// 		}

// 		var teamEpic = teamEpics[epic.TeamID]
// 		teamEpic.Epics = append(teamEpic.Epics, epic)
// 	}

// 	return teamEpics
// }
