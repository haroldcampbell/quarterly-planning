package epic

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"encoding/json"
	"net/http"

	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"
)

type CreateTeamResponse struct {
	ID string
}

func (rt *EpicRouter) CreateEpicHandler(w http.ResponseWriter, r *http.Request) {
	defer serverutils.RecoverPanic("createEpicHandler")
	var logger = utils.NewGoRoutineLogger("createEpicHandler")
	as := &serverutils.ActionStatus{Action: "createEpicHandler", Writer: w}

	// TODO: [SECURITY#OWNERSHIP][allCanvasElementsHandler] Check ownership
	model := &data.Epic{}
	modelJSON := r.FormValue("epic-json-data")
	err := json.Unmarshal([]byte(modelJSON), model)

	if err != nil {
		logger.Error("Error reading model from client : %v Error: %s\n", model, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	newModel, err := data.CreateEpic(*model)

	if err != nil {
		logger.Error("Failed to create new Epic.TeamID[%s]: %v", model.TeamID, err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	response := CreateTeamResponse{
		ID: newModel.ID,
	}

	as.JSONBody = response
	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}

/*
jsonFilePath := fmt.Sprintf("%s/sketches/data.json", pathToWWW)
	jsonFile, err := os.Open(jsonFilePath)
	if err != nil {
		log.Panicf("[%s][RemixRoot/IndexTemplateHandler] Unable to open json datafile: %v\n", logStem, err)
	}
	defer jsonFile.Close()

	var sketches cards.SketchesPreview
	byteValue, _ := ioutil.ReadAll(jsonFile)

	json.Unmarshal(byteValue, &sketches)

	paths := []string{
		fmt.Sprintf("%s/templates/remix/index.tmpl", pathToWWW),
	}

	t := template.Must(template.ParseFiles(paths...))
	err = t.Execute(w, sketches)

	if err != nil {
		log.Panicf("[%s][RemixRoot/IndexTemplateHandler] Unable execute template: %v\n", logStem, err)
	}
*/
