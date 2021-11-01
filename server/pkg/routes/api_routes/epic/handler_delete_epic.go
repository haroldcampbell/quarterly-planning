package epic

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"net/http"

	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"
)

type DeleteEpicResponse struct {
	EpicID                       string
	EpicsDeleted                 int64
	DownstreamConnectionsDeleted int64
}

func (rt *EpicRouter) DeleteEpicHandler(w http.ResponseWriter, r *http.Request) {
	defer serverutils.RecoverPanic("deleteEpicHandler")
	var logger = utils.NewGoRoutineLogger("deleteEpicHandler")
	as := &serverutils.ActionStatus{Action: "deleteEpicHandler", Writer: w}

	// TODO: [SECURITY#OWNERSHIP]Check ownership

	epicID := r.FormValue("epic-id")

	epicService := rt.ServicesMap[data.EpicServiceKey].(*data.EpicServiceMongo)
	downstreamService := rt.ServicesMap[data.DownstreamServiceKey].(*data.DownstreamServiceMongo)

	downstreamConnectionsDeleted, err := downstreamService.DeleteConnectionsByEpicID(epicID)
	if err != nil {
		logger.Error("DeleteConnectionsByEpicID: Failed to delete connections Epic.ID[%s]: %v", epicID, err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	err = epicService.UnlinkEpicAsUpstreamByEpicID(epicID)
	if err != nil {
		logger.Error("UnlinkEpicAsUpstreamByEpicID: Failed to delete EpicID[%s]: %v", epicID, err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}
	epicsDeleted, err := epicService.DeleteEpicByEpicID(epicID)
	if err != nil {
		logger.Error("DeleteEpicByEpicID: Failed to delete Epic.ID[%s]: %v", epicID, err)
		serverutils.RespondWithError(as, logger, common.NothingFoundErrorMessage, http.StatusNotFound)
		return
	}

	response := DeleteEpicResponse{
		EpicID: epicID,
		// TeamID: epic
		EpicsDeleted:                 epicsDeleted,
		DownstreamConnectionsDeleted: downstreamConnectionsDeleted,
	}

	as.JSONBody = response
	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}
