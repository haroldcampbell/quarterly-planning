package dependency

import (
	"dependency/server/pkg/common"
	"dependency/server/pkg/data"
	"encoding/json"
	"net/http"

	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"
)

type CreateDependencyResponse struct {
	// ID string
}

func (rt *DependencyRouter) CreateDependencyHandler(w http.ResponseWriter, r *http.Request) {
	defer serverutils.RecoverPanic("createDependencyHandler")
	var logger = utils.NewGoRoutineLogger("createDependencyHandler")
	as := &serverutils.ActionStatus{Action: "createDependencyHandler", Writer: w}

	epicService := rt.ServicesMap[data.EpicServiceKey].(*data.EpicServiceMongo)
	downstreamService := rt.ServicesMap[data.DownstreamServiceKey].(*data.DownstreamServiceMongo)

	activeEpicID := r.FormValue("active-epic-id")
	upstreamIDsJSON := r.FormValue("upstream-connection-epic-ids")
	downstreamIDsJSON := r.FormValue("downstream-connection-epic-ids")

	// TODO: Validate the input

	upstreamEpicIDs := []string{}
	err := json.Unmarshal([]byte(upstreamIDsJSON), &upstreamEpicIDs)
	if err != nil {
		logger.Error("Error reading upstreamIDsJSON from client : %v Error: %s", upstreamIDsJSON, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	downstreamEpicIDs := []string{}
	err = json.Unmarshal([]byte(downstreamIDsJSON), &downstreamEpicIDs)
	if err != nil {
		logger.Error("Error reading downstreamIDsJSON from client : %v Error: %s", downstreamIDsJSON, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)
		return
	}

	activeEpic, err := epicService.GetEpicByID(activeEpicID)
	if err != nil {
		logger.Error("Error executing GetEpicByID(activeEpicID). activeEpicID: %v Error: %s", activeEpicID, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)
		return
	}

	upstreamEpics, err := epicService.GetEpicsByID(upstreamEpicIDs)
	if err != nil {
		logger.Error("Error executing GetEpicsByID(upstreamEpicIDs). upstreamEpicIDs: %v Error: %s", upstreamEpicIDs, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	downstreamEpics, err := epicService.GetEpicsByID(downstreamEpicIDs)
	if err != nil {
		logger.Error("Error executing GetEpicsByID(downstreamEpicIDs). downstreamEpicIDs: %v Error: %s", downstreamEpicIDs, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	updatedEpic, err := downstreamService.CreateUpstreamEpics(activeEpic, upstreamEpics)
	if err != nil {
		logger.Error("Error executing CreateUpstreamEpics(activeEpic, upstreamEpics). activeEpic: %v upstreamEpics: %v, Error: %s", activeEpic, upstreamEpics, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	err = epicService.UpdateEpic(updatedEpic)
	if err != nil {
		logger.Error("Error executing UpdateEpic(updatedEpic). updatedEpic: %v, Error: %s", updatedEpic, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	epicService.UnlinkEpicAsUpstream(activeEpic)

	downstreamEpics, err = downstreamService.CreateDownstreamEpics(activeEpic, downstreamEpics)
	if err != nil {
		logger.Error("Error executing CreateDownstreamEpics(activeEpic, downstreamEpics). activeEpic: %v downstreamEpics: %v, Error: %s", activeEpic, downstreamEpics, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

	}

	err = epicService.UpdateEpicsUpstreams(downstreamEpics)
	if err != nil {
		logger.Error("Error executing UpdateEpics(downstreamEpics). downstreamEpics: %v, Error: %s", downstreamEpics, err)
		serverutils.RespondWithError(as, logger, common.InvalidClientDataMessage, http.StatusNotFound)

		return
	}

	response := CreateDependencyResponse{}

	as.JSONBody = response
	data, err := as.Write(true, "ok")

	logger.LogActionStatus(data, err, utils.TruncatedMessageLimitTiny)
}
