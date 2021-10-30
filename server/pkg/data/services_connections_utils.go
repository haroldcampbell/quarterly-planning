package data

import (
	"fmt"

	"github.com/haroldcampbell/go_utils/utils"
)

func (s *DownstreamServiceMongo) addDownstreamEpic(upstreamEpicID string, downstreamEpicID string) error {
	downstreamEpics, err := s.getDownstreamEpicsByID(upstreamEpicID)
	if err != nil {
		return fmt.Errorf("Unable to execute addDownstreamEpic(%v, %v). getDownstreamEpicsByID returned: %v", upstreamEpicID, downstreamEpicID, err)
	}

	for _, ID := range downstreamEpics {
		if ID == downstreamEpicID {
			// Attempted to add duplicated downstream epic
			return nil
		}
	}

	downstreamEpics = append(downstreamEpics, downstreamEpicID)

	return s.setDownstreamEpicsByID(upstreamEpicID, downstreamEpics)
}

func (s *DownstreamServiceMongo) removeDownstreamEpicByID(epicID string) error {
	downstreamEpicIDs, err := s.getDownstreamEpicsByID(epicID)
	if err != nil {
		return err
	}

	if found, index := arrayHasElementStr(epicID, downstreamEpicIDs); found {
		downstreamEpicIDs = append(downstreamEpicIDs[:index], downstreamEpicIDs[index+1:]...)
		return s.setDownstreamEpicsByID(epicID, downstreamEpicIDs)
	}

	return nil
}

func (s *DownstreamServiceMongo) CreateUpstreamEpics(downstreamEpic Epic, upstreamEpics []Epic) (Epic, error) {
	if downstreamEpic.Upstreams == nil {
		downstreamEpic.Upstreams = make([]string, 0)
	}

	/** Remove the existing downstreams that contain them as its upstream */
	for _, epicID := range downstreamEpic.Upstreams {
		err := s.removeDownstreamEpicByID(epicID)
		if err != nil {
			utils.Error("services_connection_utils", "CreateUpstreamEpics: Error executing removeDownstreamEpicByID(...). epicID:%v err:%v", epicID, err)
			return Epic{}, err
		}
	}

	downstreamEpic.Upstreams = make([]string, 0)
	for _, epic := range upstreamEpics {
		downstreamEpic.Upstreams = append(downstreamEpic.Upstreams, epic.ID)
		err := s.addDownstreamEpic(epic.ID, downstreamEpic.ID)
		if err != nil {
			utils.Error("services_connection_utils", "CreateUpstreamEpics: Error executing addDownstreamEpic(...). epic.ID:%v downstreamEpic.ID:%v err:%v", epic.ID, downstreamEpic.ID, err)
			return Epic{}, err
		}
	}

	return downstreamEpic, nil
}

func (s *DownstreamServiceMongo) CreateDownstreamEpics(upstreamEpic Epic, downstreamEpics []Epic) ([]Epic, error) {
	for index, downstreamEpic := range downstreamEpics {
		if downstreamEpic.Upstreams == nil {
			downstreamEpic.Upstreams = make([]string, 0)
		}

		if found, _ := arrayHasElementStr(upstreamEpic.ID, downstreamEpic.Upstreams); found {
			/* Move on since already contained as upstream epic */
			continue
		}

		downstreamEpic.Upstreams = append(downstreamEpic.Upstreams, upstreamEpic.ID)
		err := s.addDownstreamEpic(upstreamEpic.ID, downstreamEpic.ID)
		if err != nil {
			utils.Error("services_connection_utils", "CreateDownstreamEpics: Error executing addDownstreamEpic(...). upstreamEpic.ID:%v downstreamEpic.ID:%v err:%v", upstreamEpic.ID, downstreamEpic.ID, err)
			return []Epic{}, err
		}
		downstreamEpics[index] = downstreamEpic
	}

	return downstreamEpics, nil
}
