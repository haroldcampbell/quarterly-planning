package data

import "go.mongodb.org/mongo-driver/bson/primitive"

type EpicDocument struct {
	DID primitive.ObjectID `bson:"_id,omitempty"`

	Epic
}

func NewEpicDoc(doc *Epic) *EpicDocument {
	return &EpicDocument{
		Epic: *doc,
	}
}

func (doc *EpicDocument) ToModel() Epic {
	return doc.Epic
}
