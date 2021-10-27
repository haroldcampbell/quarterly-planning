package data

import (
	"fmt"

	"github.com/haroldcampbell/go_utils/serverutils"
)

func GetTeams() []*Team {
	return teams
}

func GetEpics() []*Epic {
	return epics
}

func GetEpicByID(epicID string) *Epic {
	for _, epic := range epics {
		if epic.ID == epicID {
			return epic
		}
	}
	return nil
}

func CreateEpic(model Epic) (Epic, error) {
	model.ID = serverutils.GenerateGUID()
	epics = append(epics, &model)

	return model, nil
}

func getDownstreamEpicsByID(epicID string) []string {
	return _downStreamsByEpicID[epicID]
}

func setDownstreamEpicsByID(epicID string, IDs []string) {
	_downStreamsByEpicID[epicID] = IDs
}

func addDownstreamEpic(upstreamEpicID string, downstreamEpicID string) {
	if _downStreamsByEpicID[upstreamEpicID] == nil {
		_downStreamsByEpicID[upstreamEpicID] = []string{}
	}

	downstreamEpics := _downStreamsByEpicID[upstreamEpicID]
	for _, ID := range downstreamEpics {
		if ID == downstreamEpicID {
			// Attempted to add duplicated downstream epic
			return
		}
	}
	downstreamEpics = append(downstreamEpics, downstreamEpicID)
	_downStreamsByEpicID[upstreamEpicID] = downstreamEpics
}

func removeDownstreamEpicByID(epicID string) {
	downstreamEpicIDs := getDownstreamEpicsByID(epicID)

	if found, index := arrayHasElementStr(epicID, downstreamEpicIDs); found {
		downstreamEpicIDs = append(downstreamEpicIDs[:index], downstreamEpicIDs[index+1:]...)
		setDownstreamEpicsByID(epicID, downstreamEpicIDs)
	}
}

func removeEpicAsUpstream(downstreamEpic *Epic, upstreamEpicID string) {
	if downstreamEpic.Upstreams == nil {
		return
	}

	tempEpic := GetEpicByID(upstreamEpicID)

	if found, index := arrayHasElementStr(tempEpic.ID, downstreamEpic.Upstreams); found {
		downstreamEpic.Upstreams = append(downstreamEpic.Upstreams[:index], downstreamEpic.Upstreams[index+1:]...)
	}
}

func createUpstreamEpics(downstreamEpic *Epic, upstreamEpicIDs []string) {
	upstreamEpics := make([]*Epic, 0, len(upstreamEpicIDs))
	for _, epicID := range upstreamEpicIDs {
		tempEpic := GetEpicByID(epicID)
		upstreamEpics = append(upstreamEpics, tempEpic)
	}

	if downstreamEpic.Upstreams == nil {
		downstreamEpic.Upstreams = make([]string, 0)
	}

	/** Remove the existing downstreams that contain them as its upstream */
	for _, epicID := range downstreamEpic.Upstreams {
		removeDownstreamEpicByID(epicID)
	}

	downstreamEpic.Upstreams = make([]string, 0)
	for _, epic := range upstreamEpics {
		downstreamEpic.Upstreams = append(downstreamEpic.Upstreams, epic.ID)
		addDownstreamEpic(epic.ID, downstreamEpic.ID)
	}
}

func createDownstreamEpics(upstreamEpic *Epic, downstreamEpicIDs []string) {
	epics := GetEpics()
	for _, e := range epics {
		removeEpicAsUpstream(e, upstreamEpic.ID)
	}

	downstreamEpics := make([]*Epic, 0, len(downstreamEpicIDs))
	for _, epicID := range downstreamEpicIDs {
		tempEpic := GetEpicByID(epicID)
		downstreamEpics = append(downstreamEpics, tempEpic)
	}

	for _, downstreamEpic := range downstreamEpics {
		if downstreamEpic.Upstreams == nil {
			downstreamEpic.Upstreams = make([]string, 0)
		}

		if found, _ := arrayHasElementStr(upstreamEpic.ID, downstreamEpic.Upstreams); found {
			/* Move on since already contained as upstream epic */
			continue
		}

		downstreamEpic.Upstreams = append(downstreamEpic.Upstreams, upstreamEpic.ID)
		addDownstreamEpic(upstreamEpic.ID, downstreamEpic.ID)
	}
}

func CreateEpicDependencyConnections(activeEpicID string, upstreamEpicIDs []string, downstreamEpicIDs []string) error {
	activeEpic := GetEpicByID(activeEpicID)

	if activeEpic == nil {
		return fmt.Errorf("Unknow/Invalid Epic ID: %v", activeEpicID)
	}

	createUpstreamEpics(activeEpic, upstreamEpicIDs)
	createDownstreamEpics(activeEpic, downstreamEpicIDs)

	return nil
}
