package cmd

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"dependency/server/pkg/routes/api_routes"
	"dependency/server/pkg/routes/www_routes"
	"fmt"

	"net/http"

	"github.com/gorilla/csrf"
	"github.com/gorilla/mux"
	"github.com/haroldcampbell/go_utils/envutils"
	"github.com/haroldcampbell/go_utils/utils"
)

var mongoURL = "mongo:27017"

const DBName = "epicz_app_db"

var router = mux.NewRouter()

// SharedRouter ...
func SharedRouter() *mux.Router {
	return router
}

// InitAPIEnv ...
func InitAPIEnv() {
	const stem = "InitAPIEnv"

	if envutils.IsDevEnv() {
		mongoURL = "127.0.0.1:27017"
		utils.Log(stem, "mongoURL set to Dev URL: %s", mongoURL)
	} else {
		utils.Log(stem, "mongoURL set to Prod URL: %s", mongoURL)
	}
}

func printAllRoutes() {
	router.Walk(func(route *mux.Route, router *mux.Router, ancestors []*mux.Route) error {
		t, err := route.GetPathTemplate()
		if err != nil {
			utils.Error("printAllRoutes", "Error reading route.GetPathTemplate(): %v\n", err)
			return err
		}
		methods, _ := route.GetMethods()
		if err != nil {
			fmt.Printf("%v\n", t)
		} else {
			fmt.Printf("%v %v\n", t, methods)
		}

		return nil
	})
}

// InitAPIRoutes ..
func InitAPIRoutes() {
	const stem = "InitAPIRoutes"

	utils.Log(stem, "Initializing API routes...")

	utils.Log(stem, "Attempting to connect to database...")
	mongoConfig := data.NewMongoConfig(mongoURL, DBName)
	session, err := data.NewSession(mongoConfig)
	if err != nil {
		msg := utils.ErrorMsg(stem, "Unable to connect to database: %v", err)
		panic(msg)
	}
	buildInfo, _ := session.Copy().BuildInfo()
	utils.Log(stem, "Mongo BuildInfo:%v", buildInfo)

	// Initialize services
	servicesMap := make(map[string]interface{})

	utils.Log(stem, "Wiring services...")
	teamService := data.NewTeamService(session.Copy(), mongoConfig)
	epicService := data.NewEpicService(session.Copy(), mongoConfig)
	downstreamService := data.NewDownstreamService(session.Copy(), mongoConfig)

	servicesMap[data.EpicServiceKey] = epicService
	servicesMap[data.TeamServiceKey] = teamService
	servicesMap[data.DownstreamServiceKey] = downstreamService

	// Create routes
	utils.Log(stem, "Wiring routers...")

	api_routes.NewAPIRouters(router, servicesMap)

	//
	// printAllRoutes()
	utils.Log(stem, "Done initializing API routes...")
}

// InitWWWRoutes ...
func InitWWWRoutes() {
	router.Path("/").Handler(http.HandlerFunc(www_routes.AppRootHandler))
	// router.PathPrefix("/project/").Handler(http.HandlerFunc(www_routes.AppRootHandler))
	// router.Path("/getXCSRFToken.html").Handler(http.HandlerFunc(www_routes.XCSRFTokenHandler))
	router.Path("/index.html").Handler(http.HandlerFunc(www_routes.AppRootHandler))

	router.PathPrefix("/").Handler(http.HandlerFunc(www_routes.WWWHandler))
}

// InitProtectedRoutes  ...
func InitProtectedRoutes() http.Handler {
	CSRF := csrf.Protect([]byte(common.CSRFToken),
		csrf.FieldName("epicz_csrf_token"),
		csrf.Secure(envutils.IsProdEnv()),
	)

	x := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("epicz_csrf_token", csrf.Token(r))
		router.ServeHTTP(w, r)
	})

	return CSRF(x)
}
