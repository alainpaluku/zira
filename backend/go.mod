module github.com/zira-invest/backend

go 1.25

require (
	github.com/aws/aws-sdk-go-v2 v1.36.3
	github.com/aws/aws-sdk-go-v2/credentials v1.17.56
	github.com/aws/aws-sdk-go-v2/service/s3 v1.79.1
	github.com/gin-gonic/gin v1.10.0
	github.com/golang-jwt/jwt/v5 v5.2.2
	github.com/google/uuid v1.6.0
	github.com/jackc/pgx/v5 v5.7.1
)

replace github.com/go-playground/validator/v10 => ./internal/compat/validator
