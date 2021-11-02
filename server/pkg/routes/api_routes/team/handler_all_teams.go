package team

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"net/http"

	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"
)

type AllTeamsResponse struct {
	Teams           []data.Team
	Epics           []data.Epic
	EpicConnections []data.EpicConnection
}

func (rt *TeamRouter) AllTeamsHandler(w http.ResponseWriter, r *http.Request) {
	defer serverutils.RecoverPanic("allTeamsHandler")
	var logger = utils.NewGoRoutineLogger("allTeamsHandler")
	as := &serverutils.ActionStatus{Action: "allTeamsHandler", Writer: w}

	// TODO: [SECURITY#OWNERSHIP] Check ownership

	teamService := rt.ServicesMap[data.TeamServiceKey].(*data.TeamServiceMongo)
	teams, err := teamService.GetTeams()
	if err != nil {
		logger.Error("Failed to execute GetTeams(): %v", err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	epicService := rt.ServicesMap[data.EpicServiceKey].(*data.EpicServiceMongo)
	epics, err := epicService.GetEpics()
	if err != nil {
		logger.Error("Failed to execute GetEpics(): %v", err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	epicConnectionService := rt.ServicesMap[data.EpicConnectionServiceKey].(*data.EpicConnectionServiceMongo)
	epicConnections, err := epicConnectionService.RetrieveAllEpicConnections()
	if err != nil {
		logger.Error("Failed to execute RetrieveAllEpicConnections(): %v", err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	response := AllTeamsResponse{
		Teams:           teams,
		Epics:           epics,
		EpicConnections: epicConnections,
	}

	as.JSONBody = response
	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}
