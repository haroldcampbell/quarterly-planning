package main

import (
	"dependency/server/cmd"
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"flag"
	"net/http"
	"path/filepath"

	"github.com/haroldcampbell/go_utils/envutils"
	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"

	"os"
)

var serverPort string
var isRunningOnLocal bool

const stem = "main"

func init() {
	isProduction := flag.Bool("isProduction", true, "False to run development environment, True for production. Default is true (most secure).")
	flag.Parse()

	envutils.SetIsProduction(*isProduction)
	if envutils.IsProdEnv() {
		utils.Log(stem, utils.ColoredBrightText(utils.GreenTextFG, "Starting in Prod mode."))
		utils.Log(stem, utils.ColoredBrightText(utils.RedTextFG, "Can't start in product because I'm Bypassing CSRFT"))
		os.Exit(0)
	} else {
		utils.Log(stem, utils.ColoredBrightText(utils.RedTextFG, "Starting in Dev mode"))
	}

	serverPort = os.Getenv("PORT")
	if serverPort == "" {
		serverPort = "8083"
	}

	common.PathToWWW = os.Getenv("WWW")
	if common.PathToWWW == "" {
		common.PathToWWW = "../client/www"
	}

	utils.Log(stem, "$PORT: %s", serverPort)
	utils.Log(stem, "$WWW path: %s", common.PathToWWW)

	// SECURITY-WARN:  the security token needs to be enable before pushing to production
	// cmd.InitCSRFToken()
	// cmd.InitAdminToken()
}

func reportAppPath() {
	ex, err := os.Executable()
	if err != nil {
		panic(err)
	}
	exPath := filepath.Dir(ex)

	utils.Log(stem, "Running in folder: %s", exPath)
}

func main() {
	cmd.InitAPIEnv()
	cmd.InitAPIRoutes()
	cmd.InitWWWRoutes()

	data.InitializeDatabase(cmd.DBName)

	// SECURITY-WARN:  the security token needs to be enable before pushing to production
	// protectedRoute := cmd.InitProtectedRoutes()
	reportAppPath()

	hackToByPassCSRFT := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// SECURITY-WARN:  the security token needs to be enable before pushing to production
		// w.Header().Set("epicz_csrf_token", csrf.Token(r))
		cmd.SharedRouter().ServeHTTP(w, r)
	})

	// SECURITY-WARN:  the security token needs to be removed before pushing to production
	serverutils.ServerHTTPMuted(stem, hackToByPassCSRFT, serverPort)

	// SECURITY-WARN:  This needs to be enable for production
	// serverutils.ServerHTTPMuted(stem, protectedRoute, serverPort)
}
