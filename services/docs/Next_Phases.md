## PHASE 1 POC [COMPLETED]

See [Phase1.md](Phase1.md) for details.

## PHASE 2 Scalability and DEV Deployment

- Add a scaling service that scales workers up or down depending on the RabbitMQ queue size.
- Add performance tests and groom new tasks based on the results.
  - Consider reducing the output of the `GET` endpoint to serve only public URLs with minimal required business data.
- Add contract testing for RabbitMQ.
- The system currently does not use throttling on `POST` requests but is prepared to do so based on request IP addresses logged for tracking.
- Handle Dead Letter Queues (DLQ) and provide information about items that failed processing.
- Evaluate if the processing service can be more efficient using Fastify or Lambda functions.
- Add a deployment pipeline for AWS using Terraform; adapt MinIO to be replaced with S3 on production while keeping MinIO for local development.
- Add a CDN for image caching.
- Implement a job to remove original images older than 7 days after processing.

## PHASE 3 Monitoring and Security

- Select and implement a monitoring solution.
  - Add service monitoring; use the already implemented `correlationId` to track processing time across both services.
  - Monitor resource utilization relative to traffic in a clear and visible manner.
  - Track all HTTP requests.
  - Consider using reusable monitoring modules across all services, automated with Terraform.
- Add pipelines for scanning built images for CVE vulnerabilities.
- Review OWASP Top 10 and other relevant security standards.
