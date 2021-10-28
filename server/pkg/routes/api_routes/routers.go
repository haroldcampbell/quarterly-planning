package api_routes

import (
	"dependency/server/pkg/routes/api_routes/dependency"
	"dependency/server/pkg/routes/api_routes/epic"
	"dependency/server/pkg/routes/api_routes/team"

	"github.com/gorilla/mux"
)

func newTeamRouter(r *mux.Router, servicesMap map[string]interface{}) {
	router := &team.TeamRouter{
		ServicesMap: servicesMap,
	}

	r.Path("/teams").HandlerFunc(router.AllTeamsHandler)
}

func newEpicRouter(r *mux.Router, servicesMap map[string]interface{}) {
	router := &epic.EpicRouter{
		ServicesMap: servicesMap,
	}

	r.Path("/epic/create").HandlerFunc(router.CreateEpicHandler).Methods("POST")
}

func newDependencyRouter(r *mux.Router, servicesMap map[string]interface{}) {
	router := &dependency.DependencyRouter{
		ServicesMap: servicesMap,
	}

	r.Path("/dependency/create").HandlerFunc(router.CreateDependencyHandler).Methods("POST")
}

func NewAPIRouters(r *mux.Router, servicesMap map[string]interface{}) {
	newTeamRouter(r, servicesMap)
	newEpicRouter(r, servicesMap)
	newDependencyRouter(r, servicesMap)
}
