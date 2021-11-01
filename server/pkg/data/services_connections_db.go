package data

import (
	"context"
	"time"

	"github.com/haroldcampbell/go_utils/utils"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gopkg.in/mgo.v2/bson"
)

type DownstreamServiceMongo struct {
	ctx        *context.Context
	collection *mongo.Collection
}

type DownstreamDocument struct {
	DID bson.ObjectId `bson:"_id,omitempty"` // DocumentID

	EpicID            string
	DownstreamEpicIDs []string
}

func NewDownstreamService(session *Session, config *MongoConfig) *DownstreamServiceMongo {
	indexModel := documentIndex("DownstreamKey")
	opts := options.CreateIndexes().SetMaxTime(10 * time.Second)
	collection := session.client.Database(config.DbName).Collection("downstreams")

	collection.Indexes().CreateOne(*session.ctx, indexModel, opts)

	return &DownstreamServiceMongo{
		ctx:        session.ctx,
		collection: collection,
	}
}

func (s *DownstreamServiceMongo) getDownstreamEpicsByID(epicID string) ([]string, error) {
	var docs []DownstreamDocument
	var results []string

	curr, err := s.collection.Find(*s.ctx, bson.M{"epicid": epicID})
	if err != nil {
		utils.Error("services_connections_db", "Error executing getDownstreamEpicsByID(). epicID:%v err:%v", epicID, err)
		return results, err
	}

	err = curr.All(*s.ctx, &docs)
	if err != nil {
		utils.Error("services_connections_db", "Error executing curr.All(...). epicID:%v err:%v", epicID, err)
		return results, err
	}

	results = make([]string, 0, len(docs))
	for _, doc := range docs {
		results = append(results, doc.EpicID)
	}

	return results, nil
}

func (s *DownstreamServiceMongo) setDownstreamEpicsByID(epicID string, IDs []string) error {
	var doc = DownstreamDocument{
		EpicID:            epicID,
		DownstreamEpicIDs: IDs,
	}

	opts := options.FindOneAndReplace().SetUpsert(true)
	result := s.collection.FindOneAndReplace(*s.ctx, bson.M{"epicid": epicID}, doc, opts)
	err := result.Err()
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil
		}
		utils.Error("services_connection_db", "Error executing FindOneAndReplace(...). epicID:%v err:%v", epicID, err)
		return err
	}

	return nil
}

func (s *DownstreamServiceMongo) DeleteConnectionsByEpicID(epicID string) (int64, error) {
	results, err := s.collection.DeleteMany(*s.ctx, bson.M{"epicid": epicID})
	if err != nil {
		utils.Error("services_connection_db", "DeleteConnectionsByEpicID: Error executing DeleteMany(...). epicid:%v err:%v", epicID, err)
		return results.DeletedCount, err
	}

	utils.Log("services_connection_db", "DeleteConnectionsByEpicID(%v) results: %v", epicID, results.DeletedCount)

	return results.DeletedCount, nil

}
