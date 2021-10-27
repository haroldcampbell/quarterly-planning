package team

import (
	"dependency/server/pkg/data"
	"net/http"

	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"
)

type AllTeamsResponse struct {
	Teams []*data.Team
	Epics []*data.Epic
}

func (rt *TeamRouter) AllTeamsHandler(w http.ResponseWriter, r *http.Request) {
	defer serverutils.RecoverPanic("allTeamsHandler")
	var logger = utils.NewGoRoutineLogger("allTeamsHandler")
	as := &serverutils.ActionStatus{Action: "allTeamsHandler", Writer: w}

	// TODO: [SECURITY#OWNERSHIP][allCanvasElementsHandler] Check ownership
	// projectGUID := r.FormValue("project-guid")
	// logger.Log("projectGUID: %s", projectGUID)

	response := AllTeamsResponse{
		Teams: rt.GetTeams(),
		Epics: rt.GetEpics(),
	}

	// if err != nil {
	// logger.Error("Failed to execute AllCanvasElements(...) for projectGUID[%s]: %v", projectGUID, err)
	// serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
	// return
	// }

	as.JSONBody = response
	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}
