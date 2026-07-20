FROM n8nio/n8n:latest

# Hugging Face Spaces run as a non-root user (usually 1000)
# We need to ensure that the node user has the correct permissions
USER root
RUN mkdir -p /home/node/.n8n && chown -R node:node /home/node

# Switch back to the n8n user
USER node

# Hugging Face Spaces route all traffic to port 7860
ENV N8N_PORT=7860
ENV N8N_LISTEN_ADDRESS=0.0.0.0

# Optional: Set this to your HF Space URL later to fix webhook URLs
# ENV WEBHOOK_URL=https://your-space-name.hf.space


