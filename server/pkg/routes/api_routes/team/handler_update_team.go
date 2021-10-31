package team

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"encoding/json"
	"net/http"

	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"
)

func (rt *TeamRouter) UpdateTeamHandler(w http.ResponseWriter, r *http.Request) {
	defer serverutils.RecoverPanic("updateTeamHandler")
	var logger = utils.NewGoRoutineLogger("updateTeamHandler")
	as := &serverutils.ActionStatus{Action: "updateTeamHandler", Writer: w}

	model := &data.Team{}
	modelJSON := r.FormValue("team-json-data")
	err := json.Unmarshal([]byte(modelJSON), model)

	if err != nil {
		logger.Error("Error reading model from client : %v Error: %s\n", model, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	teamService := rt.ServicesMap[data.TeamServiceKey].(*data.TeamServiceMongo)
	err = teamService.UpdateTeam(*model)
	if err != nil {
		logger.Error("Error executing UpdateTeam: %v Error: %s\n", model, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}
