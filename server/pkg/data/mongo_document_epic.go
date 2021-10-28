package data

import (
	"gopkg.in/mgo.v2/bson"
)

type EpicDocument struct {
	DID bson.ObjectId `bson:"_id,omitempty"`

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
