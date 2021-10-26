package api_routes

import (
	"dependency/server/pkg/data"
	"dependency/server/pkg/routes/api_routes/team"

	"github.com/gorilla/mux"
)

// NewTeamRouter ...
func NewTeamRouter(r *mux.Router) {
	router := &team.TeamRouter{
		GetTeams: data.GetTeams,
		GetEpics: data.GetEpics,
	}

	r.Path("/teams").HandlerFunc(router.AllTeamsHandler)
}
