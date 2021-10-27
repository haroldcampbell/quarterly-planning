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
	var index = -1
	downstreamEpicIDs := getDownstreamEpicsByID(epicID)

	for i, ID := range downstreamEpicIDs {
		if ID == epicID {
			index = i
			break
		}
	}

	if index != -1 {
		downstreamEpicIDs = append(downstreamEpicIDs[:index], downstreamEpicIDs[index+1:]...)
		setDownstreamEpicsByID(epicID, downstreamEpicIDs)
	}
}

func createUpstreamEpics(downstreamEpic *Epic, upstreamEpics []*Epic) {
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

func removeUpstreamEpicByID(downstreamEpic *Epic, upstreamEpicID string) {
	if downstreamEpic.Upstreams == nil {
		return
	}

	var index = -1

	for i, ID := range downstreamEpic.Upstreams {
		if ID == upstreamEpicID {
			index = i
			break
		}
	}

	if index != -1 {
		downstreamEpic.Upstreams = append(downstreamEpic.Upstreams[:index], downstreamEpic.Upstreams[index+1:]...)
	}
}

func toArr(arr ...interface{}) []interface{} {
	return arr
}

func arrayHasElement(arr []interface{}, elm interface{}) (bool, int) {
	for index, item := range arr {
		if item == elm {
			return true, index
		}
	}

	return false, -1
}

func createDownstreamEpics(upstreamEpic *Epic, downstreamEpics []*Epic) {
	epics := GetEpics()

	for _, e := range epics {
		removeUpstreamEpicByID(e, upstreamEpic.ID)
	}

	for _, downstreamEpic := range downstreamEpics {
		if downstreamEpic.Upstreams == nil {
			downstreamEpic.Upstreams = make([]string, 0)
		}

		if found, _ := arrayHasElement(toArr(downstreamEpic.Upstreams), upstreamEpic.ID); !found {
			return
		}

		downstreamEpic.Upstreams = append(downstreamEpic.Upstreams, upstreamEpic.ID)
		addDownstreamEpic(upstreamEpic.ID, downstreamEpic.ID)
	}
}

func CreateEpicDependencyConnections(activeEpicID string, downstreamEpicIDs []string, upstreamEpicIDs []string) error {
	activeEpic := GetEpicByID(activeEpicID)

	if activeEpic == nil {
		return fmt.Errorf("Unknow/Invalid Epic ID: %v", activeEpicID)
	}

	downStreamEpics := make([]*Epic, 0, len(downstreamEpicIDs))
	for _, epicID := range downstreamEpicIDs {
		tempEpic := GetEpicByID(epicID)
		downStreamEpics = append(downStreamEpics, tempEpic)
	}

	upStreamEpics := make([]*Epic, 0, len(upstreamEpicIDs))
	for _, epicID := range downstreamEpicIDs {
		tempEpic := GetEpicByID(epicID)
		upStreamEpics = append(upStreamEpics, tempEpic)
	}

	createUpstreamEpics(activeEpic, downStreamEpics)
	createDownstreamEpics(activeEpic, upStreamEpics)

	return nil
}
