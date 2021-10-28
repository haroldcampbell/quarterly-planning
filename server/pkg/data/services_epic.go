package data

import (
	"github.com/haroldcampbell/go_utils/serverutils"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// type EpicService interface {
// 	CreateEpic(epic *Epic) (string, error)
// 	GetEpics() ([]Epic, error)
// }

type EpicServiceMongo struct {
	collection *mgo.Collection
}

func NewEpicService(session *mgo.Session, config *MongoConfig) *EpicServiceMongo {
	collection := session.DB(config.DbName).C("epics")
	collection.EnsureIndex(documentIndex("EpicKey"))

	return &EpicServiceMongo{collection: collection}
}

func (s *EpicServiceMongo) CreateEpic(epic *Epic) (string, error) {
	doc := NewEpicDoc(epic)
	doc.DID = bson.NewObjectId()
	doc.Epic.ID = serverutils.GenerateGUID()

	return doc.Epic.ID, s.collection.Insert(doc)
}

func (s *EpicServiceMongo) GetEpics() ([]Epic, error) {
	var docs []EpicDocument

	err := s.collection.Find(nil).All(&docs)
	result := make([]Epic, 0, len(docs))

	for _, doc := range docs {
		result = append(result, doc.ToModel())
	}

	return result, err
}

func (s *EpicServiceMongo) UpdateEpic(epic Epic) error {
	var doc EpicDocument

	err := s.collection.Find(bson.M{"epic.id": epic.ID}).One(&doc)
	if err != nil {
		return err
	}
	teamID := doc.Epic.TeamID

	doc.Epic = epic
	doc.Epic.TeamID = teamID

	return s.collection.Update(bson.M{"epic.id": epic.ID}, doc)
}

func (s *EpicServiceMongo) GetEpicByID(epicID string) (Epic, error) {
	var doc EpicDocument

	err := s.collection.Find(bson.M{"epic.id": epicID}).One(&doc)
	if err != nil {
		return Epic{}, err
	}

	return doc.ToModel(), nil
}

func (s *EpicServiceMongo) GetEpicsByID(upstreamEpicIDs []string) ([]Epic, error) {
	upstreamEpics := make([]Epic, 0, len(upstreamEpicIDs))
	for _, epicID := range upstreamEpicIDs {
		tempEpic, err := s.GetEpicByID(epicID)
		if err != nil {
			return []Epic{}, err
		}
		upstreamEpics = append(upstreamEpics, tempEpic)
	}

	return upstreamEpics, nil
}
