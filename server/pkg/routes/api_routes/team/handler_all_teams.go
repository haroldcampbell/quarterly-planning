package team

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"net/http"

	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"
)

type AllTeamsResponse struct {
	Teams []data.Team
	Epics []data.Epic
}

func (rt *TeamRouter) AllTeamsHandler(w http.ResponseWriter, r *http.Request) {
	defer serverutils.RecoverPanic("allTeamsHandler")
	var logger = utils.NewGoRoutineLogger("allTeamsHandler")
	as := &serverutils.ActionStatus{Action: "allTeamsHandler", Writer: w}

	// TODO: [SECURITY#OWNERSHIP] Check ownership

	teamService := rt.ServicesMap[data.TeamServiceKey].(*data.TeamServiceMongo)
	epicService := rt.ServicesMap[data.EpicServiceKey].(*data.EpicServiceMongo)

	teams, err := teamService.GetTeams()
	if err != nil {
		logger.Error("Failed to execute GetTeams(): %v", err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	epics, err := epicService.GetEpics()
	if err != nil {
		logger.Error("Failed to execute GetEpics(): %v", err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	response := AllTeamsResponse{
		Teams: teams,
		Epics: epics,
	}

	as.JSONBody = response
	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}
