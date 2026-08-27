package storage

import (
	"context"
	"fmt"
	"net/url"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type R2 struct { bucket, publicURL string; presigner *s3.PresignClient }

func NewR2(endpoint, bucket, key, secret, publicURL string) (*R2, error) {
	if endpoint == "" || bucket == "" || key == "" || secret == "" { return nil, fmt.Errorf("R2 storage is not configured") }
	cfg := aws.Config{Region: "auto", Credentials: credentials.NewStaticCredentialsProvider(key, secret, "")}
	cfg.BaseEndpoint = aws.String(endpoint)
	return &R2{bucket: bucket, publicURL: strings.TrimRight(publicURL, "/"), presigner: s3.NewPresignClient(s3.NewFromConfig(cfg))}, nil
}

func (r *R2) PresignPut(ctx context.Context, key, contentType string) (string, string, error) {
	key = strings.TrimPrefix(filepath.Clean("/"+key), "/")
	if key == "" || strings.Contains(key, "..") { return "", "", fmt.Errorf("invalid object key") }
	res, err := r.presigner.PresignPutObject(ctx, &s3.PutObjectInput{Bucket: aws.String(r.bucket), Key: aws.String(key), ContentType: aws.String(contentType)}, func(o *s3.PresignOptions) { o.Expires = 10 * time.Minute })
	if err != nil { return "", "", err }
	segments := strings.Split(key, "/")
	for i, segment := range segments { segments[i] = url.PathEscape(segment) }
	public := r.publicURL + "/" + strings.Join(segments, "/")
	return res.URL, public, nil
}
