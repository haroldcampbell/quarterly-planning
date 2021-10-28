package data

type MongoConfig struct {
	IP     string `json:"ip"`
	DbName string `json:"dbName"`
}

func NewMongoConfig(url string, dbName string) *MongoConfig {
	return &MongoConfig{IP: url, DbName: dbName}
}

type ServerConfig struct {
	Port string `json:"port"`
}

type AuthConfig struct {
	Secret string `json:"secret"`
}

type Config struct {
	Mongo  *MongoConfig  `json:"mongo"`
	Server *ServerConfig `json:"server"`
	Auth   *AuthConfig   `json:"auth"`
}
