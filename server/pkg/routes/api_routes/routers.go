package api_routes

import (
	"dependency/server/pkg/data"
	"dependency/server/pkg/routes/api_routes/dependency"
	"dependency/server/pkg/routes/api_routes/epic"
	"dependency/server/pkg/routes/api_routes/team"

	"github.com/gorilla/mux"
)

func newTeamRouter(r *mux.Router) {
	router := &team.TeamRouter{
		GetTeams: data.GetTeams,
		GetEpics: data.GetEpics,
	}

	r.Path("/teams").HandlerFunc(router.AllTeamsHandler)
}

func newEpicRouter(r *mux.Router) {
	router := &epic.EpicRouter{}

	r.Path("/epic/create").HandlerFunc(router.CreateEpicHandler).Methods("POST")
}

func newDependencyRouter(r *mux.Router) {
	router := &dependency.DependencyRouter{}

	r.Path("/dependency/create").HandlerFunc(router.CreateDependencyHandler).Methods("POST")
}

func NewAPIRouters(r *mux.Router) {
	newTeamRouter(r)
	newEpicRouter(r)
	newDependencyRouter(r)
}
