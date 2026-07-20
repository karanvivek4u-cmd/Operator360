# Deploying n8n to Hugging Face Spaces

This folder contains a ready-to-use Dockerfile configured to run **n8n** perfectly on Hugging Face Spaces.

## Instructions

1. Log into your Hugging Face account and go to **New Space** (https://huggingface.co/spaces).
2. Name your space (e.g., `operator360-n8n`).
3. Choose **Docker** as the Space SDK and select **Blank**.
4. Choose the free Tier (or a persistent storage tier if you don't want to re-import your workflows when the space sleeps).
5. Click **Create Space**.
6. Once the space is created, click the **Files** tab.
7. Click **Add file > Upload file**.
8. Upload the `Dockerfile` from this directory directly to the root of your Hugging Face Space.
9. Hugging Face will automatically detect the Dockerfile, build the image, and start n8n.
10. Once it says "Running", click the App link to open your live n8n dashboard!

### Finalizing the Setup
Once you have your Hugging Face n8n URL (e.g., `https://username-operator360-n8n.hf.space`):
1. Open your **n8n dashboard** and import the `backend/n8n/operator360_workflow.json` file.
2. In your newly imported n8n Webhook node, select **Production URL**, copy the URL, and **Activate** the workflow in the top right.
3. Finally, go to your **Vercel** Backend settings and update the `N8N_WEBHOOK_URL` environment variable to match the URL you just copied from n8n.
