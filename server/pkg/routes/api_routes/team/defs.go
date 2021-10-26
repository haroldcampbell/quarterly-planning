package team

import "dependency/server/pkg/data"

// TeamRouter ...
type TeamRouter struct {
	GetTeams     func() []data.Team
	GetEpics     func() []data.Epic
	GetTeamEpics func() map[string]*data.TeamEpics
}
