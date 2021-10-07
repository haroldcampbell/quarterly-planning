package www_routes

import (
	"dependency/server/pkg/common"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/haroldcampbell/go_utils/utils"
)

// WWWHandler servers the files in the client/WWW folder
func WWWHandler(w http.ResponseWriter, r *http.Request) {
	stem := "wwwrouter"
	filename := fmt.Sprintf("%s%s", common.PathToWWW, r.URL.Path)

	if strings.HasSuffix(r.URL.Path, "favicon.ico") {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if strings.HasSuffix(r.URL.Path, ".tmpl") {
		utils.Log(stem, "[WWWHandler] Not found: User trying to read template file directly: [%s]%s", common.PathToWWW, r.URL.Path)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if _, err := os.Stat(filename); os.IsNotExist(err) {
		utils.Log(stem, "[WWWHandler] Not found: [%s]%s", common.PathToWWW, r.URL.Path)
		utils.Log(stem, "\t>>Filename now found: %s", filename)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	http.ServeFile(w, r, filename)
}
