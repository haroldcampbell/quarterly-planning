package data

import (
	"context"
	"time"

	"github.com/haroldcampbell/go_utils/serverutils"
	"github.com/haroldcampbell/go_utils/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type EpicServiceMongo struct {
	ctx        *context.Context
	collection *mongo.Collection
}

func NewEpicService(session *Session, config *MongoConfig) *EpicServiceMongo {
	indexModel := documentIndex("EpicKey")
	opts := options.CreateIndexes().SetMaxTime(10 * time.Second)
	collection := session.client.Database(config.DbName).Collection("epics")

	collection.Indexes().CreateOne(*session.ctx, indexModel, opts)

	return &EpicServiceMongo{
		ctx:        session.ctx,
		collection: collection,
	}
}

func (s *EpicServiceMongo) CreateEpic(epic *Epic) (string, error) {
	doc := NewEpicDoc(epic)
	doc.DID = primitive.NewObjectID()
	doc.Epic.ID = serverutils.GenerateGUID()

	_, err := s.collection.InsertOne(*s.ctx, doc)

	return doc.Epic.ID, err
}

func (s *EpicServiceMongo) getEpicDocuments() ([]EpicDocument, error) {
	var docs []EpicDocument

	curr, err := s.collection.Find(*s.ctx, NilFilter)
	if err != nil {
		utils.Error("services_epics", "Error executing getEpicDocuments(). err:%v", err)
		return docs, err
	}

	err = curr.All(*s.ctx, &docs)
	if err != nil {
		utils.Error("services_epics", "Error processing curr.All(...). err:%v", err)
		return docs, err
	}

	return docs, nil
}

func (s *EpicServiceMongo) GetEpics() ([]Epic, error) {
	var results []Epic
	var docs []EpicDocument

	docs, err := s.getEpicDocuments()
	if err != nil {
		utils.Error("services_epics", "GetEpics: Calling getEpicDocuments() failed. err:%v", err)
		return results, err
	}

	results = make([]Epic, 0, len(docs))
	for _, doc := range docs {
		results = append(results, doc.ToModel())
	}

	return results, err
}

func (s *EpicServiceMongo) UpdateEpic(epic Epic) error {
	update := bson.D{
		{Key: "epic.name", Value: epic.Name},
		{Key: "epic.expectedstartperiod", Value: epic.ExpectedStartPeriod},
		{Key: "epic.size", Value: epic.Size},
	}

	_, err := s.collection.UpdateOne(*s.ctx, bson.M{"epic.id": epic.ID}, bson.D{{Key: "$set", Value: update}})
	if err != nil {
		utils.Error("services_epics", "Error executing UpdateOne(...). epic.ID:%v err:%v", epic.ID, err)
		return err
	}

	return nil
}

func (s *EpicServiceMongo) GetEpicByID(epicID string) (Epic, error) {
	var doc EpicDocument

	err := s.collection.FindOne(*s.ctx, bson.M{"epic.id": epicID}).Decode(&doc)
	if err != nil {
		utils.Error("services_epics", "Error executing GetEpicByID(). epic.ID:%v err:%v", epicID, err)
		return Epic{}, err
	}

	return doc.ToModel(), nil
}

func (s *EpicServiceMongo) GetEpicsByID(epicIDs []string) ([]Epic, error) {
	filteredEpics := make([]Epic, 0, len(epicIDs))
	for _, epicID := range epicIDs {
		tempEpic, err := s.GetEpicByID(epicID)
		if err != nil {
			utils.Error("services_epics", "Error executing GetEpicsByID(). epicID:%v err:%v", epicID, err)
			return []Epic{}, err
		}
		filteredEpics = append(filteredEpics, tempEpic)
	}

	return filteredEpics, nil
}

func (s EpicServiceMongo) DeleteEpicByEpicID(epicID string) (int64, error) {
	results, err := s.collection.DeleteMany(*s.ctx, bson.M{"epic.id": epicID})
	if err != nil {
		utils.Error("services_epics", "DeleteEpicByID: Error executing DeleteMany(...). epic.id:%v err:%v", epicID, err)
		return results.DeletedCount, err
	}

	utils.Log("services_epics", "DeleteEpicByID(%v) results: %v", epicID, results.DeletedCount)

	return results.DeletedCount, nil
}
