package team

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"net/http"

	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"
)

type CreateTeamResponse struct {
	Team data.Team
}

func (rt *TeamRouter) CreateTeamHandler(w http.ResponseWriter, r *http.Request) {
	defer serverutils.RecoverPanic("createTeamHandler")
	var logger = utils.NewGoRoutineLogger("createTeamHandler")
	as := &serverutils.ActionStatus{Action: "createTeamHandler", Writer: w}

	// TODO: [SECURITY#OWNERSHIP] Check ownership

	model := &data.Team{
		Name: "New Team",
	}

	teamService := rt.ServicesMap[data.TeamServiceKey].(*data.TeamServiceMongo)
	newTeamID, err := teamService.CreateTeam(model)
	if err != nil {
		logger.Error("Failed to create new Team.TeamID[%s]: %v", model.ID, err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	model.ID = newTeamID
	response := CreateTeamResponse{
		Team: *model,
	}

	as.JSONBody = response
	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}
