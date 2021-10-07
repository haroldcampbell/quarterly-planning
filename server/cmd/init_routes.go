package cmd

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/routes/www_routes"
	"fmt"

	// "groundtap/app/desktop_app/groundtap-server/pkg/common"
	// "groundtap/app/desktop_app/groundtap-server/pkg/data/models"
	// "groundtap/app/desktop_app/groundtap-server/pkg/data/mongo"
	// "groundtap/app/desktop_app/groundtap-server/pkg/routes/api_routes/admin_console_router"
	// "groundtap/app/desktop_app/groundtap-server/pkg/routes/api_routes/canvas_element_router"
	// "groundtap/app/desktop_app/groundtap-server/pkg/routes/api_routes/data_group_router"
	// "groundtap/app/desktop_app/groundtap-server/pkg/routes/api_routes/datastore_router"
	// "groundtap/app/desktop_app/groundtap-server/pkg/routes/api_routes/project_router"
	// "groundtap/app/desktop_app/groundtap-server/pkg/routes/api_routes/waitinglist_router"
	// "groundtap/app/desktop_app/groundtap-server/pkg/routes/www_routes"
	"net/http"

	"github.com/gorilla/csrf"
	"github.com/gorilla/mux"
	"github.com/haroldcampbell/go_utils/envutils"
	"github.com/haroldcampbell/go_utils/utils"
)

var mongoURL = "mongo:27017"

const dbName = "epicz_app_db"

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

	// Initialize services
	utils.Log(stem, "Wiring services...")

	// Create routes
	utils.Log(stem, "Wiring routers...")
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
