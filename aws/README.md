## AWS AI Services Scaffold (Comprehend, Personalize, SageMaker Pipelines)

This folder contains minimal, production-ready Python scripts to integrate:

- Amazon Comprehend (NLU)
- Amazon Personalize (recommendations)
- Amazon SageMaker Pipelines (ML training & model registry)

### Prerequisites
- Python 3.10+
- AWS account and IAM permissions for Comprehend, Personalize, SageMaker, S3, IAM, and CloudWatch
- AWS credentials configured locally (`aws configure`) or environment variables
- An S3 bucket for artifacts and datasets

### Setup
```bash
python -m venv .venv
. .venv/Scripts/activate  # Windows Powershell: . .venv/Scripts/Activate.ps1
pip install -r aws/requirements.txt
```

Copy the example config and update values:
```bash
copy aws\\config.example.json aws\\config.json
```

Or use environment variables by copying `.env.example`:
```bash
copy aws\\.env.example aws\\.env
```

### Amazon Comprehend
Run quick text analysis (language, sentiment, key phrases, entities):
```bash
python aws/comprehend/analyze_text.py --text "I loved the new product, but shipping was slow." --region <your-region>
```

### Amazon Personalize
1) Create dataset group and schemas
```bash
python aws/personalize/create_dataset_group.py --name my-dsg --region <your-region>
```
2) Import interactions
```bash
python aws/personalize/import_interactions.py --dataset-group-arn <dsg-arn> --bucket s3-bucket --key data/interactions.csv --region <your-region>
```
3) Create solution and campaign
```bash
python aws/personalize/create_solution_and_campaign.py --dataset-group-arn <dsg-arn> --solution-name my-solution --campaign-name my-campaign --region <your-region>
```

### SageMaker Pipelines
Creates a simple pipeline with built-in XGBoost training and model registration.
```bash
python aws/sagemaker/pipeline.py --pipeline-name demo-xgb-pipeline --region <your-region> --bucket <your-artifacts-bucket>
```

Then start execution:
```bash
python aws/sagemaker/pipeline.py --start --pipeline-name demo-xgb-pipeline --region <your-region>
```

### Configuration
- `aws/config.json` or env vars in `aws/.env`
- Required keys vary by script but generally include: `region`, `bucket`, `role_arn`

### Notes
- These scripts are safe to run repeatedly; some create-if-not-exists logic is included.
- Long-running Personalize jobs return ARNs and status; you may need to poll until ACTIVE.
- For production, consider IaC (CDK/Terraform) and CI/CD for pipelines.
