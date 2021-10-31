package epic

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"encoding/json"
	"net/http"

	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"
)

func (rt *EpicRouter) UpdateEpicHandler(w http.ResponseWriter, r *http.Request) {
	defer serverutils.RecoverPanic("updateEpicHandler")
	var logger = utils.NewGoRoutineLogger("updateEpicHandler")
	as := &serverutils.ActionStatus{Action: "updateEpicHandler", Writer: w}

	model := &data.Epic{}
	modelJSON := r.FormValue("epic-json-data")
	err := json.Unmarshal([]byte(modelJSON), model)

	if err != nil {
		logger.Error("Error reading model from client : %v Error: %s\n", model, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	epicService := rt.ServicesMap[data.EpicServiceKey].(*data.EpicServiceMongo)
	err = epicService.UpdateEpic(*model)
	if err != nil {
		logger.Error("Error executing UpdateEpic: %v Error: %s\n", model, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}
