package epic

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"net/http"

	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"
)

type DeleteEpicResponse struct {
	EpicID       string
	EpicsDeleted int64
	// DownstreamConnectionsDeleted int64
}

func (rt *EpicRouter) DeleteEpicHandler(w http.ResponseWriter, r *http.Request) {
	defer serverutils.RecoverPanic("deleteEpicHandler")
	var logger = utils.NewGoRoutineLogger("deleteEpicHandler")
	as := &serverutils.ActionStatus{Action: "deleteEpicHandler", Writer: w}

	// TODO: [SECURITY#OWNERSHIP]Check ownership

	epicID := r.FormValue("epic-id")

	epicService := rt.ServicesMap[data.EpicServiceKey].(*data.EpicServiceMongo)
	epicConnectionService := rt.ServicesMap[data.EpicConnectionServiceKey].(*data.EpicConnectionServiceMongo)

	err := epicConnectionService.UnlinkEpicConnections(epicID)
	if err != nil {
		logger.Error("UnlinkEpicConnections: Failed to delete connections epicID[%s]: %v", epicID, err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	epicsDeletedCount, err := epicService.DeleteEpicByEpicID(epicID)
	if err != nil {
		logger.Error("DeleteEpicByEpicID: Failed to delete Epic.ID[%s]: %v", epicID, err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	response := DeleteEpicResponse{
		EpicID:       epicID,
		EpicsDeleted: epicsDeletedCount,
	}

	as.JSONBody = response
	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}
