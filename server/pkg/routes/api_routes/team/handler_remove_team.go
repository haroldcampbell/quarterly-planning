package team

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"net/http"

	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"
)

type DeleteTeamResponse struct {
	TeamID string
	// TeamsDeleted int64
	// DownstreamConnectionsDeleted int64
}

func (rt *TeamRouter) DeleteTeamHandler(w http.ResponseWriter, r *http.Request) {
	defer serverutils.RecoverPanic("deleteTeamHandler")
	var logger = utils.NewGoRoutineLogger("deleteTeamHandler")
	as := &serverutils.ActionStatus{Action: "deleteTeamHandler", Writer: w}

	// TODO: [SECURITY#OWNERSHIP]Check ownership

	teamID := r.FormValue("team-id")

	err := rt.deleteEpics(teamID)
	if err != nil {
		logger.Error("deleteEpics: to delete epics %v", err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	teamService := rt.ServicesMap[data.TeamServiceKey].(*data.TeamServiceMongo)
	err = teamService.DeleteTeamByTeamID(teamID)
	if err != nil {
		logger.Error("DeleteTeamByTeamID: Failed to delete Team.ID[%s]: %v", teamID, err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	response := DeleteTeamResponse{
		TeamID: teamID,
		// EpicsDeleted: epicsDeletedCount,
	}

	as.JSONBody = response
	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}

func (rt *TeamRouter) deleteEpics(teamID string) error {
	epicService := rt.ServicesMap[data.EpicServiceKey].(*data.EpicServiceMongo)
	epicConnectionService := rt.ServicesMap[data.EpicConnectionServiceKey].(*data.EpicConnectionServiceMongo)

	epics, err := epicService.GetEpicsByTeamID(teamID)
	if err != nil {
		utils.Error("GetEpicsByTeamID: Failed to to return epics. TeamID[%s]: %v", teamID, err)
		return err
	}

	for _, epic := range epics {
		err := epicConnectionService.UnlinkEpicConnections(epic.ID)
		if err != nil {
			utils.Error("UnlinkEpicConnections: Failed to delete connections epicID[%s]: %v", epic.ID, err)
			return err
		}

		_, err = epicService.DeleteEpicByEpicID(epic.ID)
		if err != nil {
			utils.Error("DeleteEpicByEpicID: Failed to delete Epic.ID[%s]: %v", epic.ID, err)
			return err
		}
	}

	return nil
}
