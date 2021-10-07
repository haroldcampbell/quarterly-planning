package www_routes

import (
	"dependency/server/pkg/common"
	"fmt"
	"log"
	"net/http"
	"text/template"

	"github.com/gorilla/csrf"
	"github.com/haroldcampbell/go_utils/utils"
)

// AppRootHandler ...
func AppRootHandler(w http.ResponseWriter, r *http.Request) {
	pathToWWW := common.PathToWWWTemplates

	paths := []string{
		fmt.Sprintf("%s/app_root/index.tmpl", pathToWWW),
	}

	t := template.Must(template.ParseFiles(paths...))
	data := map[string]interface{}{
		csrf.TemplateTag: csrf.TemplateField(r),
		"XCSRFToken":     csrf.Token(r),
	}
	err := t.Execute(w, data)

	if err != nil {
		log.Panicf("[AppRootHandler][app_root/RootHandler] Unable execute template: %v\n", err)
	}

	utils.Log("AppRootHandler", "page: index.html\n\tuser-agent: %s", r.UserAgent())
}
