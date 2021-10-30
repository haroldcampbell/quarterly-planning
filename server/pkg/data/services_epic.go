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
	var doc EpicDocument

	err := s.collection.FindOne(*s.ctx, bson.M{"epic.id": epic.ID}).Decode(&doc)
	if err != nil {
		utils.Error("services_epics", "Error executing FindOne(...). epic.ID:%v err:%v", epic.ID, err)
		return err
	}
	teamID := doc.Epic.TeamID

	doc.Epic = epic
	doc.Epic.TeamID = teamID

	_, err = s.collection.UpdateOne(*s.ctx, bson.M{"epic.id": epic.ID}, bson.D{{Key: "$set", Value: doc}})
	if err != nil {
		utils.Error("services_epics", "Error executing UpdateOne(...). epic.ID:%v doc:%v err:%v", epic.ID, doc, err)
		return err
	}

	return nil
}

// UpdateEpicsUpstreams will update only the Upstream attribute for the specified epics
func (s *EpicServiceMongo) UpdateEpicsUpstreams(downstreamEpics []Epic) error {
	for _, downstreamEpic := range downstreamEpics {
		update := bson.D{{Key: "epic.upstreams", Value: downstreamEpic.Upstreams}}
		_, err := s.collection.UpdateOne(*s.ctx, bson.M{"epic.id": downstreamEpic.ID}, bson.D{{Key: "$set", Value: update}})
		if err != nil {
			utils.Error("services_epics", "UpdateEpicsUpstreams: Error executing UpdateOne(...). downstreamEpic._id:%v err:%v", downstreamEpic.ID, err)
			return err
		}
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

func (s *EpicServiceMongo) UnlinkEpicAsUpstream(upstreamEpic Epic) error {
	docs, err := s.getEpicDocuments()
	if err != nil {
		utils.Error("services_epics", "RemoveEpicAsUpstream: Calling getEpicDocuments() failed. err:%v", err)
		return err
	}

	for _, downstreamEpicDoc := range docs {
		if downstreamEpicDoc.Upstreams == nil {
			continue
		}

		if found, index := arrayHasElementStr(upstreamEpic.ID, downstreamEpicDoc.Upstreams); found {
			downstreamEpicDoc.Upstreams = append(downstreamEpicDoc.Upstreams[:index], downstreamEpicDoc.Upstreams[index+1:]...)

			update := bson.D{{Key: "epic.upstreams", Value: downstreamEpicDoc.Epic.Upstreams}}
			_, err := s.collection.UpdateOne(*s.ctx, bson.M{"_id": downstreamEpicDoc.DID}, bson.D{{Key: "$set", Value: update}})
			if err != nil {
				utils.Error("services_epics", "RemoveEpicAsUpstream: Error executing UpdateOne(...). downstreamEpicDoc._id:%v doc:%v err:%v", downstreamEpicDoc.ID, downstreamEpicDoc, err)
				return err
			}
		}
	}

	return nil
}
