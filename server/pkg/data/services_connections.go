package data

import (
	"fmt"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type DownstreamServiceMongo struct {
	collection *mgo.Collection
}

type DownstreamDocument struct {
	DID bson.ObjectId `bson:"_id,omitempty"` // DocumentID

	EpicID            string
	DownstreamEpicIDs []string
}

func NewDownstreamService(session *mgo.Session, config *MongoConfig) *DownstreamServiceMongo {
	collection := session.DB(config.DbName).C("downstreams")
	collection.EnsureIndex(documentIndex("DownstreamKey"))

	return &DownstreamServiceMongo{collection: collection}
}

func (s *DownstreamServiceMongo) getDownstreamEpicsByID(epicID string) ([]string, error) {
	var doc DownstreamDocument

	err := s.collection.Find(bson.M{"epicid": epicID}).One(&doc)
	if err != nil {
		return []string{}, err
	}

	return doc.DownstreamEpicIDs, nil
}

func (s *DownstreamServiceMongo) setDownstreamEpicsByID(epicID string, IDs []string) error {
	var doc = DownstreamDocument{
		EpicID:            epicID,
		DownstreamEpicIDs: IDs,
	}

	_, err := s.collection.Upsert(bson.M{"epicid": epicID}, doc)

	return err
	// _downStreamsByEpicID[epicID] = IDs
}

func (s *DownstreamServiceMongo) addDownstreamEpic(upstreamEpicID string, downstreamEpicID string) error {
	// if _downStreamsByEpicID[upstreamEpicID] == nil {
	// _downStreamsByEpicID[upstreamEpicID] = []string{}
	// }

	downstreamEpics, err := s.getDownstreamEpicsByID(upstreamEpicID)
	if err != nil {
		return fmt.Errorf("Unable to execute addDownstreamEpic(%v, %v). getDownstreamEpicsByID returned: %v", upstreamEpicID, downstreamEpicID, err)
	}

	// downstreamEpics := _downStreamsByEpicID[upstreamEpicID]
	for _, ID := range downstreamEpics {
		if ID == downstreamEpicID {
			// Attempted to add duplicated downstream epic
			return nil
		}
	}

	downstreamEpics = append(downstreamEpics, downstreamEpicID)
	return s.setDownstreamEpicsByID(upstreamEpicID, downstreamEpics)
	// _downStreamsByEpicID[upstreamEpicID] = downstreamEpics
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
			return Epic{}, err
		}
	}

	downstreamEpic.Upstreams = make([]string, 0)
	for _, epic := range upstreamEpics {
		downstreamEpic.Upstreams = append(downstreamEpic.Upstreams, epic.ID)
		err := s.addDownstreamEpic(epic.ID, downstreamEpic.ID)
		if err != nil {
			return Epic{}, err
		}
	}

	return downstreamEpic, nil
}
