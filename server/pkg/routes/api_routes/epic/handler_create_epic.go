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
	EpicID string
}

func (rt *EpicRouter) CreateEpicHandler(w http.ResponseWriter, r *http.Request) {
	defer serverutils.RecoverPanic("createEpicHandler")
	var logger = utils.NewGoRoutineLogger("createEpicHandler")
	as := &serverutils.ActionStatus{Action: "createEpicHandler", Writer: w}

	// TODO: [SECURITY#OWNERSHIP]Check ownership

	model := &data.Epic{}
	modelJSON := r.FormValue("epic-json-data")
	err := json.Unmarshal([]byte(modelJSON), model)

	if err != nil {
		logger.Error("Error reading model from client : %v Error: %s\n", model, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	epicService := rt.ServicesMap[data.EpicServiceKey].(*data.EpicServiceMongo)

	newEpicID, err := epicService.CreateEpic(model)

	if err != nil {
		logger.Error("Failed to create new Epic.TeamID[%s]: %v", model.TeamID, err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	response := CreateTeamResponse{
		EpicID: newEpicID,
	}

	as.JSONBody = response
	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}
