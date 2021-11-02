package data

import (
	"context"
	"time"

	"github.com/haroldcampbell/go_utils/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type EpicConnectionServiceMongo struct {
	ctx        *context.Context
	collection *mongo.Collection
}

type EpicConnection struct {
	UpstreamEpicID   string
	DownstreamEpicID string
}

type EpicConnectionDocument struct {
	DID primitive.ObjectID `bson:"_id,omitempty"`

	EpicConnection
}

func NewEpicConnectionDocument(upstreamEpicID string, downstreamEpicID string) *EpicConnectionDocument {
	return &EpicConnectionDocument{
		EpicConnection: EpicConnection{
			UpstreamEpicID:   upstreamEpicID,
			DownstreamEpicID: downstreamEpicID,
		},
	}
}

func (doc *EpicConnectionDocument) ToModel() EpicConnection {
	return doc.EpicConnection
}

func NewEpicConnectionService(session *Session, config *MongoConfig) *EpicConnectionServiceMongo {
	indexModel := documentIndex("EpicConnectionsKey")
	opts := options.CreateIndexes().SetMaxTime(10 * time.Second)
	collection := session.client.Database(config.DbName).Collection("epic_connections")

	collection.Indexes().CreateOne(*session.ctx, indexModel, opts)

	return &EpicConnectionServiceMongo{
		ctx:        session.ctx,
		collection: collection,
	}
}

func (s *EpicConnectionServiceMongo) CreateEpicConnection(upstreamEpicID string, downstreamEpicID string) error {
	doc := NewEpicConnectionDocument(upstreamEpicID, downstreamEpicID)
	doc.DID = primitive.NewObjectID()

	_, err := s.collection.InsertOne(*s.ctx, doc)
	if err != nil {
		utils.Error("services_epic_connections", "Error executing InsertOne(). upstreamEpicID:%v downstreamEpicID:%v err:%v", upstreamEpicID, downstreamEpicID, err)
		return err
	}

	return nil
}

func (s *EpicConnectionServiceMongo) RetrieveAllEpicConnections() ([]EpicConnection, error) {
	var result []EpicConnection
	var docs []EpicConnectionDocument

	curr, err := s.collection.Find(*s.ctx, NilFilter)
	if err != nil {
		return result, err
	}

	err = curr.All(*s.ctx, &docs)
	if err != nil {
		return result, err
	}

	result = make([]EpicConnection, 0, len(docs))
	for _, doc := range docs {
		result = append(result, doc.ToModel())
	}

	return result, err
}

func (s *EpicConnectionServiceMongo) UnlinkEpicConnections(epicID string) error {
	_, err := s.collection.DeleteMany(*s.ctx, bson.M{"epicconnection.upstreamepicid": epicID})
	if err != nil {
		utils.Error("services_epic_connections", "UnlinkEpicConnections: Error executing DeleteMany(...). for epicconnection.upstreamepicid:%v err:%v", epicID, err)
		return err
	}

	_, err = s.collection.DeleteMany(*s.ctx, bson.M{"epicconnection.downstreamepicid": epicID})
	if err != nil {
		utils.Error("services_epic_connections", "UnlinkEpicConnections: Error executing DeleteMany(...). epicconnection.downstreamepicid:%v err:%v", epicID, err)
		return err
	}

	return nil

	// 	utils.Log("services_connection_db", "DeleteConnectionsByEpicID(%v) results: %v", epicID, results.DeletedCount)
}

// func (s *EpicServiceMongo) UnlinkEpicAsUpstreamByEpicID(upstreamEpicID string) error {
// 	docs, err := s.getEpicDocuments()
// 	if err != nil {
// 		utils.Error("services_epics", "UnlinkEpicAsUpstreamByEpicID: Calling getEpicDocuments() failed. err:%v", err)
// 		return err
// 	}

// 	for _, downstreamEpicDoc := range docs {
// 		if downstreamEpicDoc.Upstreams == nil {
// 			continue
// 		}

// 		if found, index := arrayHasElementStr(upstreamEpicID, downstreamEpicDoc.Upstreams); found {
// 			downstreamEpicDoc.Upstreams = append(downstreamEpicDoc.Upstreams[:index], downstreamEpicDoc.Upstreams[index+1:]...)

// 			update := bson.D{{Key: "epic.upstreams", Value: downstreamEpicDoc.Epic.Upstreams}}
// 			_, err := s.collection.UpdateOne(*s.ctx, bson.M{"_id": downstreamEpicDoc.DID}, bson.D{{Key: "$set", Value: update}})
// 			if err != nil {
// 				utils.Error("services_epics", "UnlinkEpicAsUpstreamByEpicID: Error executing UpdateOne(...). downstreamEpicDoc._id:%v doc:%v err:%v", downstreamEpicDoc.ID, downstreamEpicDoc, err)
// 				return err
// 			}
// 		}
// 	}

// 	return nil
// }

// func (s *EpicServiceMongo) UpdateEpicsUpstream(downstreamEpic Epic) error {
// 	update := bson.D{{Key: "epic.upstreams", Value: downstreamEpic.Upstreams}}
// 	_, err := s.collection.UpdateOne(*s.ctx, bson.M{"epic.id": downstreamEpic.ID}, bson.D{{Key: "$set", Value: update}})
// 	if err != nil {
// 		utils.Error("services_epics", "UpdateEpicsUpstream: Error executing UpdateOne(...). downstreamEpic._id:%v err:%v", downstreamEpic.ID, err)
// 		return err
// 	}

// 	return nil
// }

// // UpdateEpicsUpstreams will update only the Upstream attribute for the specified epics
// func (s *EpicServiceMongo) UpdateEpicsUpstreams(downstreamEpics []Epic) error {
// 	for _, downstreamEpic := range downstreamEpics {
// 		err := s.UpdateEpicsUpstream(downstreamEpic)
// 		if err != nil {
// 			return err
// 		}
// 	}

// 	return nil
// }
